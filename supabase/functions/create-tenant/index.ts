import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        // Admin client to bypass RLS and create everything
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const { fullName, username, password, businessName } = await req.json()

        if (!fullName || !username || !password || !businessName) {
            throw new Error('Campos obrigatórios ausentes: Nome, Usuário, Senha e Nome da Marca são necessários.')
        }

        // 1. Construct Phantom Email
        const phantomEmail = `${username.toLowerCase()}@managed.nutripro.pro`

        // 2. Check if username/email already exists
        const { data: existingUser } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', phantomEmail)
            .maybeSingle()

        if (existingUser) {
            return new Response(JSON.stringify({ error: 'Este nome de usuário já está em uso.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 3. Create Tenant First
        const { data: tenantData, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                business_name: businessName,
                subdomain: username.toLowerCase().replace(/[^a-z0-9]/g, ''),
                plan_tier: 'pro'
            })
            .select()
            .single()

        if (tenantError) throw tenantError

        const tenantId = tenantData.id

        // 4. Create User in auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: phantomEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                managed: true,
                role: 'coach',
                tenant_id: tenantId
            }
        })

        if (authError) {
            // Rollback tenant
            await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
            throw authError
        }

        const userId = authUser.user.id

        return new Response(JSON.stringify({ success: true, userId, tenantId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
