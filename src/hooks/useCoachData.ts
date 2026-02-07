import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type Client, type Workout, type Appointment, type ChatMessage, type MealPlan, type Tenant, type Profile, type HormonalProtocol, type HormonalCompound } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ClientRepository } from '@/api/repositories/ClientRepository';

/**
 * Hook to fetch all clients for the coach's tenant
 */
export function useCoachClients() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-clients', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const repo = new ClientRepository(tenantId);
            return await repo.getActiveClients();
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch a single client detail for a coach
 */
export function useCoachClientDetail(clientId?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-client-detail', clientId],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!clientId || !tenantId) return null;

            const repo = new ClientRepository(tenantId);
            return await repo.getById(clientId);
        },
        enabled: !!clientId && !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch stats for the coach dashboard
 */
export function useDashboardStats() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['dashboard-stats', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return null;

            // 1. All stats queries in parallel
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

            const [activeClientsRes, totalClientsRes, completedWorkoutsRes, todayAppsRes] = await Promise.all([
                // Total active clients count
                supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', tenantId)
                    .eq('status', 'active'),

                // Total clients count (for adherence calculation)
                supabase
                    .from('clients')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', tenantId),

                // Workouts completed this week
                supabase
                    .from('workouts')
                    .select('*', { count: 'exact', head: true })
                    .eq('tenant_id', tenantId)
                    .eq('status', 'completed')
                    .gte('completed_at', weekAgo.toISOString()),

                // Today's appointments
                supabase
                    .from('appointments')
                    .select('*, clients(full_name)')
                    .eq('tenant_id', tenantId)
                    .gte('start_time', startOfDay)
                    .lte('start_time', endOfDay)
                    .order('start_time', { ascending: true })
            ]);

            if (activeClientsRes.error) throw activeClientsRes.error;
            if (totalClientsRes.error) throw totalClientsRes.error;
            if (completedWorkoutsRes.error) throw completedWorkoutsRes.error;
            if (todayAppsRes.error) throw todayAppsRes.error;

            const activeCount = activeClientsRes.count || 0;
            const totalCount = totalClientsRes.count || 0;
            const adherence = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

            return {
                totalActiveClients: activeCount,
                totalClients: totalCount,
                avgAdherence: adherence,
                completedWorkoutsThisWeek: completedWorkoutsRes.count || 0,
                todayAppointments: todayAppsRes.data || [],
            };
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch all appointments for the coach's tenant
 */
export function useCoachAppointments() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-appointments', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const { data, error } = await supabase
                .from('appointments')
                .select('*, client:clients(full_name)')
                .eq('tenant_id', tenantId)
                .order('start_time', { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch agenda appointments within a date range
 */
export function useCoachAgenda(startDate?: string, endDate?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-agenda', profile?.tenant_id || tenant?.id, startDate, endDate],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            let query = supabase
                .from('appointments')
                .select('*, client:clients(full_name, phone)')
                .eq('tenant_id', tenantId)
                .order('start_time', { ascending: true });

            if (startDate) {
                query = query.gte('start_time', startDate);
            }
            if (endDate) {
                query = query.lte('start_time', endDate);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch recent messages for the coach
 */
export function useCoachMessages() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-messages', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*, sender:profiles!chat_messages_sender_id_fkey(full_name, avatar_url)')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as ChatMessage[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch retention metrics (last workout date for each client)
 */
export function useRetentionMetrics() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['retention-metrics', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return { atRisk: [], onTrack: [], recentActivity: [] };

            // Fetch all active clients
            const { data: clients, error: clientsError } = await supabase
                .from('clients')
                .select('id, full_name, avatar_url, current_weight, status')
                .eq('tenant_id', tenantId)
                .eq('status', 'active');

            if (clientsError) throw clientsError;

            // Fetch last completed workout for each client
            // We fetch all completed workouts from last 30 days to optimize
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: workouts, error: workoutsError } = await supabase
                .from('workouts')
                .select('id, client_id, name, completed_at, status')
                .eq('tenant_id', tenantId)
                .eq('status', 'completed')
                .gte('completed_at', thirtyDaysAgo.toISOString())
                .order('completed_at', { ascending: false });

            if (workoutsError) throw workoutsError;

            // Process data
            const clientActivityMap = new Map();

            workouts?.forEach(w => {
                if (!clientActivityMap.has(w.client_id)) {
                    clientActivityMap.set(w.client_id, w);
                }
            });

            const now = new Date();
            const atRisk: any[] = [];
            const onTrack: any[] = [];

            clients?.forEach(client => {
                const lastWorkout = clientActivityMap.get(client.id);
                const lastActivityDate = lastWorkout ? new Date(lastWorkout.completed_at) : null;

                const daysInactive = lastActivityDate
                    ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
                    : 30; // If no workout in last 30 days, treat as 30+

                const clientData = {
                    ...client,
                    lastActivity: lastActivityDate,
                    daysInactive,
                    lastWorkoutName: lastWorkout?.name
                };

                if (daysInactive > 7) {
                    atRisk.push(clientData);
                } else {
                    onTrack.push(clientData);
                }
            });

            return {
                atRisk: atRisk.sort((a, b) => b.daysInactive - a.daysInactive),
                onTrack: onTrack.sort((a, b) => a.daysInactive - b.daysInactive),
                recentActivity: workouts?.slice(0, 10).map(w => {
                    const client = clients?.find(c => c.id === w.client_id);
                    return { ...w, clientName: client?.full_name, clientAvatar: client?.avatar_url };
                }) || []
            };
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch workout templates (workouts not assigned to a specific client or generic ones)
 * In this simplified schema, we'll just fetch all workouts for the tenant.
 */
export function useTrainingTemplates() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['training-templates', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const { data, error } = await supabase
                .from('workouts')
                .select('*, workout_exercises(*)')
                .eq('tenant_id', tenantId)
                .is('client_id', null) // Generic templates
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Workout[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch meal templates
 */
export function useMealTemplates() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['meal-templates', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const { data, error } = await supabase
                .from('meal_plans')
                .select('*, meals(*)')
                .eq('tenant_id', tenantId)
                .is('client_id', null) // Generic templates
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as MealPlan[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}
/**
 * Hook to fetch messages for a specific client
 */
export function useClientMessages(clientId?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['client-messages', profile?.tenant_id || tenant?.id, clientId],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId || !clientId) return [];

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('tenant_id', tenantId)
                .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as ChatMessage[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id) && !!clientId,
    });
}

/**
 * Hook to fetch tenant settings
 */
export function useTenantSettings() {
    const { profile } = useAuth();

    return useQuery({
        queryKey: ['tenant-settings', profile?.tenant_id],
        queryFn: async () => {
            if (!profile?.tenant_id) return null;

            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', profile.tenant_id)
                .single();

            if (error) throw error;
            return data as Tenant;
        },
        enabled: !!profile?.tenant_id,
    });
}

/**
 * Mutation to create a new appointment
 */
export function useCreateAppointment() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async (appointment: Partial<Appointment>) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { data, error } = await supabase
                .from('appointments')
                .insert({ ...appointment, tenant_id: tenantId })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coach-agenda'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success("Agendamento criado com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao criar agendamento: " + error.message);
        }
    });
}

/**
 * Mutation to create a training template
 */
export function useCreateTrainingTemplate() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async (template: Partial<Workout>) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { data, error } = await supabase
                .from('workouts')
                .insert({ ...template, tenant_id: tenantId })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['training-templates'] });
            if (data.client_id) {
                queryClient.invalidateQueries({ queryKey: ['client-workouts', data.client_id] });
                toast.success("Treino personalizado criado!");
            } else {
                toast.success("Modelo de treino salvo na biblioteca!");
            }
        },
    });
}

