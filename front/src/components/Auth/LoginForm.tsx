import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import type { ApiError } from '@/types';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation et soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation cote client
    if (!email.trim()) {
      setError("L'email est requis.");
      return;
    }
    if (!password) {
      setError('Le mot de passe est requis.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erreur lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900">Connexion</h2>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="vous@exemple.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            placeholder="Votre mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Se connecter
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
