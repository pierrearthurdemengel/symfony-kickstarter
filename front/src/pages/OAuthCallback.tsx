import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { post, setToken } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { AuthResponse, ApiError } from '@/types';

/**
 * Page de callback OAuth.
 * Recoit le code d'autorisation depuis l'URL et l'echange contre un JWT.
 */
export default function OAuthCallback() {
  const { provider } = useParams<{ provider: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  // On accede au login pour forcer le rechargement du user apres OAuth
  const { logout } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code || !provider) {
      setError("Code d'autorisation manquant.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/oauth/callback/${provider}`;
        const response = await post<AuthResponse>(`/oauth/${provider}/callback`, {
          code,
          redirectUri,
        });

        setToken(response.token);
        addToast('success', 'Connexion reussie.');
        // Recharge la page pour que le AuthProvider detecte le nouveau token
        window.location.href = '/dashboard';
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Erreur lors de l'authentification OAuth.");
      }
    };

    exchangeCode();
  }, [provider, addToast, logout, navigate]);

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 text-danger-500">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-secondary-900 dark:text-white">
            Erreur d&apos;authentification
          </h2>
          <p className="mb-6 text-secondary-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Retour a la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <svg className="h-10 w-10 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
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
        <p className="text-sm text-secondary-500 dark:text-gray-400">Connexion en cours...</p>
      </div>
    </div>
  );
}
