import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/Layout/AdminLayout';
import Badge from '@/components/Ui/Badge';
import Button from '@/components/Ui/Button';
import Modal from '@/components/Ui/Modal';
import { get, del } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import type { User } from '@/types';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Chargement du detail utilisateur
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const data = await get<User>(`/users/${id}`);
        setUser(data);
      } catch {
        addToast('error', 'Impossible de charger cet utilisateur.');
        navigate('/admin/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);// eslint-disable-line react-hooks/exhaustive-deps

  // Suppression de l'utilisateur
  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await del(`/users/${id}`);
      addToast('success', 'Utilisateur supprime avec succes.');
      navigate('/admin/users');
    } catch {
      addToast('error', "Erreur lors de la suppression de l'utilisateur.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // Initiales
  const getInitials = (u: User): string => {
    const first = (u.firstName?.[0] || '').toUpperCase();
    const last = (u.lastName?.[0] || '').toUpperCase();
    return first + last || '?';
  };

  // Formatage date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Correspondance role -> variante badge
  const roleBadgeVariant = (role: string) => {
    if (role === 'ROLE_ADMIN') return 'danger' as const;
    if (role === 'ROLE_USER') return 'primary' as const;
    return 'secondary' as const;
  };

  // Skeleton de chargement
  if (isLoading) {
    return (
      <AdminLayout
        title="Detail utilisateur"
        breadcrumb={[
          { label: 'Admin', to: '/admin' },
          { label: 'Utilisateurs', to: '/admin/users' },
          { label: 'Chargement...' },
        ]}
      >
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800">
            <div className="mb-6 flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-secondary-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-secondary-200 dark:bg-gray-700" />
                <div className="h-4 w-56 rounded bg-secondary-200 dark:bg-gray-700" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 rounded bg-secondary-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 rounded bg-secondary-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout
      title="Detail utilisateur"
      breadcrumb={[
        { label: 'Admin', to: '/admin' },
        { label: 'Utilisateurs', to: '/admin/users' },
        { label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 sm:p-8">
          {/* En-tete avec avatar */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
              {getInitials(user)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-secondary-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Informations */}
          <div className="border-t border-secondary-200 pt-6 dark:border-gray-700">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-gray-200">
                  {user.email}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Prenom
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-gray-200">
                  {user.firstName || '-'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Nom
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-gray-200">
                  {user.lastName || '-'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Roles
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant={roleBadgeVariant(role)}>
                      {role.replace('ROLE_', '')}
                    </Badge>
                  ))}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Email verifie
                </dt>
                <dd className="mt-1">
                  {user.isEmailVerified ? (
                    <Badge variant="success">Verifie</Badge>
                  ) : (
                    <Badge variant="warning">Non verifie</Badge>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Date d'inscription
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-gray-200">
                  {formatDate(user.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Derniere mise a jour
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-gray-200">
                  {formatDate(user.updatedAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-gray-400">
                  Derniere connexion
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-gray-200">
                  {formatDate(user.lastLoginAt)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-secondary-200 pt-6 dark:border-gray-700">
            <Button onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
              Modifier
            </Button>
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              Supprimer
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              Retour a la liste
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="mb-6 text-sm text-secondary-600 dark:text-gray-400">
          Voulez-vous vraiment supprimer l'utilisateur{' '}
          <strong className="text-secondary-900 dark:text-white">{user.email}</strong> ?
          Cette action est irreversible.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
