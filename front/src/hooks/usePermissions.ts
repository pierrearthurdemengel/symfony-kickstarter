import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook pour verifier les permissions RBAC de l'utilisateur connecte.
 */
export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;

  // Verifie si l'utilisateur possede une permission donnee
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      return user.permissions?.includes(permission) ?? false;
    },
    [user, isAdmin],
  );

  // Verifie si l'utilisateur possede au moins une des permissions
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      return permissions.some((p) => user.permissions?.includes(p) ?? false);
    },
    [user, isAdmin],
  );

  return { hasPermission, hasAnyPermission, isAdmin, permissions: user?.permissions ?? [] };
}
