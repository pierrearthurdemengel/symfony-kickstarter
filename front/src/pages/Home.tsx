import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Liste des fonctionnalites mises en avant
const features = [
  {
    title: 'API Platform',
    description:
      'Backend API REST complet avec API Platform, documentation Swagger auto-generee et support Hydra/JSON-LD.',
    icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
  },
  {
    title: 'JWT Authentication',
    description:
      'Authentification securisee par JSON Web Tokens avec inscription, connexion et routes protegees.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'React + TypeScript',
    description:
      'Frontend moderne avec React 18, TypeScript strict, Tailwind CSS et Vite pour un developpement rapide.',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  },
  {
    title: 'Docker',
    description:
      'Environnement de developpement complet avec Docker Compose : PHP, Nginx, PostgreSQL et Node.js.',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Section hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Symfony Kickstarter
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-100 sm:text-xl">
            Template de demarrage rapide avec Symfony, API Platform, React et Docker.
            Tout ce dont vous avez besoin pour lancer votre projet en quelques minutes.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg transition-colors hover:bg-primary-50"
              >
                Aller au Dashboard
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-lg font-semibold text-primary-600 shadow-lg transition-colors hover:bg-primary-50"
                >
                  Commencer
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Section fonctionnalites */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-900 sm:text-4xl">
              Tout inclus, pret a l&apos;emploi
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary-600">
              Un stack technique complet et moderne pour demarrer vos projets web rapidement.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <svg
                    className="h-6 w-6 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-secondary-900">{feature.title}</h3>
                <p className="text-sm text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
