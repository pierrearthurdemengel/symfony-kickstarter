import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import type { ApiError } from '@/types';

export default function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validation et soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation cote client
    if (!firstName.trim()) {
      setError('Le prenom est requis.');
      return;
    }
    if (!lastName.trim()) {
      setError('Le nom est requis.');
      return;
    }
    if (!email.trim()) {
      setError("L'email est requis.");
      return;
    }
    if (!password) {
      setError('Le mot de passe est requis.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, password, firstName, lastName });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-secondary-900">Inscription</h2>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prenom"
              name="firstName"
              type="text"
              placeholder="Jean"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Nom"
              name="lastName"
              type="text"
              placeholder="Dupont"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
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
            placeholder="6 caracteres minimum"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
            Creer mon compte
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary-600">
          Deja un compte ?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
