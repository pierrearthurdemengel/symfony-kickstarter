import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useTranslation } from 'react-i18next';

/**
 * Banniere affichee quand l'application est hors ligne.
 * Masquee automatiquement quand la connexion est retablie.
 */
export default function OfflineBanner() {
  const { isOnline } = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-900"
    >
      {t('offline.banner', 'Connexion perdue. Les modifications seront synchronisees au retour.')}
    </div>
  );
}
