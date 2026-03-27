import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { post } from '@/services/api';

/**
 * Hook de detection de la connectivite reseau.
 * Met a jour le store global et rejoue les actions en file d'attente
 * quand la connexion est retablie.
 */
export function useOnlineStatus(): { isOnline: boolean } {
  const isOnline = useAppStore((state) => state.isOnline);
  const setIsOnline = useAppStore((state) => state.setIsOnline);
  const offlineQueue = useAppStore((state) => state.offlineQueue);
  const clearOfflineQueue = useAppStore((state) => state.clearOfflineQueue);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  // Replay des actions en file d'attente quand la connexion revient
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      const replayActions = async () => {
        for (const action of offlineQueue) {
          try {
            await post(action.path, action.body);
          } catch {
            // Les actions echouees sont ignorees silencieusement
          }
        }
        clearOfflineQueue();
      };
      replayActions();
    }
  }, [isOnline, offlineQueue, clearOfflineQueue]);

  return { isOnline };
}
