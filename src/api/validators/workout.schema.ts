import { z } from 'zod';

export const workoutSchema = z.object({
    name: z.string().min(3, "Nome muito curto").max(100),
    description: z.string().optional(),
    scheduled_date: z.string().datetime().optional(),
    duration_minutes: z.number().int().positive().optional(),
    status: z.enum(['pending', 'completed']).default('pending'),
    tenant_id: z.string().uuid().optional(),
    client_id: z.string().uuid().nullable().optional(),
});

export type WorkoutInput = z.infer<typeof workoutSchema>;