/**
 * Mutation to create a meal template
 */
export function useCreateMealTemplate() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async (template: Partial<MealPlan>) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { data, error } = await supabase
                .from('meal_plans')
                .insert({ ...template, tenant_id: tenantId })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
            if (data.client_id) {
                queryClient.invalidateQueries({ queryKey: ['client-meal-plans', data.client_id] });
                toast.success("Dieta personalizada criada!");
            } else {
                toast.success("Modelo de dieta salvo na biblioteca!");
            }
        },
    });
}

/**
 * Mutation to update a client
 */
export function useUpdateClient() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .eq('tenant_id', tenantId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['coach-clients'] });
            queryClient.invalidateQueries({ queryKey: ['coach-client-detail', data.id] });
            toast.success("Perfil do atleta atualizado!");
        },
    });
}

/**
 * Mutation to delete a client
 */
export function useDeleteClient() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async (id: string) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id)
                .eq('tenant_id', tenantId);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coach-clients'] });
            toast.success("Atleta removido do roster.");
        },
        onError: (error: any) => {
            toast.error("Erro ao remover atleta: " + error.message);
        }
    });
}

/**
 * Mutation to assign a template to a client
 */
export function useAssignTemplate() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async ({ type, templateId, clientId }: { type: 'workout' | 'meal', templateId: string, clientId: string }) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            if (type === 'workout') {
                // Fetch template
                const { data: template, error: fetchError } = await supabase
                    .from('workouts')
                    .select('*, workout_exercises(*)')
                    .eq('id', templateId)
                    .single();

                if (fetchError) throw fetchError;

                const exercises = template.workout_exercises || [];

                // Group exercises by day
                const exercisesByDay: Record<string, any[]> = {};
                const hasWeeklyStructure = exercises.some((ex: any) => !!ex.day);

                if (hasWeeklyStructure) {
                    exercises.forEach((ex: any) => {
                        const day = ex.day || 'segunda'; // Default to Monday if not specified but others are
                        if (!exercisesByDay[day]) exercisesByDay[day] = [];
                        exercisesByDay[day].push(ex);
                    });

                    // Calculate Monday of the CURRENT week (robustly)
                    const today = new Date();
                    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
                    // If today is Sunday (0), we want the Monday from 6 days ago.
                    // If today is Monday (1), we want today.
                    // If today is Tuesday (2), we want yesterday.
                    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                    const currentMonday = new Date(today.getFullYear(), today.getMonth(), diff);

                    console.log("[useCoachData] Today:", today.toLocaleDateString());
                    console.log("[useCoachData] Current Monday:", currentMonday.toLocaleDateString());

                    const dayMap: Record<string, number> = {
                        'segunda': 0, 'terca': 1, 'quarta': 2, 'quinta': 3,
                        'sexta': 4, 'sabado': 5, 'domingo': 6
                    };

                    // Create workouts for each day that has exercises
                    for (const [dayName, dayExercises] of Object.entries(exercisesByDay)) {
                        const dayIndex = dayMap[dayName] || 0;
                        const workoutDate = new Date(currentMonday);
                        workoutDate.setDate(currentMonday.getDate() + dayIndex);

                        const { data: newWorkout, error: createError } = await supabase
                            .from('workouts')
                            .insert({
                                name: `${template.name} - ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`,
                                description: template.description,
                                duration_minutes: template.duration_minutes,
                                tenant_id: tenantId,
                                client_id: clientId,
                                status: 'pending',
                                scheduled_date: format(workoutDate, 'yyyy-MM-dd')
                            })
                            .select()
                            .single();

                        if (createError) throw createError;

                        const newExercises = dayExercises.map((ex: any) => ({
                            workout_id: newWorkout.id,
                            name: ex.name,
                            sets: ex.sets,
                            reps: ex.reps,
                            weight_kg: ex.weight_kg,
                            rest_seconds: ex.rest_seconds,
                            notes: ex.notes,
                            order_index: ex.order_index,
                            day: dayName
                        }));

                        const { error: exercisesError } = await supabase
                            .from('workout_exercises')
                            .insert(newExercises);

                        if (exercisesError) throw exercisesError;
                    }
                } else {
                    // Fallback for simple templates (single session)
                    const { data: newWorkout, error: createError } = await supabase
                        .from('workouts')
                        .insert({
                            name: template.name,
                            description: template.description,
                            duration_minutes: template.duration_minutes,
                            tenant_id: tenantId,
                            client_id: clientId,
                            status: 'pending',
                            scheduled_date: format(new Date(), 'yyyy-MM-dd') // Schedule for today/now in local time
                        })
                        .select()
                        .single();

                    if (createError) throw createError;

                    if (exercises.length > 0) {
                        const newExercises = exercises.map((ex: any) => ({
                            workout_id: newWorkout.id,
                            name: ex.name,
                            sets: ex.sets,
                            reps: ex.reps,
                            weight_kg: ex.weight_kg,
                            rest_seconds: ex.rest_seconds,
                            notes: ex.notes,
                            order_index: ex.order_index
                        }));

                        const { error: exercisesError } = await supabase
                            .from('workout_exercises')
                            .insert(newExercises);

                        if (exercisesError) throw exercisesError;
                    }
                }
            } else {
                // Clone Meal Plan Template
                const { data: template, error: fetchError } = await supabase
                    .from('meal_plans')
                    .select('*, meals(*)')
                    .eq('id', templateId)
                    .single();

                if (fetchError) throw fetchError;

                const { data: newPlan, error: createError } = await supabase
                    .from('meal_plans')
                    .insert({
                        name: template.name,
                        description: template.description,
                        target_calories: template.target_calories,
                        target_protein_g: template.target_protein_g,
                        target_carbs_g: template.target_carbs_g,
                        target_fats_g: template.target_fats_g,
                        tenant_id: profile.tenant_id,
                        client_id: clientId,
                        status: 'active'
                    })
                    .select()
                    .single();

                if (createError) throw createError;

                // Clone meals
                if (template.meals?.length > 0) {
                    const meals = template.meals.map((m: any) => ({
                        meal_plan_id: newPlan.id,
                        name: m.name,
                        time_of_day: m.time_of_day,
                        day_of_week: m.day_of_week,
                        foods: m.foods, // This is the JSONB field
                        total_calories: m.total_calories,
                        total_protein_g: m.total_protein_g,
                        total_carbs_g: m.total_carbs_g,
                        total_fats_g: m.total_fats_g,
                        notes: m.notes,
                        order_index: m.order_index
                    }));

                    const { error: mealsError } = await supabase
                        .from('meals')
                        .insert(meals);

                    if (mealsError) throw mealsError;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coach-client-detail'] });
            toast.success("Protocolo atribuído com sucesso!");
        },
    });
}

