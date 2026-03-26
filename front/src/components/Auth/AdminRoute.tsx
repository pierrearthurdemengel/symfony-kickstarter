import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Route protegee reservee aux administrateurs
 * Redirige vers /login si non authentifie, vers /dashboard si pas admin
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Loader pendant la verification du token
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="h-10 w-10 animate-spin text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-sm text-secondary-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirection vers login si non authentifie
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirection vers dashboard si pas admin
  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
