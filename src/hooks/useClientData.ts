import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type Workout, type WorkoutExercise, type MealPlan, type Meal, type Client, type HormonalProtocol, type HormonalCompound } from '@/lib/supabase';

/**
 * Hook to fetch the current client profile linked to the authenticated user
 */
export function useCurrentClient() {
    return useQuery({
        queryKey: ['current-client'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data as Client | null;
        },
    });
}

/**
 * Hook to fetch workouts for a specific client
 */
export function useWorkouts(clientId?: string) {
    return useQuery({
        queryKey: ['workouts', clientId],
        queryFn: async () => {
            if (!clientId) return [];
            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('client_id', clientId)
                .order('scheduled_date', { ascending: false });

            if (error) throw error;
            return data as Workout[];
        },
        enabled: !!clientId,
    });
}

/**
 * Hook to fetch details of a specific workout including exercises
 */
export function useWorkoutDetail(workoutId?: string) {
    return useQuery({
        queryKey: ['workout', workoutId],
        queryFn: async () => {
            if (!workoutId) return null;

            const { data: workout, error: workoutError } = await supabase
                .from('workouts')
                .select('*')
                .eq('id', workoutId)
                .single();

            if (workoutError) throw workoutError;

            const { data: exercises, error: exercisesError } = await supabase
                .from('workout_exercises')
                .select('*')
                .eq('workout_id', workoutId)
                .order('order_index', { ascending: true });

            if (exercisesError) throw exercisesError;

            return {
                ...workout,
                exercises: exercises as WorkoutExercise[],
            };
        },
        enabled: !!workoutId,
    });
}

/**
 * Hook to fetch meal plans for a specific client
 */
export function useMealPlans(clientId?: string) {
    return useQuery({
        queryKey: ['meal_plans', clientId],
        queryFn: async () => {
            if (!clientId) return [];
            const { data, error } = await supabase
                .from('meal_plans')
                .select('*')
                .eq('client_id', clientId)
                .eq('status', 'active')
                .order('start_date', { ascending: false });

            if (error) throw error;
            return data as MealPlan[];
        },
        enabled: !!clientId,
    });
}

/**
 * Hook to fetch meals for a specific meal plan
 */
export function useMeals(mealPlanId?: string) {
    return useQuery({
        queryKey: ['meals', mealPlanId],
        queryFn: async () => {
            if (!mealPlanId) return [];
            const { data, error } = await supabase
                .from('meals')
                .select('*')
                .eq('meal_plan_id', mealPlanId)
                .order('time_of_day', { ascending: true });

            if (error) throw error;
            return data as Meal[];
        },
        enabled: !!mealPlanId,
    });
}

/**
 * Mutation to mark an exercise as completed
 */
export function useToggleExercise() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ exerciseId, isCompleted }: { exerciseId: string; isCompleted: boolean }) => {
            const { data, error } = await supabase
                .from('workout_exercises')
                .update({
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null
                })
                .eq('id', exerciseId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workout', data.workout_id] });
        },
    });
}

/**
 * Mutation to complete a workout
 */
export function useCompleteWorkout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (workoutId: string) => {
            const { data, error } = await supabase
                .from('workouts')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', workoutId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['workout', data.id] });
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
    });
}

/**
 * Hook to fetch hormonal protocols for the current client
 */
export function useHormonalProtocols(clientId?: string) {
    return useQuery({
        queryKey: ['hormonal-protocols', clientId],
        queryFn: async () => {
            if (!clientId) return [];
            const { data, error } = await supabase
                .from('hormonal_protocols')
                .select('*, compounds:hormonal_compounds(*)')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as unknown as (HormonalProtocol & { compounds: HormonalCompound[] })[];
        },
        enabled: !!clientId,
    });
}
