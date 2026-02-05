import { z } from 'zod';

export const appointmentSchema = z.object({
    client_id: z.string().uuid("Selecione um atleta"),
    tenant_id: z.string().uuid(),
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
    type: z.enum(['session', 'evaluation', 'call', 'other']).default('session'),
    video_link: z.string().optional().nullable(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
