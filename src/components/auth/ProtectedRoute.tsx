import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const { user, profile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
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

    // Coach Onboarding Guard
    if (profile?.role === 'coach') {
        const isOnboarding = location.pathname === '/onboarding';
        // Check if mandatory fields are present (using CREF as the main indicator)
        const isProfileComplete = !!profile.cref;

        if (!isProfileComplete && !isOnboarding) {
            return <Navigate to="/onboarding" replace />;
        }

        if (isProfileComplete && isOnboarding) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
}
