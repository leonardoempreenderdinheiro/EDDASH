import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Carregando...</div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Check if profile is loaded and status is pending
    // We assume if session exists, profile loading is handled by AuthContext.
    // If profile is still null but session exists, it might be loading or error 
    // (AuthContext handles loading state, so if loading is false here, profile should be ready)

    // Safety check: if profile has not loaded yet effectively (though context says loading=false), 
    // we might want to wait or just proceed. 
    // Usually auth context sets loading=false only after profile attempt.

    const { profile } = useAuth();

    if (profile?.status === 'pending') {
        return <Navigate to="/pending-approval" replace />;
    }

    return <>{children}</>;
};
