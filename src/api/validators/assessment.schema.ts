import { z } from 'zod';

export const createAssessmentSchema = z.object({
    client_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    assessment_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Data inválida",
    }),
    weight_kg: z.number().positive().max(500).optional().nullable(),
    body_fat_percentage: z.number().min(0).max(100).optional().nullable(),
    waist_cm: z.number().positive().max(300).optional().nullable(),
    hip_cm: z.number().positive().max(300).optional().nullable(),
    arm_cm: z.number().positive().max(100).optional().nullable(),
    thigh_cm: z.number().positive().max(150).optional().nullable(),
    chest_cm: z.number().positive().max(300).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
    target_weight_kg: z.number().positive().max(500).optional().nullable(),
    target_body_fat_percentage: z.number().min(0).max(100).optional().nullable(),
    coach_feedback: z.string().max(2000).optional().nullable(),
    coach_category: z.string().max(50).optional().nullable(),
    status: z.enum(['pending', 'reviewed']).default('pending'),
});

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
    id: z.string().uuid(),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
