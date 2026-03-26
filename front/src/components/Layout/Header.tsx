import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Gestion de la deconnexion
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  // Fermeture du menu mobile apres navigation
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <span className="text-xl font-bold text-primary-600">Symfony Kickstarter</span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-secondary-600 hover:text-danger-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Bouton hamburger mobile */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-secondary-600 hover:text-primary-600 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu principal"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="border-t border-secondary-200 pb-3 pt-2 md:hidden">
            <div className="space-y-1">
              <Link
                to="/"
                className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600"
                onClick={closeMenu}
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-danger-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
