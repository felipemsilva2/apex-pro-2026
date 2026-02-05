import { z } from 'zod';

export const mealPlanSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    tenant_id: z.string().uuid().optional(),
    client_id: z.string().uuid().nullable().optional(),
});

export type MealPlanInput = z.infer<typeof mealPlanSchema>;
