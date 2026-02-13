import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const { user, profile, loading } = useAuth();
    const { tenant, loading: tenantLoading } = useTenant();
    const location = useLocation();

    if (loading || tenantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // If user is logged in but role is not allowed (e.g. student trying to access coach dashboard)
        return <Navigate to={profile.role === 'client' ? '/app' : '/dashboard'} replace />;
    }

    // Direct athletes always to /app if they try to access something else
    if (profile?.role === 'client' && location.pathname !== '/app') {
        return <Navigate to="/app" replace />;
    }

    // Coach Flow (including Paywall)
    if (profile?.role === 'coach') {
        const isOnboarding = location.pathname === '/onboarding';
        const isBilling = location.pathname.startsWith('/dashboard/billing') || location.pathname === '/blocked';

        // 1. Subscription Guard (The Paywall) - Prioritizied
        const allowedStatuses = ['active', 'trialing'];
        // Wait for tenant if we know we are a coach but tenant is missing/loading
        if (!tenant && !isBilling && !isOnboarding) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            );
        }

        const currentStatus = tenant?.subscription_status || 'pending';

        if (!allowedStatuses.includes(currentStatus) && !isBilling) {
            // Se está pendente (Pix aguardando), manda para o faturamento para ver o QR Code
            if (currentStatus === 'pending' && location.pathname !== '/dashboard/billing') {
                return <Navigate to="/dashboard/billing" replace />;
            }
            // Se já está no faturamento ou blocked, não redireciona infinitamente
            if (!isBilling) {
                return <Navigate to="/blocked" replace />;
            }
        }

        // 2. Onboarding Guard - Only if Payment is OK
        const isProfileComplete = !!profile.cref;
        if (allowedStatuses.includes(currentStatus) && !isProfileComplete && !isOnboarding) {
            return <Navigate to="/onboarding" replace />;
        }
    }

    return <>{children}</>;
}
