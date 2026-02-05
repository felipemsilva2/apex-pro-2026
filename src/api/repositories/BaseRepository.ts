import { supabase } from '@/lib/supabase';

/**
 * Base Repository following the 'Backend Development Guidelines'.
 * Encapsulates multi-tenancy logic and basic CRUD.
 */
export abstract class BaseRepository<T> {
    constructor(
        protected readonly tableName: string,
        protected readonly tenantId: string
    ) { }

    /**
     * Returns a base query with the mandatory tenant_id filter.
     */
    protected query() {
        return supabase
            .from(this.tableName)
            .select('*')
            .eq('tenant_id', this.tenantId);
    }

    /**
     * Helper for mutations to ensure the tenant filter is applied.
     */
    protected table() {
        return supabase.from(this.tableName);
    }

    /**
     * Centralized error handling and logging logic.
     */
    protected handleError(error: any, context: string): never {
        console.error(`[API Error][${this.tableName}][${context}]:`, error);
        // Here we could integrate with Sentry or another observability tool
        throw error;
    }

    async getAll(): Promise<T[]> {
        try {
            const { data, error } = await this.query();
            if (error) throw error;
            return data || [];
        } catch (e) {
            this.handleError(e, 'getAll');
        }
    }

    async getById(id: string): Promise<T | null> {
        try {
            const { data, error } = await this.query()
                .eq('id', id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (e) {
            this.handleError(e, 'getById');
        }
    }

    async create(payload: Partial<T>): Promise<T> {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert({ ...payload, tenant_id: this.tenantId })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            this.handleError(e, 'create');
        }
    }

    async update(id: string, payload: Partial<T>): Promise<T> {
        try {
            const { data, error } = await this.table()
                .update(payload)
                .eq('id', id)
                .eq('tenant_id', this.tenantId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (e) {
            this.handleError(e, 'update');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const { error } = await this.table()
                .delete()
                .eq('id', id)
                .eq('tenant_id', this.tenantId);

            if (error) throw error;
        } catch (e) {
            this.handleError(e, 'delete');
        }
    }
}
