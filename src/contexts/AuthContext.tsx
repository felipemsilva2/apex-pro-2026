import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refetchProfile: (userId?: string) => Promise<void>;
}

import { resetBranding } from '@/lib/whitelabel';
import { queryClient } from '@/App';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const isLoggingOut = useRef(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (isLoggingOut.current) return;
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isLoggingOut.current) return;

            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                console.log('[AuthContext] No session. Resetting state and branding.');
                setUser(null);
                setProfile(null);
                resetBranding();
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);


    const loadProfile = async (userId?: string) => {
        if (isLoggingOut.current) return;

        const targetId = userId || user?.id;
        if (!targetId) return;

        try {
            // Fetch the profile directly
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', targetId)
                .maybeSingle();

            if (error) throw error;

            if (isLoggingOut.current) return;

            // If profile doesn't exist, that's okay - user just doesn't have a coach profile yet
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            setProfile(null);
        } finally {
            if (!isLoggingOut.current) {
                setLoading(false);
            }
        }
    };

    const signOut = async () => {
        try {
            console.log('[AuthContext] Starting deep sign out...');
            isLoggingOut.current = true; // Block any further state updates
            resetBranding();

            // 1. Clear caches
            if (queryClient) {
                queryClient.clear();
                console.log('[AuthContext] Query cache cleared.');
            }

            // 2. Reset state
            setUser(null);
            setProfile(null);

            // 3. Supabase Sign Out
            await supabase.auth.signOut();
            console.log('[AuthContext] Supabase sign out complete.');

            // 4. Manual Storage Clear (Nuclear Option)
            sessionStorage.clear();

            // Clear all possible Supabase keys from localStorage
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('supabase') || key.includes('auth-token') || key.startsWith('sb-'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log('[AuthContext] Storage cleared.');

            // 5. Force reload to ensure a primitive state
            // Add a small delay to ensure storage write completes
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);

        } catch (error) {
            console.error('[AuthContext] Error during sign out:', error);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, refetchProfile: loadProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
