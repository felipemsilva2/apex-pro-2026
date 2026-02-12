import { BaseRepository } from './BaseRepository';
import { type Client } from '@/lib/supabase';

export class ClientRepository extends BaseRepository<Client> {
    constructor(tenantId: string) {
        super('clients', tenantId);
    }

    async getActiveClients(): Promise<Client[]> {
        const { data, error } = await this.query()
            .eq('status', 'active')
            .order('full_name', { ascending: true });

        if (error) return this.handleError(error, 'getActiveClients');
        return data || [];
    }

    async getAllClients(): Promise<Client[]> {
        const { data, error } = await this.query()
            .order('full_name', { ascending: true });

        if (error) return this.handleError(error, 'getAllClients');
        return data || [];
    }

    async getStats(): Promise<{ activeCount: number }> {
        const { count, error } = await this.table()
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', this.tenantId)
            .eq('status', 'active');

        if (error) return this.handleError(error, 'getStats');
        return { activeCount: count || 0 };
    }
}
