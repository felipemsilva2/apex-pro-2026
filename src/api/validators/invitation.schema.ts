import { z } from 'zod';

export const invitationSchema = z.object({
    email: z.string().email("E-mail inválido"),
    tenant_id: z.string().uuid(),
    role: z.enum(['coach', 'client']).default('client'),
    expires_at: z.string().datetime().optional(),
});

export type InvitationInput = z.infer<typeof invitationSchema>;

export type Invitation = {
    id: string;
    email: string;
    tenant_id: string;
    role: string;
    token: string;
    status: 'pending' | 'accepted' | 'expired';
    created_at: string;
    expires_at: string;
};
