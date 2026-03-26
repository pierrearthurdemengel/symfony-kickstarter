import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { ApiError } from '@/types';

export default function LoginForm() {
  const { login } = useAuth();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Soumission du formulaire de connexion
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
      addToast('success', 'Connexion reussie.');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || 'Erreur lors de la connexion.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900 dark:text-white">
          Connexion
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="Votre mot de passe"
            required
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Se connecter
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary-600 dark:text-gray-400">
          <Link
            to="/forgot-password"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Mot de passe oublie ?
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-secondary-600 dark:text-gray-400">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
