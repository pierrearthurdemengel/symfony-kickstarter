import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Layout/AdminLayout';
import DataTable from '@/components/Ui/DataTable';
import Pagination from '@/components/Ui/Pagination';
import SearchInput from '@/components/Ui/SearchInput';
import Badge from '@/components/Ui/Badge';
import Modal from '@/components/Ui/Modal';
import Button from '@/components/Ui/Button';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/useToast';
import type { User, Column } from '@/types';

// Correspondance role -> variante de badge
const roleBadgeVariant = (role: string) => {
  if (role === 'ROLE_ADMIN') return 'danger' as const;
  if (role === 'ROLE_USER') return 'primary' as const;
  return 'secondary' as const;
};

export default function UsersList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    users,
    currentPage,
    totalPages,
    search,
    sortBy,
    sortOrder,
    isLoading,
    setSearch,
    fetchUsers,
    deleteUser,
  } = useUsers();

  // Modal de confirmation de suppression
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Chargement initial
  useEffect(() => {
    fetchUsers(1, '', 'createdAt', 'desc');
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  // Gestion de la recherche
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      fetchUsers(1, value);
    },
    [setSearch, fetchUsers],
  );

  // Gestion du tri
  const handleSort = useCallback(
    (key: string) => {
      const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
      fetchUsers(currentPage, search, key, newOrder);
    },
    [sortBy, sortOrder, currentPage, search, fetchUsers],
  );

  // Gestion de la pagination
  const handlePageChange = useCallback(
    (page: number) => {
      fetchUsers(page, search);
    },
    [search, fetchUsers],
  );

  // Ouverture du modal de suppression
  const openDeleteModal = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  // Confirmation de la suppression
  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteModal.user.id);
      addToast('success', 'Utilisateur supprime avec succes.');
      setDeleteModal({ isOpen: false, user: null });
    } catch {
      addToast('error', "Erreur lors de la suppression de l'utilisateur.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Initiales d'un utilisateur
  const getInitials = (user: User): string => {
    const first = (user.firstName?.[0] || '').toUpperCase();
    const last = (user.lastName?.[0] || '').toUpperCase();
    return first + last || '?';
  };

  // Definition des colonnes du tableau
  const columns: Column<User>[] = [
    {
      key: 'avatar',
      label: '',
      render: (user: User) => (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
          {getInitials(user)}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user: User) => (
        <span className="font-medium">{user.email}</span>
      ),
    },
    {
      key: 'firstName',
      label: 'Nom complet',
      sortable: true,
      render: (user: User) => (
        <span>
          {user.firstName || '-'} {user.lastName || ''}
        </span>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <Badge key={role} variant={roleBadgeVariant(role)}>
              {role.replace('ROLE_', '')}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'isEmailVerified',
      label: 'Verifie',
      render: (user: User) =>
        user.isEmailVerified ? (
          <svg
            className="h-5 w-5 text-success-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-secondary-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      sortable: true,
      render: (user: User) => (
        <span className="text-xs text-secondary-500 dark:text-gray-400">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          {/* Voir */}
          <button
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="rounded p-1 text-secondary-500 hover:bg-secondary-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            title="Voir"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {/* Modifier */}
          <button
            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
            className="rounded p-1 text-secondary-500 hover:bg-secondary-100 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            title="Modifier"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {/* Supprimer */}
          <button
            onClick={() => openDeleteModal(user)}
            className="rounded p-1 text-secondary-500 hover:bg-danger-50 hover:text-danger-600 dark:text-gray-400 dark:hover:bg-danger-900/20 dark:hover:text-danger-400"
            title="Supprimer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Utilisateurs"
      breadcrumb={[
        { label: 'Admin', to: '/admin' },
        { label: 'Utilisateurs' },
      ]}
    >
      {/* Barre de recherche */}
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Rechercher par email, prenom, nom..."
        />
      </div>

      {/* Tableau */}
      <DataTable<User>
        data={users}
        columns={columns}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="mb-6 text-sm text-secondary-600 dark:text-gray-400">
          Voulez-vous vraiment supprimer l'utilisateur{' '}
          <strong className="text-secondary-900 dark:text-white">
            {deleteModal.user?.email}
          </strong>{' '}
          ? Cette action est irreversible.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModal({ isOpen: false, user: null })}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={confirmDelete}
            isLoading={isDeleting}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
