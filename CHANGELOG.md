# Changelog

Toutes les modifications notables de ce projet sont documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

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
