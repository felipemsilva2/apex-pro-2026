import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Fetch the current athlete's profile/client data
 */
export function useAthleteProfile() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['athlete-profile', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;

            const { data, error } = await supabase
                .from('clients')
                .select('*, tenant:tenants(*)')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user?.id,
    });
}

/**
 * Fetch workouts assigned to the current athlete
 */
export function useAthleteWorkouts() {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['athlete-workouts', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];

            const { data, error } = await supabase
                .from('workouts')
                .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises_library(*)
          )
        `)
                .eq('client_id', profile.id)
                .order('scheduled_date', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!profile?.id,
    });
}

/**
 * Fetch a single workout with its exercises
 */
export function useWorkoutDetail(workoutId: string) {
    return useQuery({
        queryKey: ['workout-detail', workoutId],
        queryFn: async () => {
            if (!workoutId) return null;

            const { data, error } = await supabase
                .from('workouts')
                .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises_library(*)
          )
        `)
                .eq('id', workoutId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!workoutId,
    });
}

/**
 * Fetch active meal plans for the current athlete
 */
export function useAthleteDiet() {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['athlete-diet', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];

            const { data, error } = await supabase
                .from('meal_plans')
                .select(`
          *,
          meals(*)
        `)
                .eq('client_id', profile.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!profile?.id,
    });
}

/**
 * Fetch hormonal protocols for the current athlete
 */
export function useAthleteProtocols() {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['athlete-protocols', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];

            const { data, error } = await supabase
                .from('hormonal_protocols')
                .select(`
          *,
          compounds:hormonal_compounds(*)
        `)
                .eq('client_id', profile.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!profile?.id,
    });
}

/**
 * Update athlete profile (e.g., current weight)
 */
export function useUpdateAthleteProfile() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();

    return useMutation({
        mutationFn: async (updates: any) => {
            if (!profile?.id) {
                console.error('[useUpdateAthleteProfile] Profile ID missing:', { profile });
                throw new Error('Perfil de atleta não carregado. Você está logado como atleta?');
            }

            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                console.error('[useUpdateAthleteProfile] Supabase error:', error);
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['athlete-profile'] });
            // Note: AuthContext might need a refresh to show updated profile if it doesn't listen to changes
        },
    });
}

/**
 * Fetch body assessments for the current athlete
 */
export function useAthleteAssessments() {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['athlete-assessments', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return [];

            const { data, error } = await supabase
                .from('body_assessments')
                .select('*')
                .eq('client_id', profile.id)
                .order('assessment_date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!profile?.id,
    });
}

/**
 * Fetch appointments for the current athlete
 */
export function useAthleteAppointments() {
    const { profile } = useAuth();
    const { tenant } = useAuth();

    return useQuery({
        queryKey: ['athlete-appointments', profile?.id],
        queryFn: async () => {
            if (!profile?.id || !tenant?.id) return [];

            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', profile.id)
                .eq('tenant_id', tenant.id)
                .gte('start_time', new Date().toISOString()) // Only future/current
                .order('start_time', { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!profile?.id && !!tenant?.id,
    });
}

/**
 * Fetch coach/personal trainer profile details
 */
export function useCoachProfile() {
    const { tenant, profile, user } = useAuth();

    return useQuery({
        queryKey: ['coach-profile', tenant?.id, profile?.assigned_coach_id, user?.id],
        queryFn: async () => {
            if (!tenant?.id) return null;

            // 1. If the logged in user is a COACH, show their own profile
            const { data: ownProfile } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, cref, specialty, bio, education, instagram, website, spotify_playlist_url')
                .eq('id', user?.id)
                .eq('role', 'coach')
                .maybeSingle();

            if (ownProfile) return ownProfile;

            // 2. Try fetching the ASSIGNED coach
            if (profile?.assigned_coach_id) {
                const { data: assignedCoach } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, cref, specialty, bio, education, instagram, website, spotify_playlist_url')
                    .eq('id', profile.assigned_coach_id)
                    .maybeSingle();

                if (assignedCoach) return assignedCoach;
            }

            // 3. Fallback: Find any coach in the tenant who actually has content (bio or specialty)
            const { data: activeCoach } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, cref, specialty, bio, education, instagram, website, spotify_playlist_url')
                .eq('tenant_id', tenant.id)
                .eq('role', 'coach')
                .not('bio', 'is', null)
                .limit(1)
                .maybeSingle();

            if (activeCoach) return activeCoach;

            // 4. Last resort: Just pick the first coach available
            const { data: firstCoach } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, cref, specialty, bio, education, instagram, website, spotify_playlist_url')
                .eq('tenant_id', tenant.id)
                .eq('role', 'coach')
                .limit(1)
                .maybeSingle();

            return firstCoach;
        },
        enabled: !!tenant?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
    });
}
