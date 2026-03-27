import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/Layout/AdminLayout';
import Input from '@/components/Ui/Input';
import Button from '@/components/Ui/Button';
import { get, patch } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import { adminUserEditSchema, type AdminUserEditFormData } from '@/lib/validations';
import type { User, ApiError } from '@/types';

// Roles disponibles dans l'application
const AVAILABLE_ROLES = ['ROLE_USER', 'ROLE_ADMIN'];

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AdminUserEditFormData>({
    resolver: zodResolver(adminUserEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      roles: ['ROLE_USER'],
    },
  });

  // Valeur actuelle des roles
  const currentRoles = watch('roles');

  // Chargement de l'utilisateur
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const data = await get<User>(`/users/${id}`);
        setUser(data);
        reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          roles: data.roles,
        });
      } catch {
        addToast('error', 'Impossible de charger cet utilisateur.');
        navigate('/admin/users');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [id]);// eslint-disable-line react-hooks/exhaustive-deps

  // Gestion du toggle d'un role
  const handleRoleToggle = (role: string) => {
    const updated = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    setValue('roles', updated, { shouldValidate: true });
  };

  // Soumission du formulaire
  const onSubmit = async (data: AdminUserEditFormData) => {
    if (!id) return;
    try {
      await patch<User>(`/users/${id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles,
      });
      addToast('success', 'Utilisateur mis a jour avec succes.');
      navigate(`/admin/users/${id}`);
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || "Erreur lors de la mise a jour de l'utilisateur.");
    }
  };

  // Skeleton de chargement
  if (isLoadingUser) {
    return (
      <AdminLayout
        title="Modifier l'utilisateur"
        breadcrumb={[
          { label: 'Admin', to: '/admin' },
          { label: 'Utilisateurs', to: '/admin/users' },
          { label: 'Chargement...' },
        ]}
      >
        <div className="mx-auto max-w-xl">
          <div className="animate-pulse rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800">
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-secondary-200 dark:bg-gray-700" />
                  <div className="h-10 w-full rounded bg-secondary-200 dark:bg-gray-700" />
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
      title="Modifier l'utilisateur"
      breadcrumb={[
        { label: 'Admin', to: '/admin' },
        { label: 'Utilisateurs', to: '/admin/users' },
        { label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email, to: `/admin/users/${user.id}` },
        { label: 'Modifier' },
      ]}
    >
      <div className="mx-auto max-w-xl">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Prenom"
                type="text"
                placeholder="Jean"
                required
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Nom"
                type="text"
                placeholder="Dupont"
                required
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            {/* Email en lecture seule */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-secondary-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-secondary-300 bg-secondary-100 px-3 py-2 text-secondary-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
              />
              <p className="mt-1 text-xs text-secondary-500 dark:text-gray-400">
                L&apos;email ne peut pas etre modifie.
              </p>
            </div>

            {/* Selection des roles */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-secondary-700 dark:text-gray-300">
                Roles *
              </label>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map((role) => (
                  <label
                    key={role}
                    className="flex cursor-pointer items-center space-x-3 rounded-lg border border-secondary-200 px-4 py-3 transition-colors hover:bg-secondary-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={currentRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-secondary-700 dark:text-gray-300">
                      {role}
                    </span>
                  </label>
                ))}
              </div>
              {errors.roles?.message && (
                <p className="mt-1 text-sm text-danger-500">{errors.roles.message}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="flex space-x-3">
              <Button type="submit" isLoading={isSubmitting}>
                Enregistrer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/users/${user.id}`)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
