import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { post } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import type { ApiError } from '@/types';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { addToast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Token manquant dans l'URL
  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <Alert type="error" message="Token de reinitialisation manquant ou invalide." />
            <p className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Demander un nouveau lien
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Soumission du nouveau mot de passe
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await post('/reset-password', { token, password: data.password });
      setIsSuccess(true);
      addToast('success', 'Mot de passe reinitialise avec succes.');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900 dark:text-white">
            Nouveau mot de passe
          </h2>

          {isSuccess ? (
            <div>
              <div className="mb-6 rounded-lg bg-success-50 p-4 text-sm text-success-800 dark:bg-success-900/30 dark:text-success-300">
                Votre mot de passe a ete reinitialise avec succes.
              </div>
              <Link
                to="/login"
                className="block text-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="Minimum 8 caracteres"
                required
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Retapez votre mot de passe"
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
                Reinitialiser le mot de passe
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
