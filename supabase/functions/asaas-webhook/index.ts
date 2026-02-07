import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN') || ''

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // Verify webhook token (Asaas sends it in 'asaas-access-token' header usually)
        const token = req.headers.get('asaas-access-token')
        if (ASAAS_WEBHOOK_TOKEN && token !== ASAAS_WEBHOOK_TOKEN) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { event, payment, subscription: subDetail } = body

        console.log(`[Asaas Webhook] Event: ${event}`, body)

        if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
            const subscriptionId = payment.subscription
            const tenantId = payment.externalReference

            if (subscriptionId) {
                // Update subscription status and period
                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        current_period_end: new Date(payment.dueDate).toISOString() // Simplified logic
                    })
                    .eq('asaas_id', subscriptionId)
            }

            if (tenantId) {
                // Reactivate tenant
                await supabaseAdmin
                    .from('tenants')
                    .update({
                        subscription_status: 'active',
                        overdue_since: null
                    })
                    .eq('id', tenantId)
            }
        }

        if (event === 'PAYMENT_OVERDUE') {
            const tenantId = payment.externalReference

            if (tenantId) {
                await supabaseAdmin
                    .from('tenants')
                    .update({
                        subscription_status: 'past_due',
                        overdue_since: new Date().toISOString()
                    })
                    .eq('id', tenantId)

                // Here we could trigger a notification/email via another service
            }
        }

        if (event === 'SUBSCRIPTION_DELETED') {
            const subscriptionId = subDetail.id
            const tenantId = subDetail.externalReference

            if (subscriptionId) {
                await supabaseAdmin
                    .from('subscriptions')
                    .update({ status: 'deleted' })
                    .eq('asaas_id', subscriptionId)
            }

            if (tenantId) {
                await supabaseAdmin
                    .from('tenants')
                    .update({ subscription_status: 'canceled' })
                    .eq('id', tenantId)
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('[Asaas Webhook Error]', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
