import { BaseRepository } from './BaseRepository';
import { type Profile } from '@/lib/supabase';

export class ProfileRepository extends BaseRepository<Profile> {
    constructor(tenantId: string) {
        super('profiles', tenantId);
    }

    /**
     * Profiles might be fetched by ID across tenants in some admin cases, 
     * but here we override to ensure tenant isolation.
     */
    async getProfile(userId: string): Promise<Profile | null> {
        return this.getById(userId);
    }
}
