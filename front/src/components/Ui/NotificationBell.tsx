import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '@/hooks/useNotifications';

// Couleurs par type de notification
const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  success: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

export default function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chargement des notifications a l'ouverture du dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, 5);
    }
  }, [isOpen, fetchNotifications]);

  // Fermeture au clic exterieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Formatage relatif de la date
  const formatRelative = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return 'maintenant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  // Gestion du clic sur une notification
  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-secondary-600 hover:bg-secondary-100 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label={t('nav.notifications')}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge compteur */}
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-secondary-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {/* En-tete */}
          <div className="flex items-center justify-between border-b border-secondary-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-white">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-secondary-500 dark:text-gray-400">
                {t('notifications.empty')}
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary-50 dark:hover:bg-gray-700 ${
                    !notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  {/* Icone type */}
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                      TYPE_COLORS[notification.type] || TYPE_COLORS.info
                    }`}
                  >
                    {notification.type === 'success' ? '✓' : notification.type === 'error' ? '!' : notification.type === 'warning' ? '⚠' : 'i'}
                  </span>

                  {/* Contenu */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        !notification.isRead
                          ? 'font-semibold text-secondary-900 dark:text-white'
                          : 'text-secondary-700 dark:text-gray-300'
                      }`}
                    >
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="mt-0.5 truncate text-xs text-secondary-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-secondary-400 dark:text-gray-500">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>

                  {/* Indicateur non lu */}
                  {!notification.isRead && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Pied de page */}
          <div className="border-t border-secondary-200 px-4 py-2 dark:border-gray-700">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              {t('notifications.viewAll')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
