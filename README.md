<div align="center">

<h1>Symfony Kickstarter</h1>

<p><strong>Template full-stack open source pour demarrer un projet web moderne en 5 minutes.</strong></p>

<p>Symfony 7.2 &bull; API Platform 3.4 &bull; React 18 &bull; TypeScript 5 &bull; Docker</p>

<p>
  <a href="https://github.com/pierrearthurdemengel/symfony-kickstarter/actions/workflows/ci.yaml"><img src="https://github.com/pierrearthurdemengel/symfony-kickstarter/actions/workflows/ci.yaml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License MIT"></a>
  <a href="https://www.php.net/"><img src="https://img.shields.io/badge/PHP-8.3-777BB4.svg?logo=php&logoColor=white" alt="PHP 8.3"></a>
  <a href="https://symfony.com/"><img src="https://img.shields.io/badge/Symfony-7.2-000000.svg?logo=symfony&logoColor=white" alt="Symfony 7.2"></a>
  <a href="https://api-platform.com/"><img src="https://img.shields.io/badge/API%20Platform-3.4-38A9B4.svg?logo=api-platform&logoColor=white" alt="API Platform 3.4"></a>
</p>
<p>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black" alt="React 18"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6.svg?logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white" alt="PostgreSQL 16"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-ready-2496ED.svg?logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p>
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-fonctionnalites">Fonctionnalites</a> &bull;
  <a href="#-architecture">Architecture</a> &bull;
  <a href="#-deploiement-en-production">Deploiement</a> &bull;
  <a href="#-personnalisation">Personnalisation</a>
</p>

</div>

---

## Pourquoi Symfony Kickstarter ?

> Au lieu de passer des semaines a configurer l'authentification, les permissions, le Docker,
> le CI/CD et les interfaces admin, clonez ce repo et concentrez-vous sur votre metier.

Symfony Kickstarter fournit une base solide et opinionnee pour les projets web full-stack. Tout est cable, teste et pret pour la production.

- **Pret a l'emploi** -- Auth JWT + OAuth + 2FA, RBAC granulaire, interface admin complete, i18n, dark mode, PWA
- **Production-ready** -- Docker multi-stage, Nginx optimise, Supervisor, cache HTTP, logging structure, Sentry
- **Qualite code** -- PHPStan level 6, TypeScript strict, 90+ tests (PHPUnit + Vitest + Cypress), CI GitHub Actions
- **DX soignee** -- Makefile 30+ commandes, Husky pre-commit, Conventional Commits, hot reload Vite

---

## Table des matieres

