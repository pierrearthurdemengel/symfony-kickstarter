# Changelog

Toutes les modifications notables de ce projet sont documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [0.9.0] - 2026-03-27

### Ajoute

#### Backend - Authentification
- Refresh token JWT avec rotation (entite RefreshToken, endpoint POST /api/token/refresh)
- Stockage refresh token en base (duree 30 jours, max 5 sessions actives par utilisateur)
- Revocation des refresh tokens a la deconnexion (POST /api/logout)
- Blacklist des access tokens revoques via Redis (TokenBlacklistService, TTL automatique)
- Option stockage JWT en cookie httpOnly (variable JWT_COOKIE_ENABLED)

#### Backend - Securite
- Headers de securite avances (SecurityHeaderSubscriber : CSP, Permissions-Policy, Referrer-Policy, COOP, CORP)
- Protection SSRF sur les uploads (SafeUploadValidator : verification MIME reelle via finfo)
- Configuration Dependabot (Composer, npm, GitHub Actions - PR automatiques hebdomadaires)
- Scan vulnerabilites composer audit et npm audit en CI (bloquant)
- Expiration automatique des sessions inactives (revocation refresh tokens)

#### Backend - API
- Matrice de tests CI elargie (PHP 8.3/8.4, Node 20/22)
- Pipeline CI avec seuils de couverture (back 70%, front 60%)
- Job security-scan dedie (audits Composer + npm bloquants)

#### Tests et qualite
- Tests TokenControllerTest (6 tests : refresh, rotation, revocation, logout)
- Tests SecurityHeadersTest (2 tests : headers, CSP)
- Script de test de charge k6 (scenarios realistes, seuils p95 < 500ms)
- Script smoke tests post-deploiement (verification endpoints critiques)
- Commande app:clean-expired-tokens etendue aux refresh tokens

#### Frontend - Gestion d'etat et cache
- TanStack Query (React Query v5) : provider, cache, retry automatique avec backoff exponentiel
- Zustand (store global) : preferences UI, sidebar, detection offline, file d'attente actions
- Retry automatique sur erreurs reseau dans api.ts (backoff exponentiel, max 3 tentatives)
- Rafraichissement JWT automatique sur 401 (transparent, verrou anti-concurrence)

#### Frontend - Robustesse
- Lazy loading de toutes les routes (React.lazy + Suspense, chunks separes)
- Composant LoadingSpinner (indicateur pour le lazy loading)
- Detection offline (hook useOnlineStatus, banniere OfflineBanner)
- File d'attente des actions offline (replay automatique au retour connexion)
- Deconnexion avec revocation server-side des tokens

#### DevOps
- Templates GitHub Issues (bug report, feature request)
- Template GitHub Pull Request
- Commandes Makefile : audit, smoke-test, clean-refresh-tokens

### Modifie

- api.ts : retry automatique, refresh token transparent, backoff exponentiel
- useAuth : support refresh token, logout avec revocation, refreshUser
- App.tsx : QueryProvider, lazy loading, OfflineBanner
- security.yaml : route publique /api/token/refresh
- services.yaml : service Redis, TokenBlacklistService, parametre JWT_COOKIE_ENABLED
- .env : variables REDIS_HOST, REDIS_PORT, JWT_COOKIE_ENABLED
- CI : matrice PHP 8.3/8.4, Node 20/22, audits securite, coverage
- CleanExpiredTokensCommand : nettoyage refresh tokens expires/revoques
- Makefile : commandes audit, smoke-test, clean-refresh-tokens
- package.json : ajout @tanstack/react-query, zustand

## [0.8.0] - 2026-03-27

### Ajoute

