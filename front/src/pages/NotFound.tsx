import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-2 text-8xl font-extrabold text-primary-600">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-secondary-900">Page introuvable</h2>
        <p className="mb-8 text-secondary-600">
          La page que vous recherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour a l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
