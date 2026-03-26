import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import type { ApiError } from '@/types';

export default function RegisterForm() {
  const { register: authRegister } = useAuth();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Soumission du formulaire d'inscription
  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      addToast('success', 'Inscription reussie.');
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900 dark:text-white">
          Inscription
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
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
            placeholder="8 caracteres minimum"
            required
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Creer mon compte
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary-600 dark:text-gray-400">
          Deja un compte ?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
