import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * useRealtimeSync
 * 
 * Sets up listeners for Supabase Realtime changes on relevant tables.
 * When a change is detected, it invalidates the corresponding React Query keys
 * to trigger a background refetch and update the UI immediately.
 */
export function useRealtimeSync() {
    const queryClient = useQueryClient();
    const { tenant, profile, user } = useAuth();

    useEffect(() => {
        if (!user || !tenant?.id) return;

        console.log('[Realtime] Initializing sync channels for tenant:', tenant.id);

        // 1. Tenant & Branding Changes
        const tenantChannel = supabase
            .channel(`tenant-sync-${tenant.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tenants',
                    filter: `id=eq.${tenant.id}`
                },
                (payload) => {
                    console.log('[Realtime] Tenant update detected:', payload);
                    // Invalidate tenant-related queries
                    queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
                }
            )
            .subscribe();

        // 2. Personal Trainer Profile Changes
        const coachId = profile?.assigned_coach_id;
        const coachChannel = coachId ? supabase
            .channel(`coach-sync-${coachId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${coachId}`
                },
                (payload) => {
                    console.log('[Realtime] Coach profile update detected:', payload);
                    queryClient.invalidateQueries({ queryKey: ['coach-profile'] });
                }
            )
            .subscribe() : null;

        // 3. User/Athlete Profile & Data Changes
        const athleteChannel = supabase
            .channel(`athlete-sync-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'clients',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('[Realtime] Athlete client update:', payload.eventType);
                    queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
                }
            )
            .subscribe();

        // 4. Protocols & Workouts Changes
        const protocolsChannel = supabase
            .channel(`protocols-sync-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'workouts',
                    filter: `client_id=eq.${profile?.id}`
                },
                () => queryClient.invalidateQueries({ queryKey: ['athlete-workouts'] })
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'meal_plans',
                    filter: `client_id=eq.${profile?.id}`
                },
                () => queryClient.invalidateQueries({ queryKey: ['athlete-diet'] })
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'hormonal_protocols',
                    filter: `client_id=eq.${profile?.id}`
                },
                () => queryClient.invalidateQueries({ queryKey: ['athlete-protocols'] })
            )
            .subscribe();

        // Cleanup on unmount or dependency change
        return () => {
            console.log('[Realtime] Cleaning up sync channels');
            supabase.removeChannel(tenantChannel);
            if (coachChannel) supabase.removeChannel(coachChannel);
            supabase.removeChannel(athleteChannel);
            supabase.removeChannel(protocolsChannel);
        };
    }, [user?.id, tenant?.id, profile?.id, profile?.assigned_coach_id, queryClient]);
}
