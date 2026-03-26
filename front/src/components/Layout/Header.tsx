import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DarkModeToggle from '@/components/Ui/DarkModeToggle';
import Dropdown from '@/components/Ui/Dropdown';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
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

  // Initiales de l'utilisateur pour l'avatar
  const initials = user
    ? `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`
    : '';

  // Verifie si l'utilisateur est admin
  const isAdmin = user?.roles.includes('ROLE_ADMIN') ?? false;

  // Items du dropdown utilisateur
  const userMenuItems = [
    {
      label: 'Mon profil',
      onClick: () => navigate('/profile'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    // Lien admin conditionnel
    ...(isAdmin
      ? [
          {
            label: 'Admin',
            onClick: () => navigate('/admin'),
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
          },
        ]
      : []),
    {
      label: 'Deconnexion',
      onClick: handleLogout,
      danger: true,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    },
  ];

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              Symfony Kickstarter
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
            >
              Home
            </Link>
            <DarkModeToggle />
            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
                    {initials}
                  </div>
                }
                items={userMenuItems}
              />
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-secondary-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
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
          <div className="flex items-center space-x-2 md:hidden">
            <DarkModeToggle />
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-secondary-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400"
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
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="border-t border-secondary-200 pb-3 pt-2 dark:border-gray-700 md:hidden">
            <div className="space-y-1">
              <Link
                to="/"
                className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                onClick={closeMenu}
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                    onClick={closeMenu}
                  >
                    Mon profil
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                      onClick={closeMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-danger-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-danger-400"
                  >
                    Deconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
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
