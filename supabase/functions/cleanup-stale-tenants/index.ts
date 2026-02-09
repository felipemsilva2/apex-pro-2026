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
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        console.log("Starting stale tenants cleanup...")

        // 1. Fetch tenants in 'pending' status older than 7 days
        const { data: staleTenants, error: fetchError } = await supabaseAdmin
            .from('tenants')
            .select('id, business_name')
            .eq('subscription_status', 'pending')
            .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        if (fetchError) throw fetchError

        console.log(`Found ${staleTenants?.length || 0} stale pending tenants.`)

        if (staleTenants && staleTenants.length > 0) {
            for (const tenant of staleTenants) {
                console.log(`Cleaning up tenant: ${tenant.business_name} (${tenant.id})`)

                // A. Get associated profiles (to get auth IDs)
                const { data: profiles } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('tenant_id', tenant.id)

                // B. Delete Auth Users
                if (profiles && profiles.length > 0) {
                    for (const profile of profiles) {
                        console.log(`Deleting auth user: ${profile.id}`)
                        await supabaseAdmin.auth.admin.deleteUser(profile.id)
                            .catch(e => console.error(`Error deleting user ${profile.id}:`, e.message))
                    }
                }

                // C. Delete Tenant (Profiles and other data should cascade if FKs are set, but we be explicit if needed)
                // Assuming CASCADE on delete is set for profiles and asaas_customers mappings.
                const { error: deleteError } = await supabaseAdmin
                    .from('tenants')
                    .delete()
                    .eq('id', tenant.id)

                if (deleteError) {
                    console.error(`Error deleting tenant ${tenant.id}:`, deleteError.message)
                } else {
                    console.log(`Successfully deleted tenant ${tenant.id}`)
                }
            }
        }

        // 2. Fetch and Cleanup 'Orphaned' Tenants (No coaches associated)
        console.log("Starting cleanup for orphaned tenants (no coaches)...")
        const { data: allTenants } = await supabaseAdmin.from('tenants').select('id, business_name')

        if (allTenants) {
            for (const tenant of allTenants) {
                const { count } = await supabaseAdmin
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', tenant.id)
                    .eq('role', 'coach')

                if (count === 0) {
                    console.log(`Cleaning up orphaned tenant: ${tenant.business_name} (${tenant.id})`)
                    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Cleaned up ${staleTenants?.length || 0} tenants.`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Cleanup error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
