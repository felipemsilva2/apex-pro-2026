import { ProfileRepository } from '../repositories/ProfileRepository';
import { z } from 'zod';

export const profileSchema = z.object({
    full_name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    avatar_url: z.string().url().optional(),
});

export class ProfileService {
    constructor(private readonly repository: ProfileRepository) { }

    async getMyProfile(userId: string) {
        return this.repository.getById(userId);
    }

    async updateProfile(userId: string, data: z.infer<typeof profileSchema>) {
        const validated = profileSchema.parse(data);
        return this.repository.update(userId, validated);
    }
}
