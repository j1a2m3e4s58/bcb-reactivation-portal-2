import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Navigate } from "@tanstack/react-router";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useStaffAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Verifying authentication…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" />;
  }

  return <>{children}</>;
}
