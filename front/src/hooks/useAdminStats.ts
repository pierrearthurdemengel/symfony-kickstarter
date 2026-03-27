import { useState, useCallback } from 'react';
import { get } from '@/services/api';
import type { AdminStats } from '@/types';

/**
 * Hook pour les statistiques admin avancees.
 */
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recuperation des statistiques
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await get<AdminStats>('/admin/stats');
      setStats(response);
    } catch {
      setError('Erreur lors du chargement des statistiques.');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Export CSV des utilisateurs
  const exportCsv = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${baseUrl}/admin/users/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'export.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extraction du nom de fichier depuis le header Content-Disposition
      const disposition = response.headers.get('Content-Disposition');
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'export.csv';
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      throw new Error("Erreur lors de l'export CSV.");
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    exportCsv,
  };
}
