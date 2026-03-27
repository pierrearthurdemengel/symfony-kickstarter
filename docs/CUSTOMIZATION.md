# Guide de personnalisation

Ce guide explique comment adapter Symfony Kickstarter a votre propre projet.

## Methode rapide : script init.sh

```bash
./init.sh mon-projet
```

Le script remplace automatiquement toutes les references a `kickstarter` par le nom de votre projet :

- Noms de containers Docker
- Noms de volumes et reseaux
- Variables d'environnement
- Namespace Composer
- Nom du package npm
- Titres dans README et CHANGELOG
- Domaines email dans les fixtures

Le script reinitialise le depot Git et se supprime apres execution.

## Methode manuelle

### 1. Renommer le projet

Rechercher-remplacer `kickstarter` dans les fichiers suivants :

| Fichier | Ce qui change |
|---|---|
| `docker-compose.yaml` | Noms containers, volumes, network |
| `docker-compose.override.yaml` | Noms containers |
| `docker-compose.prod.yaml` | Noms containers, volumes, network |
| `api/.env` | `DATABASE_URL`, nom de la base |
| `api/.env.example` | Idem |
| `api/.env.prod.example` | Idem |
| `api/composer.json` | Nom du package |
| `front/package.json` | Nom du package |
| `Makefile` | Titre |
| `README.md` | Titre, liens |
| `CHANGELOG.md` | Titre |

### 2. Configurer les variables d'environnement

Copier et adapter :
```bash
cp api/.env api/.env.local
```

Variables a personnaliser en priorite :

| Variable | Description |
|---|---|
| `APP_SECRET` | `openssl rand -hex 32` |
| `DATABASE_URL` | Adapter le nom de la base |
| `CORS_ALLOW_ORIGIN` | Domaine de votre frontend |
| `JWT_PASSPHRASE` | Passphrase pour les cles JWT |
| `MAILER_DSN` | Serveur SMTP |

### 3. Adapter les entites

#### Ajouter une entite

```bash
make shell-php
php bin/console make:entity MonEntite
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```

#### Exposer via API Platform

Ajouter les attributs API Platform sur l'entite :

```php
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;

#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
    ],
    normalizationContext: ['groups' => ['read']],
)]
class MonEntite
{
    // ...
}
```

#### Ajouter des filtres

```php
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;

#[ApiFilter(SearchFilter::class, properties: ['name' => 'partial'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt'])]
```

### 4. Adapter le frontend

#### Ajouter une page

1. Creer le fichier dans `front/src/pages/MaPage.tsx`
2. Ajouter la route dans `front/src/App.tsx` :
   ```tsx
   const MaPage = lazy(() => import('./pages/MaPage'));
   // Dans les routes :
   <Route path="/ma-page" element={<MaPage />} />
   ```

#### Ajouter un hook API

Creer un hook dans `front/src/hooks/` :

```tsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useMonEntite() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/mon-entites')
      .then(res => setData(res.data['hydra:member']))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```

#### Ajouter un composant admin

1. Creer la page dans `front/src/pages/admin/`
2. Ajouter le lien dans la sidebar (`AdminLayout.tsx`)
3. Ajouter la route admin dans `App.tsx`

### 5. Personnaliser le design

#### Couleurs et theme

Modifier `front/tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... vos couleurs
          900: '#0c4a6e',
        },
      },
    },
  },
};
```

#### Logo et favicon

Remplacer les fichiers dans `front/public/` :
- `favicon.ico`
- `logo192.png`
- `logo512.png`
- Mettre a jour `manifest.json`

### 6. Configurer les services externes

#### OAuth (optionnel)

1. Creer une app sur [Google Cloud Console](https://console.cloud.google.com/)
2. Creer une app sur [GitHub Developer Settings](https://github.com/settings/developers)
3. Renseigner dans `api/.env.local` :
   ```
   GOOGLE_CLIENT_ID=votre_client_id
   GOOGLE_CLIENT_SECRET=votre_client_secret
   GITHUB_CLIENT_ID=votre_client_id
   GITHUB_CLIENT_SECRET=votre_client_secret
   ```

#### Meilisearch

L'indexation se fait via `SearchService` :
```php
$this->searchService->index('products', $product->getId(), [
    'name' => $product->getName(),
    'description' => $product->getDescription(),
]);
```

#### Sentry (monitoring d'erreurs)

Decommenter la configuration dans :
- `api/config/packages/sentry.yaml`
- `front/src/lib/sentry.ts`

Renseigner `SENTRY_DSN` dans les variables d'environnement.

### 7. Supprimer les fonctionnalites inutiles

Si vous n'avez pas besoin de certaines fonctionnalites :

| Fonctionnalite | Fichiers a supprimer |
|---|---|
| OAuth | `OAuthController.php`, `UserOAuthProvider.php`, `OAuthCallback.tsx`, `OAuthButtons.tsx` |
| 2FA | `TwoFactorController.php`, `TwoFactorSetup.tsx`, `TwoFactorVerify.tsx` |
| Notifications | `NotificationController.php`, `Notification.php`, `NotificationBell.tsx`, `Notifications.tsx` |
| Meilisearch | Service Docker `meilisearch`, `SearchService.php`, `SearchController.php` |
| Feature flags | `FeatureFlagService.php`, `FeatureFlagController.php`, `FeatureFlags.tsx` |
| Impersonation | `ImpersonationController.php`, `ImpersonationBanner.tsx` |

N'oubliez pas de :
1. Supprimer les migrations associees ou creer une migration de suppression
2. Retirer les routes du fichier `security.yaml`
3. Supprimer les types TypeScript correspondants
4. Retirer les liens de navigation
