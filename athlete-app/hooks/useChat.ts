
import { useEffect, useState, useRef } from 'react';
import { supabase, type ChatMessage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AppState } from 'react-native';

export function useChat() {
    const { profile, tenant } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

    // Fetch blocked users
    const fetchBlockedUsers = async () => {
        if (!profile?.user_id) return;

        const { data, error } = await supabase
            .from('blocked_users')
            .select('blocked_id')
            .eq('blocker_id', profile.user_id);

        if (!error && data) {
            setBlockedUsers(data.map(b => b.blocked_id));
        }
    };

    // Fetch initial messages
    const fetchMessages = async () => {
        if (!profile?.user_id || !tenant?.id) return;

        try {
            await fetchBlockedUsers(); // Ensure we have blocked list

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

                    // Optimistic check for blocked
                    // (Note: blockedUsers state might be stale in this closure, 
                    // but we refresh on significant actions. Ideally use ref or dependency)

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

    const reportMessage = async (messageId: string, reportedId: string, reason: string) => {
        if (!profile?.user_id) return;

        const { error } = await supabase.from('reports').insert({
            reporter_id: profile.user_id,
            reported_id: reportedId,
            message_id: messageId,
            reason: reason,
            status: 'pending'
        });

        if (error) throw error;
    };

    const blockUser = async (blockedId: string) => {
        if (!profile?.user_id) return;

        const { error } = await supabase.from('blocked_users').insert({
            blocker_id: profile.user_id,
            blocked_id: blockedId
        });

        if (error) {
            // Ignore unique constraint violation (already blocked)
            if (error.code !== '23505') throw error;
        }

        await fetchBlockedUsers(); // Refresh blocked list
        await fetchMessages(); // Refresh messages to filter out blocked
    };

    // Filter messages based on blocked users
    const filteredMessages = messages.filter(msg => !blockedUsers.includes(msg.sender_id));

    return {
        messages: filteredMessages,
        loading,
        sendMessage,
        sending,
        reportMessage,
        blockUser
    };
}
