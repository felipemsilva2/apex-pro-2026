import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { type Tenant, supabase } from '@/lib/supabase';
import { detectTenant, injectBranding, resetBranding } from '@/lib/whitelabel';
import { useAuth } from './AuthContext';

interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
    error: Error | null;
    refetchTenant: () => Promise<void>;
    t: (key: string, defaultValue?: string) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { user, profile } = useAuth(); // We need auth context to check for user's tenant

    const lastRequestId = useRef(0);

    const fetchTenant = useCallback(async () => {
        const requestId = ++lastRequestId.current;
        setLoading(true);
        setError(null);

        try {
            console.log(`[TenantContext] Detecting tenant (Request #${requestId})...`);

            // Guard: If no user/profile during the start, we might still want domain detection
            // but if they just logged out, we should stop.

            // 1. First priority: Tenant linked to the authenticated user
            if (profile?.tenant_id) {
                console.log(`[TenantContext #${requestId}] Fetching user tenant:`, profile.tenant_id);
                const { data: userTenant, error } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                // Check version
                if (requestId !== lastRequestId.current) {
                    console.log(`[TenantContext #${requestId}] Stale request (user tenant). Ignoring.`);
                    return;
                }

                if (userTenant) {
                    setTenant(userTenant);
                    injectBranding(userTenant);
                    return;
                }
            }

            // 2. Second priority: Domain/Subdomain detection
            console.log(`[TenantContext #${requestId}] Falling back to domain detection.`);
            const config = await detectTenant();

            // Check version again after async call
            if (requestId !== lastRequestId.current) {
                console.log(`[TenantContext #${requestId}] Stale request (domain). Ignoring.`);
                return;
            }

            if (config) {
                setTenant(config);
                injectBranding(config);
            } else {
                setTenant(null);
                resetBranding();
            }
        } catch (err) {
            console.error(`[TenantContext #${requestId}] Failed to initialize tenant:`, err);
            // Only set error if it's the latest request
            if (requestId === lastRequestId.current) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            }
        } finally {
            // Only set loading false if it's the latest request
            if (requestId === lastRequestId.current) {
                setLoading(false);
            }
        }
    }, [profile?.tenant_id, user?.id]); // Re-run if profile tenant or user ID changes

    useEffect(() => {
        if (!user && !profile) {
            console.log('[TenantContext] No active session. Resetting tenant state.');
            setTenant(null);
            resetBranding();
            setLoading(false); // Stop loading if no session
            return;
        }
        fetchTenant();
    }, [fetchTenant, user, profile]);

    const refetchTenant = useCallback(async () => {
        await fetchTenant();
    }, [fetchTenant]);

    const t = useCallback((key: string, defaultValue?: string) => {
        if (!tenant?.terminology || !tenant.terminology[key]) {
            return defaultValue || key;
        }
        return tenant.terminology[key];
    }, [tenant]);

    return (
        <TenantContext.Provider value={{ tenant, loading, error, refetchTenant, t }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