- [Quick Start](#-quick-start)
- [Stack technique](#-stack-technique)
- [Fonctionnalites](#-fonctionnalites)
  - [Authentification et securite](#-authentification-et-securite)
  - [API et backend](#-api-et-backend)
  - [Frontend](#-frontend)
  - [Interface admin](#-interface-admin)
  - [DevOps et qualite](#-devops-et-qualite)
- [URLs de developpement](#-urls-de-developpement)
- [Comptes de test](#-comptes-de-test)
- [Commandes Makefile](#-commandes-makefile)
- [Architecture](#-architecture)
- [Deploiement en production](#-deploiement-en-production)
- [Personnalisation](#-personnalisation)
- [Hooks Git et conventions de commit](#-hooks-git-et-conventions-de-commit)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## Quick Start

### Prerequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- [Make](https://www.gnu.org/software/make/)
- [Git](https://git-scm.com/)

### Installation

```bash
git clone https://github.com/pierrearthurdemengel/symfony-kickstarter.git
cd symfony-kickstarter
make install
make db-fixtures
make jwt-generate
```

La commande `make install` orchestre automatiquement :

1. Build des images Docker (PHP 8.3 FPM, Nginx, Node)
2. Demarrage des containers (PHP, Nginx, Node, PostgreSQL, Redis, Mercure, Meilisearch, Mailpit)
3. Installation des dependances backend (Composer) et frontend (npm)
4. Creation de la base de donnees et execution des migrations
5. Installation des hooks Git (Husky, lint-staged, commitlint)

> **Resultat** : frontend sur [localhost:8080](http://localhost:8080), API Swagger sur [localhost:8080/api](http://localhost:8080/api), Mailpit sur [localhost:8026](http://localhost:8026)

---

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| **Backend** | PHP / Symfony | 8.3 / 7.2 |
| **API** | API Platform | 3.4 |
| **Auth** | LexikJWTAuthenticationBundle | 3.x |
| **Frontend** | React + TypeScript | 18 / 5.x |
| **Build** | Vite | 5.x |
| **CSS** | Tailwind CSS | 3.x |
| **BDD** | PostgreSQL | 16 |
| **Cache / Sessions** | Redis | 7 |
| **Temps reel** | Mercure (SSE) | latest |
| **Recherche** | Meilisearch | 1.6 |
| **Reverse proxy** | Nginx | 1.25 |
| **Mail (dev)** | Mailpit | latest |
| **Tests back** | PHPUnit | 11.x |
| **Tests front** | Vitest | 2.x |
| **Tests E2E** | Cypress | 13.x |
| **Qualite back** | PHPStan (level 6) + PHP CS Fixer | latest |
| **Qualite front** | ESLint + Prettier | latest |
| **CI/CD** | GitHub Actions | - |

---

## Fonctionnalites

### Authentification et securite

| Fonctionnalite | Detail |
|---|---|
| **JWT** | Login/register stateless, injection automatique dans le client API |
| **OAuth social** | Google et GitHub, creation automatique de compte, liaison compte existant |
| **2FA TOTP** | Activation avec QR code, verification par code 6 chiffres, 8 codes de secours |
| **RBAC granulaire** | Entites Permission/PermissionGroup, PermissionVoter, verification cote client (`usePermissions`, `PermissionGate`) |
| **Impersonation admin** | Connexion en tant qu'utilisateur via JWT custom claims, audit log automatique |
| **Rate limiting** | Login 5/min, register 3/h, forgot-password 3/h, API globale 100/min, headers `X-RateLimit` |
| **Verification email** | Token securise 24h, endpoint de renvoi |
| **Reset mot de passe** | Token securise, templates email Twig (bienvenue + reset) |

### API et backend

| Fonctionnalite | Detail |
|---|---|
| **API Platform 3.4** | CRUD auto-genere, documentation Swagger, serialization groups |
| **Filtres avances** | Recherche partielle, tri multi-colonnes, filtre par date |
| **Recherche Meilisearch** | `SearchService`, endpoint `GET /api/search/{index}`, indexation batch |
| **Cache HTTP** | `CacheHeaderSubscriber`, pools Redis (`cache.api` 300s, `cache.search` 60s) |
| **Notifications** | Entite + CRUD endpoints, publication temps reel via Mercure SSE |
| **Feature flags** | Stockage Redis, flags par defaut configurables, endpoints public + admin |
| **Webhooks** | Dispatch HTTP multi-endpoints, signature HMAC-SHA256 |
| **RGPD** | Export donnees personnelles (JSON), suppression de compte avec confirmation |
| **Messenger async** | Transport Doctrine, Supervisor en production, dashboard admin |
| **Audit log** | Journal d'audit complet, service `AuditLogger`, consultation admin |
| **Upload fichiers** | Entite `MediaObject`, endpoint multipart, champ avatar sur `User` |
| **i18n** | Symfony Translation, fichiers YAML francais/anglais |
| **Logging structure** | Monolog channels `audit`/`security`, formatage JSON |
| **Healthcheck** | Verification BDD + Redis, version, statut `ok`/`degraded` |
| **Nettoyage tokens** | Commande `app:clean-expired-tokens` avec option `--dry-run` |

### Frontend

| Fonctionnalite | Detail |
|---|---|
| **React 18 + TypeScript 5** | Mode strict, zero `any`, types exhaustifs |
| **React Router v6** | Routes protegees (`ProtectedRoute`, `AdminRoute`) |
| **i18n** | react-i18next, detection automatique de la langue, selecteur FR/EN |
| **Dark mode** | Light / dark / system, persistence `localStorage` |
| **PWA** | Manifest, service worker network-first, support hors-ligne |
| **Notifications temps reel** | Mercure SSE (`useMercure`), cloche avec badge, page dediee |
| **Formulaires** | react-hook-form + zod, validation cote client |
| **Client API** | Injection automatique JWT, gestion erreurs centralisee |
| **Feature flags** | `FeatureFlagProvider` + hook `useFeatureFlags` |
| **Recherche** | Hook `useSearch` (Meilisearch) |
| **Error Boundary** | Capture globale des erreurs React |
| **Composants UI** | Button, Input, Alert, Modal, DataTable, Pagination, Dropdown, Skeleton, Badge, FileUpload, SearchInput, NotificationBell, LanguageSwitcher, OAuthButtons, PermissionGate, ImpersonationBanner |

### Interface admin

| Fonctionnalite | Detail |
|---|---|
| **Dashboard** | Cards statistiques, graphiques Recharts (inscriptions/mois, repartition roles) |
| **Gestion utilisateurs** | Liste paginee avec recherche et tri, detail, edition (roles), suppression |
| **Permissions RBAC** | CRUD groupes de permissions, selection par categorie dans modale |
| **Feature flags** | Toggles temps reel avec labels descriptifs |
| **Files d'attente** | Stats Messenger, messages en echec, retry unitaire, auto-refresh 30s |
| **Journal d'audit** | Tableau pagine, badges par action, details JSON expandable |
| **Export CSV** | Export utilisateurs depuis le dashboard et la liste |
| **Page RGPD** | Export donnees personnelles, suppression de compte avec double confirmation |

### DevOps et qualite

| Fonctionnalite | Detail |
|---|---|
| **Docker multi-services** | PHP 8.3 FPM, Nginx 1.25, Node, PostgreSQL 16, Redis 7, Mercure, Meilisearch, Mailpit |
| **Docker production** | Multi-stage build (PHP + React), Nginx optimise (gzip, cache, HSTS, CSP), OPcache JIT |
| **Supervisor** | Worker Messenger configure pour la production |
| **CI/CD** | GitHub Actions : tests, lint, workflow de deploiement (template) |
| **Qualite back** | PHPStan level 6, PHP CS Fixer (PSR-12) |
| **Qualite front** | ESLint strict, Prettier, TypeScript strict (`noImplicitAny`, `strictNullChecks`) |
| **Tests** | PHPUnit 11 (52+ tests), Vitest 2 (36+ tests), Cypress 13 (E2E) |
| **DX** | Makefile 30+ commandes, Husky pre-commit, lint-staged, commitlint (Conventional Commits) |
| **Monitoring** | Configuration Sentry prete a activer (backend + frontend) |
| **Variables** | `.env.prod.example` documente, ports Docker configurables |

---

## URLs de developpement

| Service | URL | Description |
|---|---|---|
| **Frontend** | [localhost:8080](http://localhost:8080) | Application React via Nginx |
| **Frontend (Vite)** | [localhost:3010](http://localhost:3010) | Dev server Vite avec HMR |
| **API Swagger** | [localhost:8080/api](http://localhost:8080/api) | Documentation interactive de l'API |
| **Mercure Hub** | [localhost:3001/.well-known/mercure](http://localhost:3001/.well-known/mercure) | Hub SSE temps reel |
| **Meilisearch** | [localhost:7700](http://localhost:7700) | Interface Meilisearch |
| **Mailpit** | [localhost:8026](http://localhost:8026) | Interface emails de dev |

> Les ports sont configurables via des variables d'environnement dans `.env` a la racine ou en ligne de commande (`NGINX_PORT=80 docker compose up -d`). Ports par defaut : Nginx 8080, Vite 3010, Mercure 3001, Meilisearch 7700, PostgreSQL 5433, Redis 6380, Mailpit 8026/1026.

---

## Comptes de test

| Email | Mot de passe | Role |
|---|---|---|
| `admin@kickstarter.dev` | `password` | `ROLE_ADMIN` |
| `user@kickstarter.dev` | `password` | `ROLE_USER` |

> Les fixtures chargent egalement 50+ utilisateurs realistes avec des prenoms/noms francais.

---

## Commandes Makefile

<details>
<summary><strong>Installation</strong></summary>

| Commande | Description |
|---|---|
| `make install` | Installer le projet complet (Docker + back + front + hooks) |
| `make install-back` | Installer les dependances backend (Composer) |
| `make install-front` | Installer les dependances frontend (npm) |
| `make install-hooks` | Installer les hooks Git (Husky) |

</details>

<details>
<summary><strong>Developpement</strong></summary>

| Commande | Description |
|---|---|
| `make start` | Demarrer les containers |
| `make stop` | Arreter les containers |
| `make restart` | Redemarrer les containers |
| `make logs` | Logs de tous les services |
| `make logs-php` | Logs du container PHP |
| `make logs-front` | Logs du container frontend |

</details>

<details>
<summary><strong>Base de donnees</strong></summary>

| Commande | Description |
|---|---|
| `make db-create` | Creer la base de donnees |
| `make db-migrate` | Executer les migrations |
| `make db-fixtures` | Charger les fixtures |
| `make db-reset` | Reinitialiser (drop + create + migrate + fixtures) |
| `make db-backup` | Sauvegarder la base de donnees |
| `make db-restore FILE=backup.sql` | Restaurer depuis un fichier |

</details>

<details>
<summary><strong>Tests et qualite</strong></summary>

| Commande | Description |
|---|---|
| `make test` | Tous les tests (back + front) |
| `make test-back` | Tests backend (PHPUnit) |
| `make test-front` | Tests frontend (Vitest) |
| `make test-coverage` | Tests avec couverture de code |
| `make lint` | Tous les linters |
| `make lint-back` | PHPStan + PHP CS Fixer |
| `make lint-front` | ESLint |
| `make check` | Lint + tests complets |
| `make fix` | Correction automatique (CS Fixer + ESLint + Prettier) |

</details>

<details>
<summary><strong>Utilitaires</strong></summary>

| Commande | Description |
|---|---|
| `make shell-php` | Shell dans le container PHP |
| `make shell-node` | Shell dans le container Node |
| `make jwt-generate` | Generer les cles JWT |
| `make clean-tokens` | Supprimer les tokens expires |
| `make clean-tokens-dry` | Afficher les tokens expires (sans supprimer) |
| `make messenger-consume` | Lancer le worker Messenger |
| `make messenger-failed` | Consulter les messages en echec |
| `make messenger-retry` | Relancer les messages en echec |
| `make help` | Afficher toutes les commandes |

</details>

<details>
<summary><strong>Production</strong></summary>

| Commande | Description |
|---|---|
| `make prod-build` | Construire les images de production |
| `make prod-start` | Demarrer en mode production |
| `make prod-stop` | Arreter la production |
| `make prod-logs` | Logs de production |
| `make front-build` | Build frontend pour la production |

</details>

---

## Architecture

```
symfony-kickstarter/
├── api/                              # Backend Symfony 7.2
│   ├── config/
│   │   ├── packages/                 # Configuration des bundles
│   │   │   ├── security.yaml         # Firewall, access control, voters
│   │   │   ├── mercure.yaml          # Hub Mercure SSE
│   │   │   ├── cache.yaml            # Pools Redis (api, search)
│   │   │   ├── monolog.yaml          # Channels audit, security
│   │   │   └── ...
│   │   └── jwt/                      # Cles JWT (generees)
│   ├── migrations/                   # Migrations Doctrine
│   ├── src/
│   │   ├── Command/                  # Commandes Symfony (nettoyage tokens)
│   │   ├── Controller/
│   │   │   ├── AuthenticationController.php
│   │   │   ├── OAuthController.php           # OAuth Google/GitHub
│   │   │   ├── TwoFactorController.php       # 2FA TOTP
│   │   │   ├── ImpersonationController.php   # Impersonation admin
│   │   │   ├── PermissionController.php      # CRUD permissions RBAC
│   │   │   ├── ProfileController.php         # GET/PATCH /api/me
│   │   │   ├── NotificationController.php    # CRUD notifications
│   │   │   ├── SearchController.php          # Recherche Meilisearch
│   │   │   ├── FeatureFlagController.php     # Feature flags
│   │   │   ├── GdprController.php            # Export + suppression RGPD
│   │   │   ├── QueueDashboardController.php  # Dashboard Messenger
│   │   │   ├── AdminController.php           # Stats, export, audit
│   │   │   └── HealthcheckController.php
│   │   ├── DataFixtures/             # Fixtures (50+ users, permissions)
│   │   ├── Entity/
│   │   │   ├── User.php              # User complet (2FA, OAuth, RBAC)
│   │   │   ├── Permission.php        # Permission RBAC
│   │   │   ├── PermissionGroup.php   # Groupe de permissions
│   │   │   ├── UserOAuthProvider.php # Liaison OAuth
│   │   │   ├── Notification.php
│   │   │   ├── AuditLog.php
│   │   │   └── MediaObject.php       # Upload fichiers
│   │   ├── EventSubscriber/          # Rate limiter, cache headers, login
│   │   ├── Message/                  # Messages Messenger async
│   │   ├── MessageHandler/
│   │   ├── Repository/
│   │   ├── Security/Voter/           # UserVoter, PermissionVoter
│   │   ├── Service/
│   │   │   ├── AuditLogger.php
│   │   │   ├── MercurePublisher.php
│   │   │   ├── SearchService.php     # Meilisearch
│   │   │   ├── FeatureFlagService.php
│   │   │   ├── WebhookService.php
│   │   │   └── NotificationService.php
│   │   └── State/                    # State processors API Platform
│   ├── translations/                 # Traductions YAML (fr, en)
│   └── tests/
│       ├── Functional/               # 52+ tests fonctionnels
│       └── Unit/
├── front/                            # Frontend React 18 + TypeScript 5
│   ├── public/
│   │   ├── manifest.json             # PWA manifest
│   │   └── sw.js                     # Service worker
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/                 # LoginForm, RegisterForm, OAuthButtons, PermissionGate
│   │   │   ├── Layout/              # Header, Footer, AdminLayout, ImpersonationBanner
│   │   │   └── Ui/                  # 16+ composants (Button, Modal, DataTable, Badge, etc.)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts     # RBAC cote client
│   │   │   ├── useMercure.ts         # SSE temps reel
│   │   │   ├── useSearch.ts          # Meilisearch
│   │   │   ├── useFeatureFlags.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── ...
│   │   ├── i18n/                     # react-i18next (fr, en, 150+ cles)
│   │   ├── pages/
│   │   │   ├── admin/               # Dashboard, Users, Permissions, FeatureFlags, Queue, AuditLog
│   │   │   ├── Home.tsx
│   │   │   ├── Profile.tsx           # Profil + section 2FA
│   │   │   ├── GdprExport.tsx        # RGPD
│   │   │   ├── Notifications.tsx
│   │   │   ├── TwoFactorSetup.tsx
│   │   │   ├── OAuthCallback.tsx
│   │   │   └── ...
│   │   ├── services/api.ts           # Client API avec JWT auto
│   │   └── types/index.ts            # Types TypeScript exhaustifs
│   ├── cypress/                      # Tests E2E
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker/
│   ├── nginx/
│   │   ├── default.conf              # Nginx dev
│   │   ├── default.prod.conf         # Nginx production (gzip, cache, HSTS, CSP)
│   │   └── spa.conf                  # Nginx SPA standalone
│   ├── node/
│   │   ├── Dockerfile                # Dev (Vite dev server)
│   │   └── Dockerfile.prod           # Production (multi-stage)
│   └── php/
│       ├── Dockerfile                # Dev (Xdebug optionnel)
│       ├── Dockerfile.prod           # Production (multi-stage, OPcache JIT)
│       ├── php.ini                   # Config PHP dev
│       ├── php.prod.ini              # Config PHP production
│       └── supervisor/               # Config Supervisor Messenger
├── .github/workflows/
│   ├── ci.yaml                       # Tests, lint, qualite
│   └── deploy.yaml                   # Deploiement (template)
├── docker-compose.yaml               # 8 services dev
├── docker-compose.override.yaml      # Override dev (Xdebug)
├── docker-compose.prod.yaml          # Stack production
├── Makefile                          # 30+ commandes
├── init.sh                           # Script d'initialisation du template
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## Deploiement en production

### 1. Construire les images

```bash
make prod-build
```

Build multi-stage : Composer install + PHP FPM optimise (sans Xdebug), React build + Nginx.

### 2. Configurer les variables d'environnement

```bash
cp api/.env.prod.example api/.env.local
```

Remplir toutes les valeurs :

| Variable | Description |
|---|---|
| `APP_SECRET` | Secret Symfony (`openssl rand -hex 32`) |
| `DATABASE_URL` | Connexion PostgreSQL |
| `JWT_PASSPHRASE` | Passphrase des cles JWT |
| `MERCURE_JWT_SECRET` | Secret du hub Mercure |
| `CORS_ALLOW_ORIGIN` | Domaine de production |
| `MAILER_DSN` | Configuration SMTP (SendGrid, Mailgun, SES, etc.) |
| `GOOGLE_CLIENT_ID/SECRET` | Credentials OAuth Google (optionnel) |
| `GITHUB_CLIENT_ID/SECRET` | Credentials OAuth GitHub (optionnel) |
| `MEILISEARCH_API_KEY` | Cle API Meilisearch |

Generer les cles JWT :

```bash
make jwt-generate
```

### 3. Demarrer la stack

```bash
make prod-start
```

### 4. Checklist de securite

- [ ] Changer **tous** les secrets par defaut (`APP_SECRET`, `JWT_PASSPHRASE`, `POSTGRES_PASSWORD`, `MERCURE_JWT_SECRET`)
- [ ] Configurer HTTPS (reverse proxy ou certificat SSL)
- [ ] Restreindre `CORS_ALLOW_ORIGIN` au domaine de production uniquement
- [ ] Ne **jamais** exposer les ports PostgreSQL et Redis
- [ ] Verifier `APP_DEBUG=0` et `APP_ENV=prod`
- [ ] Activer Sentry pour le monitoring d'erreurs (`api/config/packages/sentry.yaml` + `front/src/lib/sentry.ts`)

---

## Personnalisation

### Methode rapide (script)

```bash
./init.sh mon-nouveau-projet
```

Le script remplace automatiquement `kickstarter` par le nom de votre projet dans tous les fichiers de configuration, reinitialise le depot Git et nettoie les fichiers de template.

### Methode manuelle

1. **Renommer le projet** : remplacer `kickstarter` dans `docker-compose.yaml`, `api/.env`, `front/package.json`, `Makefile`
2. **Configurer les variables** : copier `api/.env` vers `api/.env.local` et adapter les valeurs
3. **Generer les cles JWT** : `make jwt-generate`
4. **Ajouter des entites** : `make shell-php` puis `php bin/console make:entity`
5. **Creer des migrations** : `make shell-php` puis `php bin/console make:migration`
6. **Adapter le frontend** : modifier les pages dans `front/src/pages/`, les composants dans `front/src/components/`
7. **Configurer Messenger** : dans `api/config/packages/messenger.yaml`, router vos messages vers le transport `async`
8. **Configurer OAuth** : creer les apps sur [Google Cloud Console](https://console.cloud.google.com/) et [GitHub Developer Settings](https://github.com/settings/developers), renseigner les credentials dans `.env.local`
9. **Configurer Meilisearch** : indexer vos donnees via `SearchService::index()` ou `SearchService::indexBatch()`

---

## Hooks Git et conventions de commit

Le projet utilise [Husky](https://typicode.github.io/husky/) pour les hooks Git automatiques :

- **pre-commit** : `lint-staged` corrige automatiquement le code modifie (PHP CS Fixer, ESLint, Prettier)
- **commit-msg** : `commitlint` valide le format [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/)

Format attendu :

```
<type>(<scope>): <description>
```

Types autorises : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`, `security`.

---

## Contribution

Les contributions sont les bienvenues. Consultez le fichier [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

---

## Liens

- [CHANGELOG](CHANGELOG.md) -- Historique des versions
- [CONTRIBUTING](CONTRIBUTING.md) -- Guide de contribution
- [LICENSE](LICENSE) -- Licence MIT

---

## Licence

[MIT](LICENSE) -- libre d'utilisation, modification et distribution.

---

<div align="center">

**[Revenir en haut](#symfony-kickstarter)**

</div>
