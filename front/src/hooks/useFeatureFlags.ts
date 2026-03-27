import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createElement } from 'react';
import { get } from '@/services/api';

type FeatureFlags = Record<string, boolean>;

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isEnabled: (flag: string) => boolean;
  loading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
  children: ReactNode;
}

/**
 * Provider de feature flags.
 * Charge les flags depuis l'API au montage et les met en cache.
 */
export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const data = await get<FeatureFlags>('/feature-flags');
        setFlags(data);
      } catch {
        // En cas d'erreur, tous les flags sont desactives par defaut
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  const isEnabled = useCallback(
    (flag: string): boolean => {
      return flags[flag] ?? false;
    },
    [flags],
  );

  const value: FeatureFlagContextType = { flags, isEnabled, loading };

  return createElement(FeatureFlagContext.Provider, { value }, children);
}

/**
 * Hook pour acceder aux feature flags.
 */
export function useFeatureFlags(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags doit etre utilise dans un FeatureFlagProvider');
  }
  return context;
}