/**
 * Hook to fetch workouts for a specific client
 */
export function useClientWorkouts(clientId?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['client-workouts', clientId],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId || !clientId) return [];

            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Workout[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id) && !!clientId,
    });
}

/**
 * Hook to fetch meal plans for a specific client
 */
export function useClientMealPlans(clientId?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['client-meal-plans', clientId],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId || !clientId) return [];

            const { data, error } = await supabase
                .from('meal_plans')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as MealPlan[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id) && !!clientId,
    });
}

/**
 * Hook to fetch all coaches in the tenant (the team)
 */
export function useCoachTeam() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-team', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('role', 'coach');

            if (error) throw error;
            return data as Profile[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

/**
 * Hook to fetch documents for a specific client
 */
export function useClientDocuments(clientId?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['client-documents', clientId],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId || !clientId) return [];

            const { data, error } = await supabase
                .from('client_documents')
                .select('*')
                .eq('tenant_id', tenantId)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data; // Type is implied or can be cast
        },
        enabled: !!(profile?.tenant_id || tenant?.id) && !!clientId,
    });
}

/**
 * Mutation to delete a client document
 */
export function useDeleteClientDocument() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async (documentId: string) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { error } = await supabase
                .from('client_documents')
                .delete()
                .eq('id', documentId)
                .eq('tenant_id', tenantId);

            if (error) throw error;
            return documentId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-documents'] });
            toast.success("Documento removido.");
        },
        onError: (error: any) => {
            toast.error("Erro ao remover documento: " + error.message);
        }
    });
}


