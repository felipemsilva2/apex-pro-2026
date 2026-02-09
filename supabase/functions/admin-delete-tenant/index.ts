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

        const { tenantId } = await req.json()

        if (!tenantId) {
            throw new Error('tenantId é obrigatório.')
        }

        console.log(`[admin-delete-tenant] Starting deletion for tenant: ${tenantId}`)

        // 1. Get all profiles associated with this tenant
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('tenant_id', tenantId)

        if (profilesError) {
            console.error('[admin-delete-tenant] Error fetching profiles:', profilesError)
            throw new Error(`Erro ao buscar perfis vinculados: ${profilesError.message}`)
        }

        console.log(`[admin-delete-tenant] Found ${profiles?.length || 0} users to delete.`)

        // 2. Delete each user from Supabase Auth
        if (profiles && profiles.length > 0) {
            for (const profile of profiles) {
                console.log(`[admin-delete-tenant] Deleting auth user: ${profile.id}`)
                const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(profile.id)
                if (authError) {
                    console.warn(`[admin-delete-tenant] Warning deleting auth user ${profile.id}:`, authError.message)
                    // We continue even if one user fails (e.g., already deleted)
                }
            }
        }

        // 3. Delete the tenant record
        // Associated profiles, clients, and app data should cascade if FKs are set to CASCADE
        // Profiles are already mostly "shadows" after auth deletion, but we ensure the tenant goes away.
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
