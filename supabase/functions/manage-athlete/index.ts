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

        // Admin client to bypass RLS and create users
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const { fullName, username, password, tenantId, role = 'client' } = await req.json()

        if (!fullName || !username || !password || !tenantId) {
            throw new Error('Campos obrigatórios ausentes.')
        }

        // 1. Construct Phantom Email
        const phantomEmail = `${username.toLowerCase()}@acesso.apexpro.fit`

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

        // 3. Create User in auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: phantomEmail,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: fullName, managed: true, role: role }
        })

        if (authError) throw authError

        const userId = authUser.user.id

        // 4. Create Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                full_name: fullName,
                email: phantomEmail,
                role: role,
                tenant_id: tenantId
            })

        if (profileError) {
            // Rollback auth user
            await supabaseAdmin.auth.admin.deleteUser(userId)
            throw profileError
        }

        // 5. Create Client record (ONLY if role is client)
        if (role === 'client') {
            const { error: clientError } = await supabaseAdmin
                .from('clients')
                .insert({
                    user_id: userId,
                    tenant_id: tenantId,
                    full_name: fullName,
                    email: phantomEmail,
                    status: 'active'
                })

            if (clientError) {
                // Rollback profile and user
                await supabaseAdmin.from('profiles').delete().eq('id', userId)
                await supabaseAdmin.auth.admin.deleteUser(userId)
                throw clientError
            }
        }

        return new Response(JSON.stringify({ success: true, userId }), {
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
