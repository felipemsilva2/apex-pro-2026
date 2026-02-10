import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Verify if requester is admin
        const authHeader = req.headers.get('Authorization')!
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

        if (authError || !user) throw new Error('Não autorizado')

        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') throw new Error('Acesso restrito a administradores')

        const { tenantId, planId, status, billingType, monthsToAdd } = await req.json()

        if (!tenantId) throw new Error('tenantId é obrigatório')

        console.log(`[admin-manage-subscription] Managing subscription for tenant: ${tenantId}`)

        // Calculate end date if adding months
        let currentPeriodEnd = null
        if (monthsToAdd) {
            const date = new Date()
            date.setMonth(date.getMonth() + monthsToAdd)
            currentPeriodEnd = date.toISOString()
        }

        // Upsert subscription
        const { data, error: upsertError } = await supabaseAdmin
            .from('subscriptions')
            .upsert({
                tenant_id: tenantId,
                plan_id: planId,
                status: status || 'ACTIVE',
                billing_type: billingType || 'MANUAL',
                ...(currentPeriodEnd && { current_period_end: currentPeriodEnd }),
                updated_at: new Date().toISOString()
            }, { onConflict: 'tenant_id' })
            .select()
            .single()

        if (upsertError) throw upsertError

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('[admin-manage-subscription] Error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
