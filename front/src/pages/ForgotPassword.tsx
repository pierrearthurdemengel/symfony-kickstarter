import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';
import { post } from '@/services/api';
import { useToast } from '@/hooks/useToast';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { ApiError } from '@/types';

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Envoi de la demande de reinitialisation
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await post('/forgot-password', { email: data.email });
      setIsSubmitted(true);
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
            Mot de passe oublie
          </h2>

          {isSubmitted ? (
            <div>
              <div className="mb-6 rounded-lg bg-success-50 p-4 text-sm text-success-800 dark:bg-success-900/30 dark:text-success-300">
                Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.
              </div>
              <Link
                to="/login"
                className="block text-center text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Retour a la connexion
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-center text-sm text-secondary-600 dark:text-gray-400">
                Entrez votre adresse email pour recevoir un lien de reinitialisation.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
                  Envoyer le lien
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-secondary-600 dark:text-gray-400">
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Retour a la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
