import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DarkModeToggle from '@/components/Ui/DarkModeToggle';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: { label: string; to?: string }[];
}

// Elements de navigation de la sidebar
const navItems = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    label: 'Utilisateurs',
    to: '/admin/users',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: 'Media',
    to: '/admin/media',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Journal d'audit",
    to: '/admin/audit-log',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Verifie si le lien est actif (correspond a la route courante)
  const isActive = (to: string) => {
    if (to === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-secondary-50 dark:bg-gray-900">
      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform duration-200 dark:bg-gray-800 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo/titre */}
        <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-6 dark:border-gray-700">
          <Link to="/admin" className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Admin
          </Link>
          {/* Bouton fermer sur mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1 text-secondary-500 hover:bg-secondary-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Fermer le menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Lien retour au site */}
        <div className="border-t border-secondary-200 px-3 py-4 dark:border-gray-700">
          <Link
            to="/"
            className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 hover:text-secondary-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour au site</span>
          </Link>
        </div>
      </aside>

      {/* Zone de contenu */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
          <div className="flex items-center space-x-4">
            {/* Bouton burger mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-1.5 text-secondary-500 hover:bg-secondary-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h1 className="text-lg font-semibold text-secondary-900 dark:text-white">
                {title}
              </h1>
              {/* Breadcrumb */}
              {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center space-x-1 text-xs text-secondary-500 dark:text-gray-400">
                  {breadcrumb.map((item, index) => (
                    <span key={index} className="flex items-center">
                      {index > 0 && <span className="mx-1">/</span>}
                      {item.to ? (
                        <Link
                          to={item.to}
                          className="hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
            </div>
          </div>

          <DarkModeToggle />
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
