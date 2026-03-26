import { useEffect, useState } from 'react';
import AdminLayout from '@/components/Layout/AdminLayout';
import Badge from '@/components/Ui/Badge';
import Pagination from '@/components/Ui/Pagination';
import { useAuditLog } from '@/hooks/useAuditLog';
import type { AuditLogEntry } from '@/types';

// Correspondance action -> variante de badge
const actionBadge = (action: string) => {
  switch (action) {
    case 'create':
      return 'success' as const;
    case 'update':
      return 'info' as const;
    case 'delete':
      return 'danger' as const;
    default:
      return 'secondary' as const;
  }
};

// Correspondance action -> libelle francais
const actionLabel = (action: string): string => {
  switch (action) {
    case 'create':
      return 'Creation';
    case 'update':
      return 'Modification';
    case 'delete':
      return 'Suppression';
    case 'login':
      return 'Connexion';
    case 'export':
      return 'Export';
    default:
      return action;
  }
};

// Formatage de la date et heure
const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AuditLogPage() {
  const { data, isLoading, error, fetchLogs } = useAuditLog();
  const [currentPage, setCurrentPage] = useState(1);

  // Chargement initial
  useEffect(() => {
    fetchLogs(1, 30);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLogs(page, 30);
  };

  return (
    <AdminLayout
      title="Journal d'audit"
      breadcrumb={[
        { label: 'Admin', to: '/admin' },
        { label: "Journal d'audit" },
      ]}
    >
      {error && (
        <div className="mb-4 rounded-lg bg-danger-50 p-4 text-sm text-danger-700 dark:bg-danger-900/20 dark:text-danger-400">
          {error}
        </div>
      )}

      {/* Tableau des entrees d'audit */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <table className="min-w-full divide-y divide-secondary-200 dark:divide-gray-700">
          <thead className="bg-secondary-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-gray-400">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-gray-400">
                Entite
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-gray-400">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-gray-400">
                IP
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500 dark:text-gray-400">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary-200 dark:bg-gray-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-secondary-500 dark:text-gray-400"
                >
                  Aucune entree dans le journal d'audit
                </td>
              </tr>
            ) : (
              data?.items.map((entry: AuditLogEntry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-secondary-50 dark:hover:bg-gray-700/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-secondary-600 dark:text-gray-400">
                    {formatDateTime(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={actionBadge(entry.action)}>
                      {actionLabel(entry.action)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-900 dark:text-white">
                    <span className="font-medium">{entry.entityType}</span>
                    {entry.entityId && (
                      <span className="ml-1 text-xs text-secondary-400 dark:text-gray-500">
                        #{entry.entityId.slice(0, 8)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-600 dark:text-gray-400">
                    {entry.performedBy || '-'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-secondary-500 dark:text-gray-500">
                    {entry.ipAddress || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {Object.keys(entry.changes).length > 0 ? (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          {Object.keys(entry.changes).length} champ(s)
                        </summary>
                        <pre className="mt-1 max-w-xs overflow-auto rounded bg-secondary-100 p-2 text-xs dark:bg-gray-900">
                          {JSON.stringify(entry.changes, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-xs text-secondary-400 dark:text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </AdminLayout>
  );
}
