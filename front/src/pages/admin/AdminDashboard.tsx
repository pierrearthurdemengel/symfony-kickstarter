import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/Layout/AdminLayout';
import { get } from '@/services/api';
import type { User, HydraCollection } from '@/types';

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des statistiques au montage
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Recuperation du total via itemsPerPage=1
        const countResponse = await get<HydraCollection<User>>(
          '/users?itemsPerPage=1',
        );
        setTotalUsers(countResponse['hydra:totalItems']);

        // Recuperation des 5 derniers inscrits
        const recentResponse = await get<HydraCollection<User>>(
          '/users?itemsPerPage=5&order[createdAt]=desc',
        );
        setRecentUsers(recentResponse['hydra:member']);
      } catch {
        setTotalUsers(0);
        setRecentUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Initiales d'un utilisateur
  const getInitials = (user: User): string => {
    const first = (user.firstName?.[0] || '').toUpperCase();
    const last = (user.lastName?.[0] || '').toUpperCase();
    return first + last || '?';
  };

  // Formatage de la date
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Admin', to: '/admin' }, { label: 'Dashboard' }]}
    >
      {/* Cards de statistiques */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total utilisateurs */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
              <svg
                className="h-6 w-6 text-primary-600 dark:text-primary-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-gray-400">
                Utilisateurs
              </p>
              {isLoading ? (
                <div className="mt-1 h-7 w-16 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
              ) : (
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {totalUsers}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Derniers inscrits */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            Derniers inscrits
          </h2>
          <Link
            to="/admin/users"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Voir tout
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-secondary-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
                  <div className="h-3 w-20 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <p className="text-sm text-secondary-500 dark:text-gray-400">
            Aucun utilisateur
          </p>
        ) : (
          <ul className="divide-y divide-secondary-100 dark:divide-gray-700">
            {recentUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                    {getInitials(user)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-secondary-400 dark:text-gray-500">
                  {formatDate(user.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
