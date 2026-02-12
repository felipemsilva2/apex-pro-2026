export type Assessment = {
    id: string;
    client_id: string;
    tenant_id: string;
    assessment_date: string;
    weight_kg: number | null;
    body_fat_percentage: number | null;
    lean_mass_kg: number | null;
    fat_mass_kg: number | null;
    bmi: number | null;
    waist_cm: number | null;
    hip_cm: number | null;
    arm_cm: number | null;
    thigh_cm: number | null;
    chest_cm: number | null;
    waist_hip_ratio: number | null;
    notes: string | null;
    target_weight_kg: number | null;
    target_body_fat_percentage: number | null;
    front_photo: string | null;
    back_photo: string | null;
    side_photo: string | null;
    coach_feedback: string | null;
    coach_category: string | null;
    status: 'pending' | 'reviewed';
    created_at: string;
    updated_at: string;
};

export type CreateAssessmentInput = {
    client_id: string;
    tenant_id: string;
    assessment_date: string;
    weight_kg?: number | null;
    body_fat_percentage?: number | null;
    waist_cm?: number | null;
    hip_cm?: number | null;
    arm_cm?: number | null;
    thigh_cm?: number | null;
    chest_cm?: number | null;
    notes?: string | null;
    target_weight_kg?: number | null;
    target_body_fat_percentage?: number | null;
    coach_feedback?: string | null;
    coach_category?: string | null;
    status?: 'pending' | 'reviewed';
};

export type UpdateAssessmentInput = Partial<CreateAssessmentInput>;

export type AssessmentDelta = {
    weight_delta: number;
    body_fat_delta: number;
    lean_mass_delta: number;
    fat_mass_delta: number;
    days_between: number;
};
