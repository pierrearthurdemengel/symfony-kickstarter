# Symfony Kickstarter

> Template de projet pret a cloner : Symfony 7 + API Platform + React/TypeScript + Docker.
> De `make install` a une app fonctionnelle en 5 minutes.

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Backend | PHP / Symfony | 8.3 / 7.2+ |
| API | API Platform | 3.4 |
| Auth | JWT (LexikJWTAuthenticationBundle) | 3.x |
| Frontend | React + TypeScript | 18+ / 5.x |
| Build | Vite | 5.x |
| CSS | Tailwind CSS | 3.x |
| BDD | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Container | Docker Compose | - |
| Reverse proxy | Nginx | 1.25 |
| Mail dev | Mailpit | latest |
| Tests back | PHPUnit | 11.x |
| Tests front | Vitest | 2.x |
| Tests E2E | Cypress | 13.x |
| Qualite back | PHPStan (level 8) + PHP CS Fixer | latest |
| Qualite front | ESLint + Prettier | latest |
| CI | GitHub Actions | - |

## Prerequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- [Make](https://www.gnu.org/software/make/)
- [Git](https://git-scm.com/)

## Installation

```bash
git clone https://github.com/pierrearthurdemengel/symfony-kickstarter.git
cd symfony-kickstarter
make install
```

La commande `make install` execute les etapes suivantes :

1. Build des images Docker (PHP 8.3 FPM, Nginx, Node)
2. Demarrage de tous les containers (PHP, Nginx, Node, PostgreSQL, Redis, Mailpit)
3. Installation des dependances backend (Composer)
4. Creation de la base de donnees PostgreSQL
5. Execution des migrations Doctrine
6. Installation des dependances frontend (npm)

Apres l'installation, charger les fixtures et generer les cles JWT :

```bash
make db-fixtures
make jwt-generate
```

## URLs

| Service | URL |
|---|---|
| Frontend (via Nginx) | [http://localhost:8080](http://localhost:8080) |
| Frontend (Vite direct) | [http://localhost:3010](http://localhost:3010) |
| API (docs Swagger) | [http://localhost:8080/api](http://localhost:8080/api) |
| Mailpit | [http://localhost:8026](http://localhost:8026) |

> Les ports sont configurables via des variables d'environnement dans un fichier `.env` a la racine ou en ligne de commande (ex: `NGINX_PORT=80 docker compose up -d`). Ports par defaut : Nginx 8080, Node 3010, PostgreSQL 5433, Redis 6380, Mailpit 8026/1026.

## Comptes de test

| Email | Mot de passe | Role |
|---|---|---|
| admin@kickstarter.dev | password | ROLE_ADMIN |
| user@kickstarter.dev | password | ROLE_USER |

## Commandes utiles

### Installation

| Commande | Description |
|---|---|
| `make install` | Installer le projet complet |
| `make install-back` | Installer les dependances backend (Composer) |
| `make install-front` | Installer les dependances frontend (npm) |

### Developpement

| Commande | Description |
|---|---|
| `make start` | Demarrer les containers |
| `make stop` | Arreter les containers |
| `make restart` | Redemarrer les containers |
| `make logs` | Afficher les logs de tous les services |
| `make logs-php` | Afficher les logs PHP |
| `make logs-front` | Afficher les logs du front |

### Base de donnees

| Commande | Description |
|---|---|
| `make db-create` | Creer la base de donnees |
| `make db-migrate` | Executer les migrations |
| `make db-fixtures` | Charger les fixtures |
| `make db-reset` | Reinitialiser la base (drop + create + migrate + fixtures) |

### Tests et qualite

| Commande | Description |
|---|---|
| `make test` | Lancer tous les tests (back + front) |
| `make test-back` | Lancer les tests backend (PHPUnit) |
| `make test-front` | Lancer les tests frontend (Vitest) |
| `make lint` | Lancer tous les linters |
| `make lint-back` | Lancer PHPStan + PHP CS Fixer |
| `make lint-front` | Lancer ESLint |

### Utilitaires

| Commande | Description |
|---|---|
| `make shell-php` | Ouvrir un shell dans le container PHP |
| `make shell-node` | Ouvrir un shell dans le container Node |
| `make jwt-generate` | Generer les cles JWT |
| `make help` | Afficher l'aide (liste des commandes) |

## Architecture

```
symfony-kickstarter/
├── api/                          # Backend Symfony 7
│   ├── config/
│   │   ├── packages/             # Configuration des bundles
│   │   └── jwt/                  # Cles JWT (generees)
│   ├── migrations/               # Migrations Doctrine
│   ├── public/                   # Point d'entree web
│   ├── src/
│   │   ├── Controller/           # Controllers (Healthcheck, Registration)
│   │   ├── DataFixtures/         # Fixtures (users de test)
│   │   ├── Entity/               # Entites Doctrine (User)
│   │   ├── Repository/           # Repositories Doctrine
│   │   ├── Security/Voter/       # Voters (UserVoter)
│   │   └── State/                # State processors API Platform
│   └── tests/
│       ├── Functional/           # Tests fonctionnels
│       └── Unit/                 # Tests unitaires
├── front/                        # Frontend React + TypeScript
│   ├── cypress/                  # Tests E2E Cypress
│   │   ├── e2e/
│   │   └── support/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/             # LoginForm, RegisterForm, ProtectedRoute
│   │   │   ├── Layout/           # Header, Footer, Layout
│   │   │   └── Ui/              # Button, Input, Alert
│   │   ├── hooks/                # useAuth, useApi
│   │   ├── pages/                # Home, Login, Register, Dashboard, NotFound
│   │   ├── services/             # Client API
│   │   ├── tests/                # Tests unitaires (Vitest)
│   │   └── types/                # Types TypeScript
│   ├── cypress.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker/
│   ├── nginx/                    # Configuration Nginx
│   ├── node/                     # Dockerfile Node
│   └── php/                      # Dockerfile PHP 8.3 FPM
├── .github/workflows/            # CI GitHub Actions
├── docker-compose.yaml           # Services principaux
├── docker-compose.override.yaml  # Overrides dev (Xdebug)
├── Makefile                      # Commandes du projet
└── init.sh                       # Script d'initialisation du template
```

## Fonctionnalites incluses

### Backend

- Entite User complete (email, password, firstName, lastName, roles)
- Authentification JWT (login `POST /api/login`, register `POST /api/register`)
- API Platform CRUD avec documentation Swagger auto-generee
- Security : firewall stateless, voters (UserVoter), controle d'acces
- DataFixtures avec comptes admin et user de test
- Migrations Doctrine
- Endpoint healthcheck (`GET /api/healthcheck`)
- Messenger async-ready (transport Doctrine par defaut, switchable vers Redis/AMQP)
- Mailer configure (Mailpit en dev)
- State processor pour le hachage des mots de passe

### Frontend

- React Router v6 avec routes protegees (ProtectedRoute)
- Authentification JWT complete (hook `useAuth`)
- Pages : Home, Login, Register, Dashboard, 404
- Client API (`services/api.ts`) avec injection automatique du token JWT
- Hook `useApi` pour les appels API
- Composants UI reutilisables : Button, Input, Alert
- Layout responsive : Header avec navigation, Footer
- Tailwind CSS avec configuration personnalisee

### DevOps

- Docker multi-services : PHP 8.3 FPM, Nginx 1.25, Node, PostgreSQL 16, Redis 7, Mailpit
- Docker Compose override pour le dev (Xdebug active)
- Makefile avec 20+ commandes organisees par categorie
- CI GitHub Actions
- Qualite code : PHPStan level 8, PHP CS Fixer (PSR-12), ESLint, Prettier

## Personnalisation

Pour adapter ce template a un nouveau projet :

### Methode rapide (script)

```bash
./init.sh mon-nouveau-projet
```

Le script remplace automatiquement `kickstarter` par le nom de votre projet dans tous les fichiers de configuration.

### Methode manuelle

1. **Renommer le projet** : remplacer `kickstarter` dans `docker-compose.yaml`, `api/.env`, `front/package.json`, `Makefile`
2. **Configurer les variables** : copier `api/.env` vers `api/.env.local` et adapter les valeurs (secrets, base de donnees)
3. **Generer les cles JWT** : `make jwt-generate`
4. **Ajouter des entites** : `make shell-php` puis `php bin/console make:entity`
5. **Creer des migrations** : `make shell-php` puis `php bin/console make:migration`
6. **Adapter le frontend** : modifier les pages dans `front/src/pages/`, les composants dans `front/src/components/`
7. **Configurer Messenger** : dans `api/config/packages/messenger.yaml`, router vos messages vers le transport `async`

## Licence

MIT - voir le fichier [LICENSE](LICENSE) pour plus de details.
