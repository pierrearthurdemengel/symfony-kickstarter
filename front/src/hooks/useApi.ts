import { useState, useCallback } from 'react';
import type { ApiError } from '@/types';

// Interface de retour du hook
interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  execute: (...args: unknown[]) => Promise<T | null>;
}

/**
 * Hook generique pour les appels API avec gestion du loading et des erreurs
 */
export function useApi<T>(apiFunction: (...args: unknown[]) => Promise<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction],
  );

  return { data, error, isLoading, execute };
}
