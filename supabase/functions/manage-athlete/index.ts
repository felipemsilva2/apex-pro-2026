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

        // --- MANUAL AUTH VERIFICATION (DEBUGGING) ---
        // We disabled verify_jwt in deployment to catch the specific error here.
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Authorization header missing')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

        if (userError || !userData.user) {
            console.error('AUTH VERIFICATION FAILED:', userError)
            return new Response(JSON.stringify({
                error: 'Authentication failed',
                details: userError,
                debug: 'Manual JWT verification failed inside Edge Function'
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
        // --------------------------------------------

        const { fullName, username, password, tenantId, role = 'client', email: directEmail } = await req.json()

        if (!fullName || (!username && !directEmail) || !password || !tenantId) {
            throw new Error('Campos obrigatórios ausentes.')
        }

        // 1. Identify Target Email
        const targetEmail = directEmail || `${username.toLowerCase()}@acesso.apexpro.fit`

        // 2. Check if user already exists
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError

        const existingUser = listData.users.find((u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase())

        if (existingUser) {
            // UPDATE EXISTING USER
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password: password,
                user_metadata: {
                    full_name: fullName,
                    managed: true,
                    role: role,
                    tenant_id: tenantId
                }
            })

            if (updateError) throw updateError

            // Update profile as well to be sure
            await supabaseAdmin
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', existingUser.id)

            return new Response(JSON.stringify({ success: true, userId: existingUser.id, updated: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // 3. Create User in auth.users
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: targetEmail,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                managed: true,
                role: role,
                tenant_id: tenantId
            }
        })

        if (createError) throw createError

        const userId = authUser.user.id

        // 4. Create Profile & Client
        // REMOVED: Managed by trigger 'on_auth_user_created' -> 'handle_new_user'
        // This avoids race conditions and duplicate key errors.

        return new Response(JSON.stringify({ success: true, userId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('CRITICAL ERROR in manage-athlete:', error)
        return new Response(JSON.stringify({ error: error.message, details: error }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
