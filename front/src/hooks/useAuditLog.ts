import { useState, useCallback } from 'react';
import { get } from '@/services/api';
import type { AuditLogResponse } from '@/types';

/**
 * Hook pour la gestion du journal d'audit admin.
 */
export function useAuditLog() {
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recuperation des entrees d'audit paginee
  const fetchLogs = useCallback(async (page = 1, limit = 30) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get<AuditLogResponse>(
        `/admin/audit-logs?page=${page}&limit=${limit}`,
      );
      setData(response);
    } catch {
      setError("Erreur lors du chargement du journal d'audit.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchLogs,
  };
}