/**
 * Mutation to update tenant settings
 */
export function useUpdateTenantSettings() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant, refetchTenant } = useTenant();

    return useMutation({
        mutationFn: async (updates: Partial<Tenant>) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");
            const { data, error } = await supabase
                .from('tenants')
                .update(updates)
                .eq('id', tenantId)
                .select()
                .single();

            if (error) throw error;
            return data as Tenant;
        },
        onSuccess: (data) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            queryClient.invalidateQueries({ queryKey: ['tenant-settings', tenantId] });

            // Apply branding changes immediately
            if (data) {
                // Update CSS variables dynamically
                const root = document.documentElement;
                if (data.primary_color) {
                    const hsl = hexToHsl(data.primary_color);
                    if (hsl) {
                        root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
                        root.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
                    }
                }
                if (data.business_name) {
                    document.title = `${data.business_name} | APEX PRO`;
                }
            }

            // Refetch tenant context
            refetchTenant?.();

            toast.success("Configurações atualizadas e aplicadas!");
        },
    });
}

// Helper function for hex to HSL conversion
function hexToHsl(hex: string) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    } else {
        return null;
    }

    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Mutation to update an appointment
 */
export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { data, error } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', id)
                .eq('tenant_id', tenantId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coach-agenda'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success("Agendamento atualizado com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao atualizar agendamento: " + error.message);
        }
    });
}

