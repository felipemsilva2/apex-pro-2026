
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
    try {
        const { record } = await req.json();
        const { sender_id, receiver_id, content, tenant_id } = record;

        console.log(`[Push] Processing message from ${sender_id} to ${receiver_id}`);

        // 1. Inicializar Supabase Client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Buscar o push_token do destinatário e o nome do remetente
        const [
            { data: receiverProfile },
            { data: senderProfile }
        ] = await Promise.all([
            supabase.from("profiles").select("push_token").eq("id", receiver_id).single(),
            supabase.from("profiles").select("full_name").eq("id", sender_id).single()
        ]);

        if (!receiverProfile?.push_token) {
            console.log(`[Push] No token found for user ${receiver_id}. Skipping.`);
            return new Response(JSON.stringify({ success: false, reason: "No token" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 3. Montar a notificação para o Expo
        const message = {
            to: receiverProfile.push_token,
            sound: "default",
            title: senderProfile?.full_name || "Nova mensagem",
            body: content,
            data: { sender_id, tenant_id, type: "chat_message" },
        };

        // 4. Enviar para o Expo
        const expoRes = await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(message),
        });

        const expoData = await expoRes.json();
        console.log(`[Push] Expo API Response:`, expoData);

        return new Response(JSON.stringify({ success: true, expoData }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error(`[Push] Error:`, error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});
