import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  permission?: string;
  anyOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Composant conditionnel qui affiche ses enfants uniquement si
 * l'utilisateur possede la permission requise.
 */
export default function PermissionGate({
  permission,
  anyOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (anyOf && !hasAnyPermission(anyOf)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