/**
 * Hook to fetch hormonal protocols for a specific client
 */
export function useClientHormonalProtocols(clientId?: string) {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['client-hormonal-protocols', clientId],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId || !clientId) return [];

            const { data, error } = await supabase
                .from('hormonal_protocols')
                .select('*, compounds:hormonal_compounds(*)')
                .eq('tenant_id', tenantId)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as unknown as HormonalProtocol[];
        },
        enabled: !!(profile?.tenant_id || tenant?.id) && !!clientId,
    });
}

/**
 * Mutation to create a hormonal protocol
 */
export function useCreateHormonalProtocol() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async ({ compounds, ...protocol }: Partial<HormonalProtocol> & { compounds: Partial<HormonalCompound>[] }) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            // 1. Create Protocol
            const { data: newProtocol, error: protocolError } = await supabase
                .from('hormonal_protocols')
                .insert({ ...protocol, tenant_id: tenantId })
                .select()
                .single();

            if (protocolError) throw protocolError;

            // 2. Create Compounds
            if (compounds.length > 0) {
                const compoundsData = compounds.map(c => ({
                    ...c,
                    protocol_id: newProtocol.id
                }));

                const { error: compoundsError } = await supabase
                    .from('hormonal_compounds')
                    .insert(compoundsData);

                if (compoundsError) throw compoundsError;
            }

            return newProtocol;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['client-hormonal-protocols', data.client_id] });
            toast.success("Protocolo hormonal criado com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao criar protocolo: " + error.message);
        }
    });
}

/**
 * Mutation to update a hormonal protocol
 */
