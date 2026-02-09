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

        // Create Admin client (Service Role)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // 1. Verify Requesting User's Role (Internal Security)
        const authHeader = req.headers.get('Authorization')!
        const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: authError } = await userClient.auth.getUser()
        if (authError || !user) throw new Error('Não autorizado.')

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            throw new Error('Acesso negado. Apenas administradores master podem remover ambientes.')
        }

        const { tenantId } = await req.json()

        if (!tenantId) {
            throw new Error('tenantId é obrigatório.')
        }

        console.log(`[admin-delete-tenant] Starting deletion for tenant: ${tenantId} requested by ${user.id}`)

        // 2. Get all profiles associated with this tenant
        const { data: victims, error: victimsError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('tenant_id', tenantId)

        if (victimsError) {
            console.error('[admin-delete-tenant] Error fetching victims:', victimsError)
            throw new Error(`Erro ao buscar perfis vinculados: ${victimsError.message}`)
        }

        console.log(`[admin-delete-tenant] Found ${victims?.length || 0} users to delete.`)

        // 3. Delete each user from Supabase Auth
        if (victims && victims.length > 0) {
            for (const victim of victims) {
                console.log(`[admin-delete-tenant] Deleting auth user: ${victim.id}`)
                const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(victim.id)
                if (deleteAuthError) {
                    console.warn(`[admin-delete-tenant] Warning deleting auth user ${victim.id}:`, deleteAuthError.message)
                }
            }
        }

        // 4. Delete the tenant record
        const { error: tenantDeleteError } = await supabaseAdmin
            .from('tenants')
            .delete()
            .eq('id', tenantId)

        if (tenantDeleteError) {
            console.error('[admin-delete-tenant] Error deleting tenant record:', tenantDeleteError)
            throw new Error(`Erro ao deletar registro do ambiente: ${tenantDeleteError.message}`)
        }

        console.log(`[admin-delete-tenant] Tenant ${tenantId} and associated users deleted successfully.`)

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('[admin-delete-tenant] Final error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
