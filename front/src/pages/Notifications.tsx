import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';
import Button from '@/components/Ui/Button';
import Pagination from '@/components/Ui/Pagination';
import Badge from '@/components/Ui/Badge';

// Variantes de badge par type de notification
const TYPE_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
};

export default function Notifications() {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    totalPages,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotifications(currentPage, 15);
  }, [currentPage, fetchNotifications]);

  // Changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Formatage de la date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* En-tete */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {t('notifications.title')}
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-secondary-500 dark:text-gray-400">
              {t('notifications.unread', { count: unreadCount })}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {/* Liste des notifications */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-secondary-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
          <svg
            className="mx-auto h-12 w-12 text-secondary-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <p className="mt-4 text-secondary-500 dark:text-gray-400">
            {t('notifications.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm transition-colors dark:bg-gray-800 ${
                !notification.isRead
                  ? 'border-l-4 border-primary-500'
                  : 'border-l-4 border-transparent'
              }`}
            >
              {/* Contenu */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={TYPE_VARIANTS[notification.type] || 'info'}>
                    {t(`notifications.types.${notification.type}`)}
                  </Badge>
                  <span className="text-xs text-secondary-400 dark:text-gray-500">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    !notification.isRead
                      ? 'font-semibold text-secondary-900 dark:text-white'
                      : 'text-secondary-700 dark:text-gray-300'
                  }`}
                >
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="mt-0.5 text-sm text-secondary-500 dark:text-gray-400">
                    {notification.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-lg p-1.5 text-secondary-400 hover:bg-secondary-100 hover:text-primary-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                    title={t('notifications.markRead')}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="rounded-lg p-1.5 text-secondary-400 hover:bg-danger-50 hover:text-danger-600 dark:text-gray-500 dark:hover:bg-danger-900/20 dark:hover:text-danger-400"
                  title={t('common.delete')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
