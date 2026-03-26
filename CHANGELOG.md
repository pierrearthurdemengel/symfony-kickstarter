# Changelog

Toutes les modifications notables de ce projet sont documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

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
