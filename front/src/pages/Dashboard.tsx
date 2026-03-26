import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Formatage de la date de creation
  const createdAt = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-secondary-900">Dashboard</h1>

      <div className="rounded-xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-center space-x-4">
          {/* Avatar avec initiales */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-600">
            {(user.firstName?.[0] || '').toUpperCase()}
            {(user.lastName?.[0] || '').toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-secondary-500">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-secondary-200 pt-6">
          <dl className="grid gap-6 sm:grid-cols-2">
            {/* Email */}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Email</dt>
              <dd className="mt-1 text-sm text-secondary-900">{user.email}</dd>
            </div>

            {/* Prenom */}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Prenom</dt>
              <dd className="mt-1 text-sm text-secondary-900">{user.firstName || '-'}</dd>
            </div>

            {/* Nom */}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Nom</dt>
              <dd className="mt-1 text-sm text-secondary-900">{user.lastName || '-'}</dd>
            </div>

            {/* Roles */}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Roles</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {role}
                  </span>
                ))}
              </dd>
            </div>

            {/* Date de creation */}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Membre depuis</dt>
              <dd className="mt-1 text-sm text-secondary-900">{createdAt}</dd>
            </div>

            {/* Identifiant */}
            <div>
              <dt className="text-sm font-medium text-secondary-500">Identifiant</dt>
              <dd className="mt-1 font-mono text-xs text-secondary-500">{user.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
