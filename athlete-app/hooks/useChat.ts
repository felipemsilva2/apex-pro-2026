
import { useEffect, useState, useRef } from 'react';
import { supabase, type ChatMessage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AppState } from 'react-native';

export function useChat() {
    const { profile, tenant } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Fetch initial messages
    const fetchMessages = async () => {
        if (!profile?.user_id || !tenant?.id) return;

        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
                    *,
                    sender:profiles!chat_messages_sender_id_fkey(full_name, avatar_url)
                `)
                .eq('tenant_id', tenant.id)
                .or(`sender_id.eq.${profile.user_id},receiver_id.eq.${profile.user_id}`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data as ChatMessage[]);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to real-time changes
    useEffect(() => {
        if (!profile?.user_id || !tenant?.id) return;

        fetchMessages();

        const channel = supabase
            .channel(`chat:${profile.user_id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `tenant_id=eq.${tenant.id}`
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;

                    // Only care if the message involves us
                    if (newMessage.sender_id !== profile.user_id && newMessage.receiver_id !== profile.user_id) {
                        return;
                    }
                    // If we sent it, we already have it optimistically (optional) or we just refetch
                    // Ideally we append. We need to fetch sender info if it's not us.
                    // For simplicity, let's just refetch or append safely.
                    // Since payload.new doesn't have the relation 'sender', we might want to fetch it or just use partial data.

                    setMessages(prev => {
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });

                    // Trigger a background refetch to get full sender details if needed
                    fetchMessages();
                }
            )
            .subscribe();

        // Refresh on app resume
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                fetchMessages();
            }
        });

        return () => {
            supabase.removeChannel(channel);
            subscription.remove();
        };
    }, [profile?.user_id, tenant?.id]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || !profile?.user_id || !tenant?.id) return;

        setSending(true);
        try {
            // Find the coach ID. Usually the coach is the owner of the tenant or we can find a receiver.
            // For now, let's assume messaging the coach. We need to know WHO the coach is.
            // In a single coach tenant, we might need to look up the coach user ID.
            // However, chat usually goes to a specific person.
            // Let's assume the 'receiver_id' should be the coach.
            // We can get the coach ID from the client's profile or tenant owner?
            // Checking the web code: useCoachClients uses profile.id as coach id.
            // BUT for the athlete app, we are the client. We need to send TO the coach.
            // We need to fetch the coach ID associated with this client.

            // Let's try to find the coach from the client record or tenant.
            // The client record usually has a 'coach_id' or similar?
            // Let's check the 'clients' table structure or 'tenants' table.
            // In many systems the tenant owner is the coach.

            // Allow looking up the coach if we don't know who to send to.
            // For MVP, lets try to find a message FROM the coach to reply to, or fetch the tenant owner.

            // Quick fix: Fetch the most recent message received to find the coach ID, 
            // OR use a specific logic if we have the coach's ID stored.

            // Better approach: The client is linked to a tenant. The tenant usually implies the coach context.
            // Let's look if we have a 'coach_id' in the 'clients' table in `useAthleteData`.
            // Inspecting `useAthleteData` or `AuthContext` might reveal this.

            // If we cant find it, we can query the `members` or `users` of the tenant.
            // Let's assume for now we reply to the last person who messaged us, or if new, we need a target.

            // HACK: For now, I will try to fetch the coach ID from the tenant owner logic 
            // or we might need to ask the user. 
            // Wait, in `client` table there is usually no coach_id if it's single tenant.
            // Let's check `AuthContext` profile again.

            // 1. Prioritize assigned coach from the client profile
            let coachId = profile.assigned_coach_id;

            // 2. Fallback to finding any coach in the tenant if no assigned coach
            if (!coachId) {
                const { data: coachProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('tenant_id', tenant.id)
                    .eq('role', 'coach')
                    .limit(1)
                    .single();

                coachId = coachProfile?.id;
            }

            // 3. Final fallback: find any non-client
            if (!coachId) {
                const { data: anyCoach } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('tenant_id', tenant.id)
                    .neq('role', 'client')
                    .neq('id', profile.user_id)
                    .limit(1)
                    .single();
                coachId = anyCoach?.id;
            }

            if (!coachId) throw new Error("Treinador não encontrado para este tenant");

            const { error } = await supabase.from('chat_messages').insert({
                tenant_id: tenant.id,
                sender_id: profile.user_id,
                receiver_id: coachId,
                content: content
            });

            if (error) throw error;
            // Optimistic update handled by realtime subscription or fetch
            await fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        } finally {
            setSending(false);
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        sending
    };
}
