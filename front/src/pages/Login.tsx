import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/Auth/LoginForm';

export default function Login() {
  const { isAuthenticated } = useAuth();

  // Redirection vers le dashboard si deja authentifie
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
