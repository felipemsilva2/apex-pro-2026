import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') || ''
const IS_PROD = ASAAS_API_KEY.startsWith('$aact_prod_')
const ASAAS_API_URL = Deno.env.get('ASAAS_API_URL') || (IS_PROD ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3')

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('No authorization header')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw new Error('Invalid token')

        // Get tenant info
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('tenant_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'coach' && profile.role !== 'admin') {
            throw new Error('Unauthorized: Only coaches can access billing')
        }

        const tenantId = profile.tenant_id
        const { action, payload } = await req.json()

        if (action === 'create-customer') {
            const { name, email, cpfCnpj, phone } = payload

            // Check if already has Asaas ID
            const { data: existingCustomer } = await supabaseAdmin
                .from('asaas_customers')
                .select('asaas_id')
                .eq('tenant_id', tenantId)
                .maybeSingle()

            if (existingCustomer) {
                return new Response(JSON.stringify({ asaasId: existingCustomer.asaas_id }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            // Create in Asaas
            const asaasResponse = await fetch(`${ASAAS_API_URL}/customers`, {
                method: 'POST',
                headers: {
                    'access_token': ASAAS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    cpfCnpj,
                    mobilePhone: phone,
                    externalReference: tenantId
                })
            })

            const asaasData = await asaasResponse.json()
            if (!asaasResponse.ok) throw new Error(asaasData.errors?.[0]?.description || 'Error creating customer in Asaas')

            // Save relationship
            await supabaseAdmin.from('asaas_customers').insert({
                tenant_id: tenantId,
                asaas_id: asaasData.id
            })

            // Update tenant billing email
            await supabaseAdmin.from('tenants').update({ billing_email: email }).eq('id', tenantId)

            return new Response(JSON.stringify({ asaasId: asaasData.id }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (action === 'get-pix-qr-code') {
            const { paymentId } = payload
            const asaasResponse = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
                method: 'GET',
                headers: { 'access_token': ASAAS_API_KEY }
            })
            const asaasData = await asaasResponse.json()
            if (!asaasResponse.ok) throw new Error(asaasData.errors?.[0]?.description || 'Error fetching PIX QR Code')

            return new Response(JSON.stringify(asaasData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (action === 'create-subscription') {
            const { planType, creditCard, asaasId } = payload // planType: 'MENSAL' | 'ANUAL'

            // Get Plan Info
            const { data: plan } = await supabaseAdmin
                .from('billing_plans')
                .select('*')
                .limit(1)
                .single()

            if (!plan) throw new Error('No billing plans found in database')

            // Get Tenant Trial Info
            const { data: tenantTrial } = await supabaseAdmin
                .from('tenants')
                .select('trial_used')
                .eq('id', tenantId)
                .single()

            const value = planType === 'MENSAL' ? plan.price_monthly : plan.price_yearly
            const isTrialable = !!creditCard && !tenantTrial?.trial_used // Only credit card gets trial, and only once

            const nextDueDate = new Date()
            if (isTrialable) {
                // For trial: first payment is 31 days from now
                nextDueDate.setDate(nextDueDate.getDate() + 31)
            } else {
                // For Pix or returning credit card: first payment is tomorrow
                nextDueDate.setDate(nextDueDate.getDate() + 1)
            }

            const subPayload: any = {
                customer: asaasId,
                billingType: creditCard ? 'CREDIT_CARD' : 'PIX',
                value: value,
                nextDueDate: nextDueDate.toISOString().split('T')[0],
                cycle: planType === 'MENSAL' ? 'MONTHLY' : 'YEARLY',
                description: `Assinatura ${plan.name} - ${planType}`,
                externalReference: tenantId
            }

            if (isTrialable) {
                subPayload.trialPeriodDuration = 30
                subPayload.creditCard = creditCard
                subPayload.creditCardHolderInfo = payload.holderInfo
            }

            const asaasResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
                method: 'POST',
                headers: {
                    'access_token': ASAAS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subPayload)
            })

            const asaasData = await asaasResponse.json()
            if (!asaasResponse.ok) throw new Error(asaasData.errors?.[0]?.description || 'Error creating subscription in Asaas')

            // Save subscription in DB
            await supabaseAdmin.from('subscriptions').insert({
                tenant_id: tenantId,
                plan_id: plan.id,
                asaas_id: asaasData.id,
                status: isTrialable ? 'trialing' : 'pending',
                billing_type: planType,
                current_period_end: nextDueDate.toISOString()
            })

            // Update tenant status and trial usage
            const updatePayload: any = {
                subscription_status: isTrialable ? 'trialing' : 'pending'
            }
            if (isTrialable) {
                updatePayload.trial_end = nextDueDate.toISOString()
                updatePayload.trial_used = true
            }

            await supabaseAdmin.from('tenants').update(updatePayload).eq('id', tenantId)

            return new Response(JSON.stringify(asaasData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        throw new Error('Action not supported')

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
