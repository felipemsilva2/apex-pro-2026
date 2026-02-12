import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

    const fetchTenant = useCallback(async () => {
        try {
            console.log('[TenantContext] Detecting tenant...');

            // 1. First priority: Tenant linked to the authenticated user
            if (profile?.tenant_id) {
                console.log('[TenantContext] Fetching user tenant:', profile.tenant_id);
                // We need to fetch the tenant by ID
                const { data: userTenant, error } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                if (userTenant) {
                    setTenant(userTenant);
                    injectBranding(userTenant);
                    setLoading(false);
                    return;
                }
            }

            // 2. Second priority: Domain/Subdomain detection
            console.log('[TenantContext] No user tenant linked. Falling back to domain detection.');
            const config = await detectTenant();
            console.log('[TenantContext] Domain detected config:', config?.business_name || 'None');

            if (config) {
                console.log('[TenantContext] Applying detected tenant branding.');
                setTenant(config);
                injectBranding(config);
            } else {
                console.log('[TenantContext] No tenant found. Resetting to default branding.');
                setTenant(null);
                resetBranding();
            }
        } catch (err) {
            console.error('Failed to initialize tenant:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [profile?.tenant_id, user?.id]); // Re-run if profile tenant or user ID changes

    useEffect(() => {
        fetchTenant();
    }, [fetchTenant]);

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
