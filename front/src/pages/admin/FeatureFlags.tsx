import { useEffect, useState, useCallback } from 'react';
import { get, put } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import AdminLayout from '@/components/Layout/AdminLayout';
import type { ApiError } from '@/types';

type FlagMap = Record<string, boolean>;

// Labels lisibles pour les feature flags
const FLAG_LABELS: Record<string, string> = {
  oauth_google: 'Connexion Google',
  oauth_github: 'Connexion GitHub',
  two_factor_auth: 'Authentification 2FA',
  user_registration: 'Inscription des utilisateurs',
  maintenance_mode: 'Mode maintenance',
  dark_mode: 'Mode sombre',
  notifications_realtime: 'Notifications temps reel (Mercure)',
  search_enabled: 'Recherche (Meilisearch)',
};

/**
 * Page d'administration des feature flags.
 */
export default function FeatureFlags() {
  const { addToast } = useToast();
  const [flags, setFlags] = useState<FlagMap>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadFlags = useCallback(async () => {
    try {
      const data = await get<FlagMap>('/feature-flags');
      setFlags(data);
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const handleToggle = async (flag: string) => {
    const newValue = !flags[flag];
    setToggling(flag);
    try {
      await put(`/admin/feature-flags/${flag}`, { enabled: newValue });
      setFlags((prev) => ({ ...prev, [flag]: newValue }));
      addToast('success', `${FLAG_LABELS[flag] || flag} ${newValue ? 'active' : 'desactive'}.`);
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur.');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Feature Flags">
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Feature Flags">
      <div className="rounded-xl bg-white shadow-md dark:bg-gray-800">
        <div className="divide-y divide-secondary-100 dark:divide-gray-700">
          {Object.entries(flags).map(([flag, enabled]) => (
            <div key={flag} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-secondary-900 dark:text-white">
                  {FLAG_LABELS[flag] || flag}
                </p>
                <p className="text-sm text-secondary-500 dark:text-gray-400">{flag}</p>
              </div>
              <button
                onClick={() => handleToggle(flag)}
                disabled={toggling === flag}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800 ${
                  enabled ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
