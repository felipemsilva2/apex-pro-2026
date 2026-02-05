import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from environment variables
// In development: uses process.env.EXPO_PUBLIC_*
// In native builds: uses Constants.expoConfig.extra
export const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    Constants.expoConfig?.extra?.supabaseUrl ||
    '';

const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials!');
    console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export type Workout = {
    id: string;
    name: string;
    description: string | null;
    scheduled_date: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    completed_at: string | null;
};

export type WorkoutExercise = {
    id: string;
    workout_id: string;
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number | null;
    weight_kg: number | null;
    is_completed: boolean;
    order_index: number;
};

export type ChatMessage = {
    id: string;
    tenant_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    sender?: {
        full_name: string;
        avatar_url: string | null;
    };
};

export type Client = {
    id: string;
    tenant_id: string;
    user_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    current_weight: number | null;
    target_weight: number | null;
    height: number | null;
    status: 'active' | 'suspended' | 'cancelled';
    notes: string | null;
    last_weight_update: string | null;
    updated_at: string;
};
