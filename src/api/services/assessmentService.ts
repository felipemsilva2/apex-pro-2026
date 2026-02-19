import { supabase } from '@/lib/supabase';
import { Assessment, AssessmentDelta, CreateAssessmentInput, UpdateAssessmentInput } from '@/types/assessment';
import { createAssessmentSchema, updateAssessmentSchema } from '@/api/validators/assessment.schema';
import { calculateBMI, calculateComposition, calculateWHR, roundMacro } from '@/lib/calculations';

export class AssessmentService {
    /**
     * Create a new body assessment
     */
    static async createAssessment(input: CreateAssessmentInput): Promise<Assessment> {
        // Validate input
        const validated = createAssessmentSchema.parse(input);

        // Calculate derived metrics
        const calculatedData: Partial<Assessment> = {};

        // Calculate fat mass and lean mass if we have weight and body fat %
        if (validated.weight_kg && validated.body_fat_percentage) {
            const comp = calculateComposition(validated.weight_kg, validated.body_fat_percentage);
            calculatedData.fat_mass_kg = comp.fatMassKg;
            calculatedData.lean_mass_kg = comp.leanMassKg;
        }

        // Calculate waist-hip ratio
        if (validated.waist_cm && validated.hip_cm) {
            calculatedData.waist_hip_ratio = calculateWHR(validated.waist_cm, validated.hip_cm);
        }

        // Note: BMI calculation requires height which should come from client profile
        // We'll calculate it in the frontend or add a separate endpoint

        const { data, error } = await supabase
            .from('body_assessments')
            .insert({
                ...validated,
                ...calculatedData,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update an existing assessment
     */
    static async updateAssessment(id: string, input: UpdateAssessmentInput): Promise<Assessment> {
        const validated = updateAssessmentSchema.parse({ ...input, id });

        // Recalculate derived metrics if relevant fields changed
        const calculatedData: Partial<Assessment> = {};

        // Fetch current assessment to have access to weight if not provided in update
        const { data: current, error: fetchError } = await supabase
            .from('body_assessments')
            .select('weight_kg, body_fat_percentage')
            .eq('id', id)
            .single();

        if (!fetchError && current) {
            const weight = validated.weight_kg !== undefined ? validated.weight_kg : current.weight_kg;
            const fatPerc = validated.body_fat_percentage !== undefined ? validated.body_fat_percentage : current.body_fat_percentage;

            if (weight !== null && fatPerc !== null) {
                const comp = calculateComposition(weight, fatPerc);
                calculatedData.fat_mass_kg = comp.fatMassKg;
                calculatedData.lean_mass_kg = comp.leanMassKg;
            }
        }

        if (validated.waist_cm !== undefined && validated.hip_cm !== undefined) {
            calculatedData.waist_hip_ratio = parseFloat(
                (validated.waist_cm / validated.hip_cm).toFixed(3)
            );
        }

        const { data, error } = await supabase
            .from('body_assessments')
            .update({
                ...validated,
                ...calculatedData,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete an assessment
     */
    static async deleteAssessment(id: string): Promise<void> {
        const { error } = await supabase
            .from('body_assessments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Get all assessments for a client
     */
    static async getClientAssessments(clientId: string): Promise<Assessment[]> {
        const { data, error } = await supabase
            .from('body_assessments')
            .select('*')
            .eq('client_id', clientId)
            .order('assessment_date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get the latest assessment for a client
     */
    static async getLatestAssessment(clientId: string): Promise<Assessment | null> {
        const { data, error } = await supabase
            .from('body_assessments')
            .select('*')
            .eq('client_id', clientId)
            .order('assessment_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Get a specific assessment by ID
     */
    static async getAssessment(id: string): Promise<Assessment> {
        const { data, error } = await supabase
            .from('body_assessments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Calculate the delta between two assessments
     */
    static calculateDelta(latest: Assessment, previous: Assessment): AssessmentDelta {
        return {
            weight_delta: (latest.weight_kg || 0) - (previous.weight_kg || 0),
            body_fat_delta: (latest.body_fat_percentage || 0) - (previous.body_fat_percentage || 0),
            lean_mass_delta: (latest.lean_mass_kg || 0) - (previous.lean_mass_kg || 0),
            fat_mass_delta: (latest.fat_mass_kg || 0) - (previous.fat_mass_kg || 0),
            days_between: Math.floor(
                (new Date(latest.assessment_date).getTime() -
                    new Date(previous.assessment_date).getTime()) / (1000 * 60 * 60 * 24)
            ),
        };
    }

    /**
     * Calculate BMI given weight and height
     */
    static calculateBMI(weightKg: number, heightM: number): number {
        return calculateBMI(weightKg, heightM);
    }
}
