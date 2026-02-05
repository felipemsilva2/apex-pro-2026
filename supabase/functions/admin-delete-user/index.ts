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

        const { userId } = await req.json()

        if (!userId) {
            throw new Error('userId é obrigatório.')
        }

        console.log(`[admin-delete-user] Starting deletion for user: ${userId}`)

        // 1. Delete from clients table (if exists)
        const { error: clientsError } = await supabaseAdmin
            .from('clients')
            .delete()
            .eq('user_id', userId)

        if (clientsError) {
            console.warn('[admin-delete-user] Warning deleting clients:', clientsError.message)
        }

        // 2. Delete from profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('[admin-delete-user] Error deleting profile:', profileError)
            throw new Error(`Erro ao deletar perfil: ${profileError.message}`)
        }

        // 3. Delete from auth.users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) {
            console.error('[admin-delete-user] Error deleting auth user:', authError)
            throw new Error(`Erro ao deletar usuário: ${authError.message}`)
        }

        console.log(`[admin-delete-user] User ${userId} deleted successfully`)

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('[admin-delete-user] Final error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
