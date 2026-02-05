import { z } from 'zod';

export const clientEditSchema = z.object({
    full_name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    phone: z.string().optional(),
    current_weight: z.number().min(0, "Peso inválido").optional().nullable(),
    target_weight: z.number().min(0, "Meta inválida").optional().nullable(),
    status: z.enum(['active', 'inactive', 'paused']).default('active'),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    birth_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type ClientEditInput = z.infer<typeof clientEditSchema>;
