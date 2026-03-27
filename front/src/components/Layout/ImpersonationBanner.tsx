import { useState, useEffect } from 'react';
import { post, setToken } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import type { ApiError } from '@/types';

/**
 * Detecte si l'utilisateur courant est impersonne (claim 'impersonator' dans le JWT).
 * Retourne le payload du JWT sans verification (decode base64 uniquement).
 */
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Banniere affichee en haut de page lorsqu'un admin impersonne un utilisateur.
 * Permet de revenir au compte admin d'un clic.
 */
export default function ImpersonationBanner() {
  const { addToast } = useToast();
  const [impersonatorId, setImpersonatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const payload = parseJwtPayload(token);
    if (payload?.impersonator && typeof payload.impersonator === 'string') {
      setImpersonatorId(payload.impersonator);
    }
  }, []);

  if (!impersonatorId) return null;

  const handleStopImpersonation = async () => {
    setLoading(true);
    try {
      const response = await post<{ token: string }>('/admin/stop-impersonation', {});
      setToken(response.token);
      addToast('success', 'Retour au compte administrateur.');
      window.location.href = '/admin';
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors du retour au compte admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between bg-warning-500 px-4 py-2 text-sm font-medium text-white shadow-md">
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Vous etes en mode impersonation</span>
      </div>
      <button
        onClick={handleStopImpersonation}
        disabled={loading}
        className="rounded bg-white/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/30 disabled:opacity-50"
      >
        {loading ? 'Retour...' : 'Revenir a mon compte'}
      </button>
    </div>
  );
}
