import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getTenantBranding, getEffectiveColors, type Tenant } from '../lib/whitelabel';
import type { User } from '@supabase/supabase-js';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { registerForPushNotificationsAsync } from '../lib/notifications';

interface AuthContextType {
    user: User | null;
    profile: {
        id: string;
        terms_accepted_at?: string | null;
        [key: string]: any;
    } | null; // Using any for profile/client data for now, but explicit for terms
    tenant: Tenant | null; // Tenant branding info
    brandColors: { primary: string; secondary: string }; // Effective colors
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<{ error: any }>;
    refreshProfile: () => Promise<void>;
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

            // Cast to any to avoid TS errors with inferred types
            const clientData = data as any;

            setProfile(clientData);

            // Load tenant branding if available
            if (clientData?.tenant) {
                setTenant(clientData.tenant);
                setBrandColors(getEffectiveColors(clientData.tenant));
            } else if (clientData?.tenant_id) {
                // Fallback: load tenant separately if not included in query
                const tenantData = await getTenantBranding(clientData.tenant_id);
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
            // Registrar para Notificações Push
            if (userId) {
                registerForPushNotificationsAsync().then(token => {
                    if (token) {
                        (supabase.from('profiles') as any).update({ push_token: token }).eq('id', userId)
                            .then(({ error }: any) => {
                                if (error) console.error('[Auth] Erro ao salvar push token:', error);
                            });
                    }
                });
            }
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

    const deleteAccount = async () => {
        try {
            if (!user) throw new Error('No user logged in');

            // NOTE: Per Apple guidelines, the user must be able to initiate account deletion from the app.
            // We mark the account as cancelled so the admin/backend can process the data removal.
            console.log('[Auth] Account deletion requested for user_id:', user.id);

            const { error } = await (supabase
                .from('clients') as any)
                .update({ status: 'cancelled' })
                .eq('user_id', user.id);

            if (error) {
                console.error('[Auth] Error marking account as cancelled:', error);
                throw error;
            }

            // Sign out to terminate the session immediately.
            // await signOut(); // REMOVED: Managed by UI to show alert first
            return { error: null };
        } catch (error) {
            console.error('Error in deleteAccount:', error);
            return { error };
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, tenant, brandColors, loading, signIn, signOut, deleteAccount, refreshProfile: () => user ? loadAthleteData(user.id) : Promise.resolve() }}>
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
