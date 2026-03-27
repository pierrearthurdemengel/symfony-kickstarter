import { useState, useCallback } from 'react';
import { get } from '@/services/api';

interface SearchResult<T> {
  hits: T[];
  estimatedTotalHits: number;
  processingTimeMs: number;
}

interface UseSearchReturn<T> {
  results: T[];
  totalHits: number;
  loading: boolean;
  search: (query: string) => Promise<void>;
}

/**
 * Hook de recherche Meilisearch.
 * Effectue une recherche dans un index donne et retourne les resultats.
 */
export function useSearch<T>(index: string, limit = 20): UseSearchReturn<T> {
  const [results, setResults] = useState<T[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setTotalHits(0);
        return;
      }

      setLoading(true);
      try {
        const data = await get<SearchResult<T>>(
          `/search/${index}?q=${encodeURIComponent(query)}&limit=${limit}`,
        );
        setResults(data.hits);
        setTotalHits(data.estimatedTotalHits);
      } catch {
        setResults([]);
        setTotalHits(0);
      } finally {
        setLoading(false);
      }
    },
    [index, limit],
  );

  return { results, totalHits, loading, search };
}
