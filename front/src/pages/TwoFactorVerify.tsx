import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { post, setToken } from '@/services/api';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { TwoFactorVerifyResponse, ApiError } from '@/types';

/**
 * Page de verification 2FA lors de la connexion.
 * L'utilisateur saisit le code TOTP ou un code de secours.
 */
export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) return;
    setLoading(true);
    try {
      const response = await post<TwoFactorVerifyResponse>('/2fa/verify', { code });
      setToken(response.token);

      if (response.backupCodeUsed) {
        addToast('warning', 'Connexion avec un code de secours. Pensez a regenerer vos codes.');
      } else {
        addToast('success', 'Verification reussie.');
      }

      // Recharge la page pour que le AuthProvider detecte le nouveau token
      window.location.href = '/dashboard';
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="mb-6 text-center">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              Verification en deux etapes
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-gray-400">
              Entrez le code de votre application d&apos;authentification ou un code de secours.
            </p>
          </div>

          <Input
            label="Code de verification"
            type="text"
            placeholder="000000"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8))}
            autoFocus
          />

          <Button
            onClick={handleVerify}
            isLoading={loading}
            disabled={code.length < 6}
            className="mt-2 w-full"
          >
            Verifier
          </Button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 block w-full text-center text-sm text-secondary-500 hover:text-secondary-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Retour a la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
