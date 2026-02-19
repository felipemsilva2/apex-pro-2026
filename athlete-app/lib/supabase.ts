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
    console.error('[Supabase] Missing credentials!');
    console.log('[Supabase] URL:', supabaseUrl ? 'Found' : 'Missing');
    console.log('[Supabase] Key:', supabaseAnonKey ? 'Found' : 'Missing');
}

// Custom Storage Adapter for better debugging and reliability
const AsyncStorageAdapter = {
    getItem: async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key);
            console.log(`[Supabase Storage] GET ${key}:`, value ? 'Found' : 'Not Found');
            return value;
        } catch (e) {
            console.error('[Supabase Storage] GET Error:', e);
            return null;
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
            console.log(`[Supabase Storage] SET ${key}`);
        } catch (e) {
            console.error('[Supabase Storage] SET Error:', e);
        }
    },
    removeItem: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
            console.log(`[Supabase Storage] REMOVE ${key}`);
        } catch (e) {
            console.error('[Supabase Storage] REMOVE Error:', e);
        }
    },
};

let supabaseInstance: ReturnType<typeof createClient>;
try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            storage: AsyncStorageAdapter,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
} catch (e) {
    console.error('[Supabase] createClient() failed:', e);
    // Create a minimal fallback client so the app doesn't crash
    supabaseInstance = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
            auth: {
                storage: AsyncStorageAdapter,
                persistSession: false,
                detectSessionInUrl: false
            }
        }
    );
}
export const supabase = supabaseInstance;

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
