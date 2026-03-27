import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { post } from '@/services/api';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { TwoFactorEnableResponse, TwoFactorConfirmResponse, ApiError } from '@/types';

/**
 * Page de configuration de l'authentification a deux facteurs.
 * Etapes : 1) generation du QR code, 2) verification du code TOTP.
 */
export default function TwoFactorSetup() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'init' | 'verify'>('init');
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  if (!user) return null;

  // Etape 1 : genere le secret et affiche le QR code
  const handleEnable = async () => {
    setLoading(true);
    try {
      const response = await post<TwoFactorEnableResponse>('/2fa/enable', {});
      setSecret(response.secret);
      setOtpauthUri(response.otpauthUri);
      setStep('verify');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de l\'activation du 2FA.');
    } finally {
      setLoading(false);
    }
  };

  // Etape 2 : verifie le code TOTP et active le 2FA
  const handleConfirm = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const response = await post<TwoFactorConfirmResponse>('/2fa/confirm', { code });
      setBackupCodes(response.backupCodes);
      setShowBackupCodes(true);
      addToast('success', 'Authentification a deux facteurs activee.');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  // Affichage des codes de secours apres activation
  if (showBackupCodes) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-secondary-900 dark:text-white">
            Codes de secours
          </h2>
          <p className="mb-4 text-sm text-secondary-600 dark:text-gray-400">
            Conservez ces codes dans un endroit sur. Ils vous permettront de vous connecter
            si vous perdez l&apos;acces a votre application d&apos;authentification.
          </p>
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-secondary-50 p-4 font-mono text-sm dark:bg-gray-700">
            {backupCodes.map((bCode) => (
              <div key={bCode} className="text-secondary-900 dark:text-white">{bCode}</div>
            ))}
          </div>
          <Button onClick={() => navigate('/profile')} className="w-full">
            J&apos;ai sauvegarde mes codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-bold text-secondary-900 dark:text-white">
          Activer l&apos;authentification a deux facteurs
        </h2>

        {step === 'init' && (
          <>
            <p className="mb-6 text-sm text-secondary-600 dark:text-gray-400">
              L&apos;authentification a deux facteurs ajoute une couche de securite supplementaire
              a votre compte en exigeant un code temporaire en plus de votre mot de passe.
            </p>
            <Button onClick={handleEnable} isLoading={loading} className="w-full">
              Configurer le 2FA
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="mb-4 text-sm text-secondary-600 dark:text-gray-400">
              Scannez le QR code ci-dessous avec votre application d&apos;authentification
              (Google Authenticator, Authy, etc.), puis entrez le code genere.
            </p>

            {/* QR Code via Google Charts API */}
            <div className="mb-4 flex justify-center">
              <img
                src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUri)}`}
                alt="QR Code TOTP"
                className="rounded-lg"
                width={200}
                height={200}
              />
            </div>

            {/* Secret en texte pour saisie manuelle */}
            <div className="mb-6 rounded-lg bg-secondary-50 p-3 text-center dark:bg-gray-700">
              <p className="mb-1 text-xs text-secondary-500 dark:text-gray-400">
                Ou entrez ce code manuellement :
              </p>
              <code className="select-all font-mono text-sm font-bold text-secondary-900 dark:text-white">
                {secret}
              </code>
            </div>

            <Input
              label="Code de verification"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <Button
              onClick={handleConfirm}
              isLoading={loading}
              disabled={code.length !== 6}
              className="mt-2 w-full"
            >
              Verifier et activer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
