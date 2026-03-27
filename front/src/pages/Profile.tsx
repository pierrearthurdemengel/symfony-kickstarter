import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  profileSchema,
  changePasswordSchema,
  type ProfileFormData,
  type ChangePasswordFormData,
} from '@/lib/validations';
import { patch, post } from '@/services/api';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { ApiError, User } from '@/types';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [disabling2fa, setDisabling2fa] = useState(false);
  const [password2fa, setPassword2fa] = useState('');
  const [show2faDisable, setShow2faDisable] = useState(false);

  // Formulaire du profil
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Formulaire de changement de mot de passe
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Pre-remplissage du formulaire profil avec les donnees utilisateur
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  if (!user) return null;

  // Mise a jour du profil
  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await patch<User>(`/users/${user.id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      addToast('success', 'Profil mis a jour avec succes.');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de la mise a jour du profil.');
    }
  };

  // Changement de mot de passe
  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await post('/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      addToast('success', 'Mot de passe modifie avec succes.');
      resetPassword();
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors du changement de mot de passe.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-secondary-900 dark:text-white">Mon profil</h1>

      {/* Section profil */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-secondary-900 dark:text-white">
          Informations personnelles
        </h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Prenom"
              type="text"
              placeholder="Jean"
              required
              error={profileErrors.firstName?.message}
              {...registerProfile('firstName')}
            />
            <Input
              label="Nom"
              type="text"
              placeholder="Dupont"
              required
              error={profileErrors.lastName?.message}
              {...registerProfile('lastName')}
            />
          </div>
          <Input
            label="Email"
            type="email"
            readOnly
            className="cursor-not-allowed bg-secondary-100 dark:bg-gray-700"
            error={profileErrors.email?.message}
            {...registerProfile('email')}
          />
          <p className="mb-4 text-xs text-secondary-500 dark:text-gray-400">
            L&apos;email ne peut pas etre modifie depuis cette page.
          </p>
          <Button type="submit" isLoading={isProfileSubmitting}>
            Enregistrer
          </Button>
        </form>
      </div>

      {/* Section changement de mot de passe */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
        <h2 className="mb-6 text-xl font-semibold text-secondary-900 dark:text-white">
          Changer le mot de passe
        </h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
          <Input
            label="Mot de passe actuel"
            type="password"
            placeholder="Votre mot de passe actuel"
            required
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            placeholder="Minimum 8 caracteres"
            required
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            placeholder="Retapez le nouveau mot de passe"
            required
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <Button type="submit" isLoading={isPasswordSubmitting}>
            Changer le mot de passe
          </Button>
        </form>
      </div>

      {/* Section 2FA */}
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 sm:p-8">
        <h2 className="mb-4 text-xl font-semibold text-secondary-900 dark:text-white">
          Authentification a deux facteurs
        </h2>
        {user.isTwoFactorEnabled ? (
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>2FA active</span>
            </div>
            {!show2faDisable ? (
              <Button variant="danger" size="sm" onClick={() => setShow2faDisable(true)}>
                Desactiver le 2FA
              </Button>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Mot de passe pour confirmer"
                  type="password"
                  value={password2fa}
                  onChange={(e) => setPassword2fa(e.target.value)}
                  placeholder="Votre mot de passe actuel"
                />
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={disabling2fa}
                    onClick={async () => {
                      setDisabling2fa(true);
                      try {
                        await post('/2fa/disable', { password: password2fa });
                        addToast('success', '2FA desactive.');
                        setShow2faDisable(false);
                        setPassword2fa('');
                        // Recharge le profil
                        window.location.reload();
                      } catch (err) {
                        const apiError = err as ApiError;
                        addToast('error', apiError.message || 'Erreur.');
                      } finally {
                        setDisabling2fa(false);
                      }
                    }}
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShow2faDisable(false);
                      setPassword2fa('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-secondary-600 dark:text-gray-400">
              Ajoutez une couche de securite supplementaire a votre compte.
            </p>
            <Button size="sm" onClick={() => navigate('/2fa/setup')}>
              Activer le 2FA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
