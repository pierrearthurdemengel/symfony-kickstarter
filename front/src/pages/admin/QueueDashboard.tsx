import { useEffect, useState, useCallback } from 'react';
import { get, post } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import AdminLayout from '@/components/Layout/AdminLayout';
import Button from '@/components/Ui/Button';
import type { ApiError } from '@/types';

interface QueueStats {
  pending: number;
  failed: number;
  recentDelivered: number;
}

interface FailedMessage {
  id: number;
  queueName: string;
  createdAt: string;
  type: string;
}

/**
 * Dashboard de monitoring des files d'attente Messenger.
 */
export default function QueueDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [failedMessages, setFailedMessages] = useState<FailedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [statsData, failedData] = await Promise.all([
        get<QueueStats>('/admin/queue/stats'),
        get<FailedMessage[]>('/admin/queue/failed'),
      ]);
      setStats(statsData);
      setFailedMessages(failedData);
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
    // Rafraichissement automatique toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRetry = async (id: number) => {
    setRetrying(id);
    try {
      await post(`/admin/queue/retry/${id}`, {});
      addToast('success', "Message remis en file d'attente.");
      loadData();
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de la retentative.');
    } finally {
      setRetrying(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Files d'attente">
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
    <AdminLayout title="Files d'attente">
      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <p className="text-sm text-secondary-500 dark:text-gray-400">En attente</p>
            <p className="mt-1 text-3xl font-bold text-secondary-900 dark:text-white">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <p className="text-sm text-secondary-500 dark:text-gray-400">En echec</p>
            <p
              className={`mt-1 text-3xl font-bold ${stats.failed > 0 ? 'text-danger-600' : 'text-secondary-900 dark:text-white'}`}
            >
              {stats.failed}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <p className="text-sm text-secondary-500 dark:text-gray-400">Traites (1h)</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{stats.recentDelivered}</p>
          </div>
        </div>
      )}

      {/* Messages en echec */}
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Messages en echec
          </h3>
          <Button variant="outline" size="sm" onClick={loadData}>
            Rafraichir
          </Button>
        </div>

        {failedMessages.length === 0 ? (
          <p className="py-4 text-center text-sm text-secondary-500 dark:text-gray-400">
            Aucun message en echec.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-secondary-500 dark:text-gray-400">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-secondary-500 dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-secondary-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase text-secondary-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-gray-700">
                {failedMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td className="px-4 py-3 text-sm text-secondary-900 dark:text-white">
                      #{msg.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600 dark:text-gray-400">
                      {msg.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary-600 dark:text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetry(msg.id)}
                        isLoading={retrying === msg.id}
                      >
                        Retenter
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
