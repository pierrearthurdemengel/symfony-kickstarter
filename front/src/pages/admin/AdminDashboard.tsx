import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import AdminLayout from '@/components/Layout/AdminLayout';
import Button from '@/components/Ui/Button';
import { useAdminStats } from '@/hooks/useAdminStats';
import { get } from '@/services/api';
import type { User, HydraCollection } from '@/types';

// Couleurs pour le graphique en camembert
const ROLE_COLORS: Record<string, string> = {
  ROLE_USER: '#3b82f6',
  ROLE_ADMIN: '#ef4444',
};
const DEFAULT_COLOR = '#8b5cf6';

export default function AdminDashboard() {
  const { stats, isLoading: statsLoading, fetchStats, exportCsv } = useAdminStats();
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Chargement des statistiques et des derniers inscrits
  useEffect(() => {
    fetchStats();

    const loadRecentUsers = async () => {
      try {
        const response = await get<HydraCollection<User>>(
          '/users?itemsPerPage=5&order[createdAt]=desc',
        );
        setRecentUsers(response['hydra:member']);
      } catch {
        setRecentUsers([]);
      }
    };

    loadRecentUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Export CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCsv();
    } catch {
      // Gere silencieusement
    } finally {
      setIsExporting(false);
    }
  };

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

  // Preparation des donnees pour le graphique en camembert
  const pieData = stats?.roleDistribution
    ? Object.entries(stats.roleDistribution).map(([name, value]) => ({
        name: name.replace('ROLE_', ''),
        value,
      }))
    : [];

  // Formatage du label de mois (YYYY-MM -> MMM)
  const formatMonth = (month: string): string => {
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year, 10), parseInt(m, 10) - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short' });
  };

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumb={[{ label: 'Admin', to: '/admin' }, { label: 'Dashboard' }]}
    >
      {/* Bouton export */}
      <div className="mb-6 flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport} isLoading={isExporting}>
          Exporter CSV
        </Button>
      </div>

      {/* Cards de statistiques */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total utilisateurs */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-secondary-500 dark:text-gray-400">Utilisateurs</p>
          {statsLoading ? (
            <div className="mt-1 h-7 w-16 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-secondary-900 dark:text-white">
              {stats?.totalUsers ?? 0}
            </p>
          )}
        </div>

        {/* Emails verifies */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-secondary-500 dark:text-gray-400">Emails verifies</p>
          {statsLoading ? (
            <div className="mt-1 h-7 w-16 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-success-600 dark:text-success-400">
              {stats?.verifiedUsers ?? 0}
            </p>
          )}
        </div>

        {/* Taux de verification */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-secondary-500 dark:text-gray-400">Taux de verification</p>
          {statsLoading ? (
            <div className="mt-1 h-7 w-16 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats?.verificationRate ?? 0}%
            </p>
          )}
        </div>

        {/* Nombre de roles admin */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <p className="text-sm text-secondary-500 dark:text-gray-400">Admins</p>
          {statsLoading ? (
            <div className="mt-1 h-7 w-16 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-danger-600 dark:text-danger-400">
              {stats?.roleDistribution?.ROLE_ADMIN ?? 0}
            </p>
          )}
        </div>
      </div>

      {/* Graphiques */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Inscriptions par mois */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
            Inscriptions par mois
          </h2>
          {statsLoading ? (
            <div className="h-64 animate-pulse rounded bg-secondary-100 dark:bg-gray-700" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.registrationsByMonth ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label) => {
                    const str = String(label);
                    const [y, m] = str.split('-');
                    return new Date(parseInt(y, 10), parseInt(m, 10) - 1).toLocaleDateString(
                      'fr-FR',
                      { month: 'long', year: 'numeric' },
                    );
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Repartition des roles */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900 dark:text-white">
            Repartition des roles
          </h2>
          {statsLoading ? (
            <div className="h-64 animate-pulse rounded bg-secondary-100 dark:bg-gray-700" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={ROLE_COLORS[`ROLE_${entry.name}`] || DEFAULT_COLOR}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
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

        {statsLoading ? (
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
          <p className="text-sm text-secondary-500 dark:text-gray-400">Aucun utilisateur</p>
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
                    <p className="text-xs text-secondary-500 dark:text-gray-400">{user.email}</p>
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