export function useUpdateHormonalProtocol() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async ({ id, compounds, ...protocol }: Partial<HormonalProtocol> & { id: string, compounds: Partial<HormonalCompound>[] }) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            // 1. Update Protocol
            const { error: protocolError } = await supabase
                .from('hormonal_protocols')
                .update(protocol)
                .eq('id', id);

            if (protocolError) throw protocolError;

            // 2. Refresh Compounds (Delete + Insert)
            // First, delete current compounds
            const { error: deleteError } = await supabase
                .from('hormonal_compounds')
                .delete()
                .eq('protocol_id', id);

            if (deleteError) throw deleteError;

            // Then, insert new ones
            if (compounds.length > 0) {
                const compoundsData = compounds.map(c => ({
                    ...c,
                    protocol_id: id
                }));

                const { error: compoundsError } = await supabase
                    .from('hormonal_compounds')
                    .insert(compoundsData);

                if (compoundsError) throw compoundsError;
            }

            return { id, client_id: protocol.client_id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['client-hormonal-protocols', data.client_id] });
            toast.success("Protocolo hormonal atualizado!");
        },
        onError: (error: any) => {
            toast.error("Erro ao atualizar protocolo: " + error.message);
        }
    });
}



/**
 * Mutation to delete a hormonal protocol
 */
export function useDeleteHormonalProtocol() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useMutation({
        mutationFn: async (id: string) => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) throw new Error("Tenant ID not found");

            const { error } = await supabase
                .from('hormonal_protocols')
                .delete()
                .eq('id', id)
                .eq('tenant_id', tenantId);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['client-hormonal-protocols'] });
            toast.success("Protocolo removido!");
        },
    });
}

/**
 * Mutation to delete an appointment
 */
export function useDeleteAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coach-agenda'] });
            toast.success("Agendamento removido.");
        }
    });
}

/**
 * Mutation to delete a protocol (workout or meal plan)
 */
export function useDeleteProtocol() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, type }: { id: string, type: 'workout' | 'meal' }) => {
            const table = type === 'workout' ? 'workouts' : 'meal_plans';
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id, type };
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: [data.type === 'workout' ? 'training-templates' : 'meal-templates'] });
            queryClient.invalidateQueries({ queryKey: [data.type === 'workout' ? 'client-workouts' : 'client-meal-plans'] });
            toast.success("Protocolo removido.");
        }
    });
}
/**
 * Mutation to update a training template
 */
export function useUpdateTrainingTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Workout> }) => {
            const { data, error } = await supabase
                .from('workouts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-templates'] });
            toast.success("Modelo de treino atualizado!");
        }
    });
}

/**
 * Mutation to update a meal template
 */
export function useUpdateMealTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<MealPlan> }) => {
            const { data, error } = await supabase
                .from('meal_plans')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meal-templates'] });
            toast.success("Modelo de dieta atualizado!");
        }
    });
}

/**
 * Mutation to update a student's specific workout
 */
export function useUpdateWorkout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Workout> }) => {
            const { data, error } = await supabase
                .from('workouts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['client-protocols', data.client_id] });
            queryClient.invalidateQueries({ queryKey: ['coach-agenda'] });
            toast.success("Treino atualizado!");
        }
    });
}

/**
 * Mutation to update a student's specific meal plan
 */
export function useUpdateMealPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<MealPlan> }) => {
            const { data, error } = await supabase
                .from('meal_plans')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['client-protocols', data.client_id] });
            toast.success("Dieta atualizada!");
        }
    });
}

/**
 * Hook to fetch dashboard alerts (operational notifications)
 */
export function useCoachAlerts() {
    const { profile } = useAuth();
    const { tenant } = useTenant();

    return useQuery({
        queryKey: ['coach-alerts', profile?.tenant_id || tenant?.id],
        queryFn: async () => {
            const tenantId = profile?.tenant_id || tenant?.id;
            if (!tenantId) return [];

            const { data: clients } = await supabase
                .from('clients')
                .select('id, full_name, last_checkin')
                .eq('tenant_id', tenantId)
                .eq('status', 'active');

            const alerts: any[] = [];

            clients?.forEach(c => {
                if (!c.last_checkin) {
                    alerts.push({
                        id: `no-checkin-${c.id}`,
                        title: "Primeiro Check-in Pendente",
                        description: `${c.full_name} ainda não realizou o check-in inicial.`,
                        type: 'warning',
                        clients: [c.full_name]
                    });
                }
            });

            return alerts;
        },
        enabled: !!(profile?.tenant_id || tenant?.id),
    });
}

