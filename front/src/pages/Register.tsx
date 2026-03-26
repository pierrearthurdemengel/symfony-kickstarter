import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RegisterForm from '@/components/Auth/RegisterForm';

export default function Register() {
  const { isAuthenticated } = useAuth();

  // Redirection vers le dashboard si deja authentifie
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  );
}
