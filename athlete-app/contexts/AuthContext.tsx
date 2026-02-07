import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getTenantBranding, getEffectiveColors, type Tenant } from '../lib/whitelabel';
import type { User } from '@supabase/supabase-js';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

interface AuthContextType {
    user: User | null;
    profile: any | null; // Using any for profile/client data for now
    tenant: Tenant | null; // Tenant branding info
    brandColors: { primary: string; secondary: string }; // Effective colors
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * RealtimeManager
 * Inner component to hook into Supabase Realtime safely within the QueryClient context
 */
function RealtimeManager() {
    useRealtimeSync();
    return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [brandColors, setBrandColors] = useState(getEffectiveColors(null));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                loadAthleteData(currentUser.id);
            } else {
                setLoading(false);
            }
        }).catch((error) => {
            // Suppress "Invalid Refresh Token" errors - just means no active session
            if (!error.message?.includes('Refresh Token')) {
                console.error('Error getting session:', error);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                loadAthleteData(currentUser.id);
            } else {
                setProfile(null);
                setTenant(null);
                setBrandColors(getEffectiveColors(null));
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadAthleteData = async (userId: string) => {
        try {
            // For the athlete app, the "profile" is the 'clients' record
            const { data, error } = await supabase
                .from('clients')
                .select('*, tenant:tenants(*)')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            setProfile(data);

            // Load tenant branding if available
            if (data?.tenant) {
                setTenant(data.tenant);
                setBrandColors(getEffectiveColors(data.tenant));
                console.log('[Auth] Loaded tenant branding:', data.tenant.business_name);
            } else if (data?.tenant_id) {
                // Fallback: load tenant separately if not included in query
                const tenantData = await getTenantBranding(data.tenant_id);
                setTenant(tenantData);
                setBrandColors(getEffectiveColors(tenantData));
            }
        } catch (error) {
            console.error('Error loading athlete data:', error);
            setProfile(null);
            setTenant(null);
            setBrandColors(getEffectiveColors(null));
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        setUser(null);
        setProfile(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, tenant, brandColors, loading, signIn, signOut }}>
            {user && <RealtimeManager />}
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
