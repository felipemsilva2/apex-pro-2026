import { supabase } from '@/lib/supabase';

export interface GlobalStats {
    total_tenants: number;
    total_coaches: number;
    total_clients: number;
    active_tenants: number;
}

export interface TenantAdminInfo {
    id: string;
    business_name: string;
    subdomain: string;
    plan_tier: string;
    status: 'active' | 'suspended';
    created_at: string;
    coach_count?: number;
    client_count?: number;
    master_coach?: {
        full_name: string;
        email: string;
    };
}

export interface UserAdminInfo {
    id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'coach' | 'client';
    tenant_id: string | null;
    created_at: string;
    tenants?: { business_name: string } | null;
}

export interface CreateUserParams {
    fullName: string;
    username: string;
    password: string;
    role: 'coach' | 'client';
    tenantId: string;
}

export class AdminService {
    /**
     * Fetch global platform metrics.
     */
    static async getGlobalStats(): Promise<GlobalStats> {
        const { data, error } = await supabase
            .from('admin_global_stats')
            .select('*')
            .single();

        if (error) throw error;
        return data as GlobalStats;
    }

    /**
     * List all tenants with management info.
     */
    static async listTenants(): Promise<TenantAdminInfo[]> {
        const { data, error } = await supabase
            .from('tenants')
            .select(`
                *,
                profiles!profiles_tenant_id_fkey(id, full_name, email, role)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((tenant: any) => {
            const coaches = tenant.profiles?.filter((p: any) => p.role === 'coach') || [];
            const clients = tenant.profiles?.filter((p: any) => p.role === 'client') || [];

            return {
                ...tenant,
                coach_count: coaches.length,
                client_count: clients.length,
                master_coach: coaches[0]
            };
        });
    }

    /**
     * List all users globally.
     */
    static async listAllUsers(): Promise<UserAdminInfo[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, tenants(business_name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Update tenant status.
     */
    static async updateTenantStatus(tenantId: string, status: 'active' | 'suspended') {
        const { error } = await supabase
            .from('tenants')
            .update({ status })
            .eq('id', tenantId);

        if (error) throw error;
    }

    /**
     * Create a new user via Edge Function.
     */
    static async createUser(params: CreateUserParams) {
        const { data, error } = await supabase.functions.invoke('manage-athlete', {
            body: {
                fullName: params.fullName,
                username: params.username,
                password: params.password,
                role: params.role,
                tenantId: params.tenantId
            }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
    }

    /**
     * Delete a user completely via Edge Function.
     */
    static async deleteUser(userId: string) {
        const { data, error } = await supabase.functions.invoke('admin-delete-user', {
            body: { userId }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
    }

    /**
     * Update user profile data.
     */
    static async updateUser(userId: string, updates: { full_name?: string; role?: string; tenant_id?: string }) {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        // Also update clients table if exists
        if (updates.full_name || updates.tenant_id) {
            await supabase
                .from('clients')
                .update({
                    ...(updates.full_name && { full_name: updates.full_name }),
                    ...(updates.tenant_id && { tenant_id: updates.tenant_id })
                })
                .eq('user_id', userId);
        }
    }

    /**
     * Reset user password via Edge Function.
     */
    static async resetPassword(userId: string, newPassword: string) {
        const { data, error } = await supabase.functions.invoke('admin-reset-password', {
            body: { userId, newPassword }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data;
    }

    /**
     * Extend user plan by adding bonus days.
     */
    static async extendUserPlan(userId: string, bonusDays: number) {
        // First get current bonus_days
        const { data: client } = await supabase
            .from('clients')
            .select('bonus_days')
            .eq('user_id', userId)
            .single();

        const currentDays = client?.bonus_days || 0;
        const newDays = currentDays + bonusDays;

        const { error } = await supabase
            .from('clients')
            .update({ bonus_days: newDays })
            .eq('user_id', userId);

        if (error) throw error;
        return { newTotalDays: newDays };
    }

    /**
     * Check if current user is an admin.
     */
    static async isCurrentUserAdmin(): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        return profile?.role === 'admin';
    }
}

