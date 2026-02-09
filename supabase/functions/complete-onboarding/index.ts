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
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] --- Edge Function Start ---`)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        const payload = await req.json()
        const { account, payment, plan } = payload
        const { fullName, email, password, businessName } = account
        const { paymentMethod, creditCard, holderInfo, cpfCnpj } = payment
        const { cycle } = plan

        console.log(`[${requestId}] Payload received for:`, email)
        console.log(`[${requestId}] Method:`, paymentMethod)

        // 1. Validations
        if (!fullName || !email || !password || !businessName) {
            throw new Error('Campos de conta obrigatórios ausentes.')
        }

        const isManaged = !email.includes('@')
        const phantomEmail = isManaged ? `${email.trim().toLowerCase()}@acesso.apexpro.fit` : email.trim()

        let tenantId: string | null = null
        let userId: string | null = null

        try {
            // STEP A: Create Tenant
            console.log(`[${requestId}] Creating Tenant...`)
            const subdomain = email.toLowerCase().replace(/[^a-z0-9]/g, '')

            // Check for collision
            const { data: existingTenant } = await supabaseAdmin
                .from('tenants')
                .select('id')
                .eq('subdomain', subdomain)
                .maybeSingle()

            if (existingTenant) {
                throw new Error('Este nome de usuário ou subdomínio já está em uso. Por favor, escolha outro.')
            }

            const { data: tenantData, error: tenantError } = await supabaseAdmin
                .from('tenants')
                .insert({
                    business_name: businessName,
                    subdomain,
                    plan_tier: 'pro',
                    subscription_status: 'pending'
                })
                .select()
                .single()

            if (tenantError) {
                console.error(`[${requestId}] Tenant Creation Error:`, tenantError)
                throw new Error(`Erro ao criar tenant: ${tenantError.message}`)
            }
            tenantId = tenantData.id

            // STEP B: Create Auth User
            console.log(`[${requestId}] Creating Auth User...`)
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: phantomEmail,
                password: password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    managed: isManaged,
                    role: 'coach',
                    tenant_id: tenantId
                }
            })

            if (authError) {
                console.error(`[${requestId}] Auth User Creation Error:`, authError)
                throw new Error(`Erro ao criar usuário: ${authError.message}`)
            }
            userId = authUser.user.id

            // STEP D: Create Asaas Customer
            console.log(`[${requestId}] Creating Asaas Customer...`)
            const asaasCustomerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
                method: 'POST',
                headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email: phantomEmail,
                    cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                    externalReference: tenantId
                })
            })

            const asaasCustomerData = await asaasCustomerResponse.json()
            if (!asaasCustomerResponse.ok) {
                console.error(`[${requestId}] Asaas Customer API Error:`, JSON.stringify(asaasCustomerData))
                const asaasError = asaasCustomerData.errors?.[0]?.description || 'Erro ao criar cliente no Asaas'
                throw new Error(`Asaas Customer: ${asaasError}`)
            }

            const asaasCustomerId = asaasCustomerData.id
            console.log(`[${requestId}] Asaas Customer Created:`, asaasCustomerId)

            await supabaseAdmin.from('asaas_customers').insert({
                tenant_id: tenantId,
                asaas_id: asaasCustomerId
            })

            // STEP E: Get Plan Info
            const { data: dbPlan } = await supabaseAdmin
                .from('billing_plans')
                .select('*')
                .limit(1)
                .single()

            if (!dbPlan) throw new Error('Plano não encontrado no banco de dados.')

            const value = cycle === 'MENSAL' ? dbPlan.price_monthly : dbPlan.price_yearly
            const isTrialable = paymentMethod === 'CREDIT_CARD'
            const nextDueDate = new Date()
            nextDueDate.setDate(nextDueDate.getDate() + (isTrialable ? 31 : 1))

            console.log(`[${requestId}] Creating Asaas ${paymentMethod === 'PIX' ? 'Payment' : 'Subscription'}...`)

            let asaasServiceResponse;
            if (paymentMethod === 'PIX') {
                const paymentPayload = {
                    customer: asaasCustomerId,
                    billingType: 'PIX',
                    value: value,
                    dueDate: nextDueDate.toISOString().split('T')[0],
                    description: `Licença ${dbPlan.name} - ${cycle}`,
                    externalReference: tenantId
                }
                asaasServiceResponse = await fetch(`${ASAAS_API_URL}/payments`, {
                    method: 'POST',
                    headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentPayload)
                })
            } else {
                const subPayload: any = {
                    customer: asaasCustomerId,
                    billingType: paymentMethod,
                    value: value,
                    nextDueDate: nextDueDate.toISOString().split('T')[0],
                    cycle: cycle === 'MENSAL' ? 'MONTHLY' : 'YEARLY',
                    description: `Assinatura ${dbPlan.name} - ${cycle}`,
                    externalReference: tenantId,
                    trialPeriodDuration: 30,
                    creditCard: creditCard,
                    creditCardHolderInfo: holderInfo
                }
                asaasServiceResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
                    method: 'POST',
                    headers: { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify(subPayload)
                })
            }

            const asaasServiceData = await asaasServiceResponse.json()
            if (!asaasServiceResponse.ok) {
                console.error(`[${requestId}] Asaas Service API Error:`, JSON.stringify(asaasServiceData))
                const serviceName = paymentMethod === 'PIX' ? 'Payment' : 'Subscription'
                const asaasError = asaasServiceData.errors?.[0]?.description || `Erro ao criar ${serviceName}`
                throw new Error(`Asaas ${serviceName}: ${asaasError}`)
            }

            console.log(`[${requestId}] Asaas Service Success:`, asaasServiceData.id)

            let pixData = null;
            if (paymentMethod === 'PIX') {
                console.log(`[${requestId}] Fetching PIX QR Code for payment:`, asaasServiceData.id)
                try {
                    const pixResponse = await fetch(`${ASAAS_API_URL}/payments/${asaasServiceData.id}/pixQrCode`, {
                        method: 'GET',
                        headers: { 'access_token': ASAAS_API_KEY }
                    })

                    const pixResult = await pixResponse.json()
                    if (!pixResponse.ok) {
                        console.error(`[${requestId}] Asaas PIX API Error:`, JSON.stringify(pixResult))
                        // We don't throw here to avoid full rollback if the payment was successful, 
                        // but we will log it. However, since the user needs the QR code now, 
                        // we might want to reconsider. For now, let's throw to ensure a clean state if QR fails.
                        throw new Error(`Erro ao gerar QR Code PIX: ${pixResult.errors?.[0]?.description || 'Erro desconhecido'}`)
                    }
                    pixData = pixResult
                    console.log(`[${requestId}] PIX QR Code fetched successfully.`)
                } catch (pixErr: any) {
                    console.error(`[${requestId}] PIX Fetch Exception:`, pixErr.message)
                    throw pixErr
                }
            }

            // STEP F: Sync Final Status
            console.log(`[${requestId}] Syncing final status to DB...`)
            const { error: subError } = await supabaseAdmin.from('subscriptions').insert({
                tenant_id: tenantId,
                plan_id: dbPlan.id,
                asaas_id: asaasServiceData.id,
                status: isTrialable ? 'trialing' : 'pending',
                billing_type: cycle,
                current_period_end: nextDueDate.toISOString()
            })

            if (subError) {
                console.error(`[${requestId}] Subscription Sync Error:`, subError)
                throw new Error(`Erro ao salvar assinatura: ${subError.message}`)
            }

            if (isTrialable) {
                await supabaseAdmin.from('tenants').update({
                    subscription_status: 'trialing',
                    trial_end: nextDueDate.toISOString()
                }).eq('id', tenantId)
            }

            console.log(`[${requestId}] Integration Complete.`)
            return new Response(JSON.stringify({
                success: true,
                tenantId,
                userId,
                identification: email,
                pixData
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })

        } catch (innerError: any) {
            console.error(`[${requestId}] Rollback triggered due to:`, innerError.message)

            // Step-by-step rollback with safety
            if (userId) {
                console.log(`[${requestId}] Rolling back User:`, userId)
                await supabaseAdmin.auth.admin.deleteUser(userId)
                    .catch(e => console.error(`[${requestId}] Rollback User Error:`, e.message))
            }

            if (tenantId) {
                console.log(`[${requestId}] Rolling back Tenant:`, tenantId)
                // Delete profiles first because of foreign key constraint
                await supabaseAdmin.from('profiles').delete().eq('tenant_id', tenantId)
                    .catch(e => console.error(`[${requestId}] Rollback Profiles Error:`, e.message))

                await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
                    .catch(e => console.error(`[${requestId}] Rollback Tenant Error:`, e.message))
            }

            throw innerError
        }

    } catch (error: any) {
        console.error(`[${requestId}] Function Error:`, error.message)
        return new Response(JSON.stringify({
            error: error.message,
            technical: error.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
