import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Diagnostic logs for Production (Safely showing only parts of the key)
console.log('[Supabase] Initializing client...', {
    url: `${supabaseUrl.substring(0, 15)}...`,
    keyPrefix: `${supabaseAnonKey.substring(0, 10)}...`,
    keySuffix: `...${supabaseAnonKey.substring(supabaseAnonKey.length - 10)}`,
    keyLength: supabaseAnonKey.length
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Database types
export type Tenant = {
    id: string;
    subdomain: string;
    custom_domain: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    font_family: string | null;
    business_name: string;
    tagline: string | null;
    contact_email: string | null;
    plan_tier: 'free' | 'pro' | 'elite' | null;
    created_at: string;
    updated_at: string;
};

export type Profile = {
    id: string;
    tenant_id: string | null;
    role: 'coach' | 'client';
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
    cref: string | null;
    specialty: string | null;
    bio: string | null;
    education: string | null;
    instagram: string | null;
    linkedin: string | null;
    website: string | null;
    created_at: string;
    updated_at: string;
};

export type Client = {
    id: string;
    tenant_id: string;
    user_id: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    birth_date: string | null;
    gender: 'male' | 'female' | 'other' | null;
    current_weight: number | null;
    target_weight: number | null;
    height: number | null;
    status: 'active' | 'inactive' | 'paused' | 'suspended' | 'cancelled';
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type Workout = {
    id: string;
    tenant_id: string;
    client_id: string;
    name: string;
    description: string | null;
    scheduled_date: string | null;
    duration_minutes: number | null;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    day_focus: Record<string, string> | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
};

export type WorkoutExercise = {
    id: string;
    workout_id: string;
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number | null;
    weight_kg: number | null;
    notes: string | null;
    order_index: number;
    day: string | null;
    is_completed: boolean;
    completed_at: string | null;
    gif_url?: string | null;
    exercise_library_id?: string | null;
    created_at: string;
};

export type ExerciseLibrary = {
    id: string;
    name_pt: string;
    name_en: string | null;
    gif_url: string | null;
    muscle_group: string | null;
    equipment: string | null;
    difficulty: string | null;
    instructions: string | null;
    keywords?: string[] | null;
    created_at: string;
    updated_at: string;
};

export type MealPlan = {
    id: string;
    tenant_id: string;
    client_id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    target_calories: number | null;
    target_protein_g: number | null;
    target_carbs_g: number | null;
    target_fats_g: number | null;
    status: 'active' | 'inactive' | 'completed';
    created_at: string;
    updated_at: string;
};

export type Meal = {
    id: string;
    meal_plan_id: string;
    name: string;
    time_of_day: string | null;
    day_of_week: number | null;
    foods: Array<{
        name: string;
        qty: string;
        unit: string;
        kcal: number;
        protein: number;
        carbs: number;
        fats: number;
    }>;
    total_calories: number | null;
    total_protein_g: number | null;
    total_carbs_g: number | null;
    total_fats_g: number | null;
    notes: string | null;
    order_index: number | null;
    created_at: string;
};
export type Appointment = {
    id: string;
    tenant_id: string;
    client_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    type: 'session' | 'evaluation' | 'call' | 'other';
    status: 'pending' | 'confirmed' | 'cancelled';
    video_link?: string | null;
    created_at: string;
    updated_at: string;
};

export type ChatMessage = {
    id: string;
    tenant_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
};

export type HormonalProtocol = {
    id: string;
    tenant_id: string;
    client_id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    status: 'active' | 'completed' | 'stopped';
    created_at: string;
    compounds?: HormonalCompound[];
};

export type HormonalCompound = {
    id: string;
    protocol_id: string;
    name: string;
    dosage: string;
    frequency: string;
    notes: string | null;
    created_at: string;
};

export type ClientDocument = {
    id: string;
    tenant_id: string;
    client_id: string;
    title: string;
    file_url: string;
    file_type: 'pdf' | 'image' | 'text' | 'other';
    category: string | null;
    created_at: string;
};