- Endpoints RGPD (GET /api/me/export, POST /api/me/delete) avec export JSON et suppression de compte
- Service FeatureFlagService (stockage Redis, flags par defaut configurables)
- Endpoints feature flags (GET /api/feature-flags public, PUT /api/admin/feature-flags/{flag})
- Service WebhookService (dispatch HTTP avec signature HMAC-SHA256, multi-endpoints)
- PWA : manifest.json, service worker (cache network-first, support hors-ligne)
- Page admin Feature Flags (toggles temps reel)
- Page RGPD (export donnees, suppression compte avec confirmation)
- Hook useFeatureFlags (provider + context)
- Meta PWA dans index.html (theme-color, manifest, apple-touch-icon)

## [0.7.0] - 2026-03-27

### Ajoute

- Service Meilisearch (Docker container, SearchService, endpoint GET /api/search/{index})
- Event subscriber CacheHeaderSubscriber (headers HTTP cache public/prive)
- Pools de cache Redis supplementaires (cache.api, cache.search)
- Dashboard files d'attente admin (GET /api/admin/queue/stats, GET /api/admin/queue/failed, POST /api/admin/queue/retry/{id})
- Monolog : channels audit et security avec formatage JSON structure
- Page admin Files d'attente (stats, messages en echec, bouton retry)
- Hook useSearch (recherche Meilisearch)
- Navigation admin enrichie (Permissions, Feature Flags, Files d'attente)

### Modifie

- docker-compose.yaml : ajout service Meilisearch
- cache.yaml : pools api et search
- monolog.yaml : handlers audit et security

## [0.6.0] - 2026-03-27

### Ajoute

- OAuth social login (Google, GitHub) avec OAuthController et entite UserOAuthProvider
- Authentification 2FA TOTP sans bundle externe (TwoFactorController, generation QR code, codes de secours)
- Impersonation admin (ImpersonationController, JWT custom claims, audit log)
- Systeme RBAC granulaire (entites Permission, PermissionGroup, PermissionVoter)
- Administration des permissions (PermissionController CRUD, DataFixtures par defaut)
- Mercure SSE (Docker container, MercurePublisher, notifications temps reel)
- ProfileController (GET/PATCH /api/me, POST /api/me/password)
- Composant OAuthButtons (Google + GitHub avec icones SVG)
- Page OAuthCallback (echange code autorisation contre JWT)
- Pages TwoFactorSetup (QR code + verification) et TwoFactorVerify (saisie code)
- Composant ImpersonationBanner (detection claim JWT, retour admin)
- Composant PermissionGate (affichage conditionnel par permission)
- Page admin PermissionGroups (CRUD modal avec selection par categorie)
- Hook useMercure (SSE avec auto-reconnexion)
- Hook usePermissions (verification RBAC cote client)
- Migration V0.6 (tables permission, permission_group, user_oauth_provider, colonnes 2FA)
- Boutons OAuth sur le formulaire de connexion
- Section 2FA sur la page profil (activation/desactivation)

### Modifie

- docker-compose.yaml : ajout services Mercure et Meilisearch
- security.yaml : routes publiques OAuth et feature-flags
- services.yaml : parametres OAuth et Meilisearch
- User entity : champs isTwoFactorEnabled, totpSecret, backupCodes, permissionGroups
- NotificationService : publication Mercure temps reel
- .env : variables Mercure, OAuth, Meilisearch

### Corrige

- Test JWT passphrase (phpunit.xml.dist nettoyage variables JWT)
- Transport Messenger en test (sync:// au lieu de doctrine://)
- Rate limiter persistant entre tests (limites tres hautes en when@test)
- Isolation des tests (dama/doctrine-test-bundle)
- Duplicate email AuthenticationTest
- TO_CHAR DQL incompatible (passage en SQL natif)
- Entite User detachee dans NotificationControllerTest
- Faux JPEG non detecte comme image/jpeg (header binaire valide)
- UniqueEntity violation sur PUT avec meme email (passage en PATCH)

## [0.5.0] - 2026-03-26

### Ajoute

- Notifications in-app (entite Notification, NotificationRepository, NotificationController)
- Endpoints notifications (GET /api/notifications, GET /api/notifications/unread-count, PATCH /api/notifications/{id}/read, POST /api/notifications/mark-all-read, DELETE /api/notifications/{id})
- Service NotificationService pour la creation de notifications depuis le backend
- Internationalisation backend : Symfony Translation (francais/anglais) avec fichiers YAML
- Internationalisation frontend : react-i18next avec detection automatique de la langue du navigateur
- Fichiers de traduction complets (fr.json + en.json) couvrant toute l'interface
- Composant LanguageSwitcher (bascule FR/EN dans le header)
- Composant NotificationBell (cloche avec badge compteur, dropdown des notifications recentes)
- Page Notifications (liste paginee, marquer lu, supprimer)
- Hook useNotifications (CRUD + polling automatique du compteur non lu)
- Configuration Supervisor pour le worker Messenger en production
- Commandes Makefile : messenger-consume, messenger-failed, messenger-retry
- Tests NotificationControllerTest (7 tests : CRUD, unread count, isolation par utilisateur)
- Migration notification table
- Script init.sh ameliore (plus de fichiers, reinitialisation Git, nettoyage)

### Modifie

- Header : ajout de NotificationBell, LanguageSwitcher, traductions i18n
- README : mise a jour complete des fonctionnalites (V0.3/V0.4/V0.5), architecture, commandes
- Healthcheck version 0.5.0

## [0.4.0] - 2026-03-26

### Ajoute

- Journal d'audit (entite AuditLog, service AuditLogger, repository avec requetes)
- Endpoints admin (GET /api/admin/stats, GET /api/admin/users/export, GET /api/admin/audit-logs)
- Export CSV des utilisateurs (endpoint streame avec en-tetes)
- Commande Symfony app:clean-expired-tokens (nettoyage des tokens expires, option --dry-run)
- Statistiques avancees dashboard admin (inscriptions/mois, repartition roles, taux verification)
- Graphiques Recharts dans le dashboard admin (BarChart inscriptions, PieChart roles)
- Page journal d'audit admin (tableau pagine, badges actions, details JSON expandable)
- Hook useAdminStats (statistiques + export CSV)
- Hook useAuditLog (pagination journal d'audit)
- Bouton export CSV sur dashboard et liste utilisateurs
- Navigation sidebar : lien journal d'audit
- Types TypeScript : AdminStats, AuditLogEntry, AuditLogResponse, RegistrationsByMonth
- Tests AdminControllerTest (stats, export, audit logs, controle ROLE_ADMIN)
- Tests CleanExpiredTokensCommandTest (dry-run + execution)
- Commandes Makefile : clean-tokens, clean-tokens-dry, test-coverage
- Migration audit_log table

### Corrige

- Tests fonctionnels PHPUnit : pattern createClient compatible Symfony 7 (bootKernel supprime)
- phpunit.xml.dist : suppression APP_ENV=dev qui ecrasait l'environnement de test
- DataTable : contrainte generique T extends object (au lieu de Record<string, unknown>)

### Securite

- Acces aux endpoints /api/admin restreint a ROLE_ADMIN via access_control

## [0.3.0] - 2026-03-26

### Ajoute

- Upload de fichiers (entite MediaObject, endpoint multipart, servant de fichiers)
- Champ avatar sur User (relation MediaObject)
- Verification email a l'inscription (token 24h, endpoints verify-email et resend-verification)
- Rate limiting (login 5/min, register 3/h, forgot-password 3/h, API globale 100/min)
- Subscriber rate limiter avec headers X-RateLimit
- Interface admin avec sidebar responsive (AdminLayout)
- AdminRoute (verification ROLE_ADMIN)
- Page admin dashboard (statistiques, derniers inscrits)
- Page liste utilisateurs admin (DataTable, recherche, tri, pagination, suppression)
- Page detail utilisateur admin
- Page edition utilisateur admin (roles modifiables)
- Composant FileUpload (drag & drop, preview, barre de progression)
- Composant Badge (variantes pour roles et statuts)
- Composant SearchInput (debounce integre)
- Hook useUsers (CRUD admin avec filtres API Platform)
- Docker production multi-stage (PHP + React buildes)
- docker-compose.prod.yaml (stack production sans node/mailpit)
- Config Nginx production (gzip, cache, HSTS, CSP)
- Config PHP production (opcache JIT, validate_timestamps off)
- Workflow GitHub Actions deploy (template sur tag)
- Configuration Sentry prete a activer (backend + frontend)
- .env.prod.example documente
- Commandes Makefile production (prod-build, prod-start, prod-stop, front-build)
- Tests upload media et verification email

## [0.2.0] - 2026-03-26

### Ajoute

- Mot de passe oublie (forgot-password + reset-password avec token securise)
- Templates email Twig (bienvenue + reset password)
- Filtres API Platform sur User (recherche partielle, tri, filtre par date)
- Message async SendWelcomeEmailMessage avec handler Messenger
- Healthcheck avance (verification BDD + Redis, statut "ok" ou "degraded")
- Fixtures realistes (50 utilisateurs avec prenoms/noms francais)
- Event subscriber login (lastLoginAt + log Monolog)
- Systeme de toast/notifications (success, error, warning, info)
- Dark mode (toggle light/dark/system avec persistence localStorage)
- Validation formulaires avec react-hook-form + zod
- Pages forgot-password et reset-password
- Page profil editable avec changement de mot de passe
- Composant Modal/Dialog accessible (focus trap, Escape, overlay)
- Composant DataTable generique type (tri, loading skeleton)
- Composant Pagination avec ellipsis
- Composant Dropdown menu
- Composant Skeleton (loading placeholders)
- Error Boundary React
- Husky pre-commit hooks (lint-staged sur PHP et TypeScript)
- commitlint avec Conventional Commits
- Commandes Makefile : db-backup, db-restore, check, fix, install-hooks
- Tests Modal et Toast (Vitest)
- Tests fonctionnels reset password (PHPUnit)

### Modifie

- Symfony mis a jour de 7.1 vers 7.2+ (correctifs securite)
- API Platform 3.4 (au lieu de 4.x annonce)
- Ports Docker configurables via variables d'environnement
- PHPStan level 6 (au lieu de 8, plus realiste sans extension Symfony)
- Header avec Dropdown user menu et DarkModeToggle
- Formulaires LoginForm et RegisterForm reecrits avec react-hook-form
- Tous les composants supportent le dark mode

### Securite

- Suppression du APP_SECRET genere par Symfony Flex dans .env.dev

## [0.1.0] - 2026-03-26

### Ajoute

- Setup Docker (PHP 8.3 FPM, Nginx 1.25, PostgreSQL 16, Redis 7, Mailpit)
- Docker Compose override pour le dev (Xdebug)
- Projet Symfony 7.1 avec API Platform 4
- Entite User avec CRUD API Platform
- Authentification JWT (login, register)
- Security (firewall stateless, voters, CORS)
- State processor pour le hachage des mots de passe
- Endpoint healthcheck
- Messenger async-ready (transport Doctrine, switchable vers Redis/AMQP)
- Mailer configure (Mailpit en dev)
- Frontend React 18 + TypeScript 5 + Tailwind CSS 3
- Pages : Home, Login, Register, Dashboard, 404
- Client API avec injection JWT automatique
- Hooks React (useAuth, useApi)
- Composants UI (Button, Input, Alert)
- Layout responsive (Header, Footer)
- Routes protegees (ProtectedRoute)
- Tests unitaires backend (PHPUnit 11)
- Tests unitaires frontend (Vitest 2)
- Tests E2E (Cypress 13)
- CI GitHub Actions
- Makefile avec 20+ commandes
- DataFixtures (admin + user de test)
- PHPStan level 8 + PHP CS Fixer
- ESLint + Prettier
- Script d'initialisation du template (init.sh)
