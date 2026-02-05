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

        const { userId, newPassword } = await req.json()

        if (!userId || !newPassword) {
            throw new Error('userId e newPassword são obrigatórios.')
        }

        if (newPassword.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres.')
        }

        console.log(`[admin-reset-password] Resetting password for user: ${userId}`)

        // Update user password via admin API
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword
        })

        if (updateError) {
            console.error('[admin-reset-password] Error:', updateError)
            throw new Error(`Erro ao resetar senha: ${updateError.message}`)
        }

        console.log(`[admin-reset-password] Password reset successful for user: ${userId}`)

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('[admin-reset-password] Final error:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
