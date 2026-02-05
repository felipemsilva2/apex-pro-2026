import { z } from 'zod';

export const createAssessmentSchema = z.object({
    client_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    assessment_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Data inválida",
    }),
    weight_kg: z.number().positive().max(500).optional(),
    body_fat_percentage: z.number().min(0).max(100).optional(),
    waist_cm: z.number().positive().max(300).optional(),
    hip_cm: z.number().positive().max(300).optional(),
    arm_cm: z.number().positive().max(100).optional(),
    thigh_cm: z.number().positive().max(150).optional(),
    chest_cm: z.number().positive().max(300).optional(),
    notes: z.string().max(1000).optional(),
    target_weight_kg: z.number().positive().max(500).optional(),
    target_body_fat_percentage: z.number().min(0).max(100).optional(),
    coach_feedback: z.string().max(2000).optional(),
    status: z.enum(['pending', 'reviewed']).default('pending'),
});

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
    id: z.string().uuid(),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
