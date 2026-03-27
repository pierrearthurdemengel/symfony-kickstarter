# Contribuer a Symfony Kickstarter

Merci de votre interet pour ce projet. Ce guide explique comment contribuer efficacement.

## Table des matieres

- [Prerequis](#prerequis)
- [Setup local](#setup-local)
- [Workflow de developpement](#workflow-de-developpement)
- [Convention de commits](#convention-de-commits)
- [Convention de code](#convention-de-code)
- [Tests](#tests)
- [Soumettre une Pull Request](#soumettre-une-pull-request)
- [Process de review](#process-de-review)
- [Signaler un bug](#signaler-un-bug)
- [Proposer une fonctionnalite](#proposer-une-fonctionnalite)

## Prerequis

- Docker et Docker Compose (v2+)
- Make
- Git
- Un editeur avec support TypeScript et PHP (VS Code, PHPStorm)

## Setup local

### 1. Fork et clone

```bash
# Forker le repository sur GitHub (bouton "Fork")
git clone https://github.com/votre-utilisateur/symfony-kickstarter.git
cd symfony-kickstarter
```

### 2. Ajouter l'upstream

```bash
git remote add upstream https://github.com/pierrearthurdemengel/symfony-kickstarter.git
```

### 3. Installer le projet

```bash
make install       # Build Docker + dependances + migrations + hooks
make db-fixtures   # Charger les donnees de test
make jwt-generate  # Generer les cles JWT
```

### 4. Verifier l'installation

```bash
make check         # Lint + tests complets
```

Si tout passe, l'environnement est pret. Le frontend est accessible sur `http://localhost:8080` et l'API Swagger sur `http://localhost:8080/api`.

### 5. Comptes de test

| Email | Mot de passe | Role |
|---|---|---|
| `admin@kickstarter.dev` | `password` | `ROLE_ADMIN` |
| `user@kickstarter.dev` | `password` | `ROLE_USER` |

## Workflow de developpement

### 1. Synchroniser votre fork

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Creer une branche

Nommage des branches :

| Prefixe | Usage |
|---|---|
| `feat/` | Nouvelle fonctionnalite |
| `fix/` | Correction de bug |
| `docs/` | Documentation |
| `refactor/` | Refactorisation |
| `test/` | Ajout de tests |
| `chore/` | Maintenance |

```bash
git checkout -b feat/ma-fonctionnalite
```

### 3. Developper

- Lancer les containers : `make start`
- Voir les logs : `make logs`
- Shell PHP : `make shell-php`
- Shell Node : `make shell-node`

### 4. Verifier avant de committer

```bash
make lint          # PHPStan + CS Fixer + ESLint
make test          # PHPUnit + Vitest
```

### 5. Committer et pousser

```bash
git add .
git commit -m "feat(api): ajouter endpoint de recherche avancee"
git push origin feat/ma-fonctionnalite
```

### 6. Ouvrir une Pull Request

Depuis GitHub, ouvrir une PR vers `main` du repository original.

## Convention de commits

Ce projet suit la specification [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/).

### Format

```
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]
```

### Types autorises

| Type | Description |
|---|---|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `style` | Formatage (pas de changement de code) |
| `refactor` | Refactorisation sans changement fonctionnel |
| `test` | Ajout ou correction de tests |
| `chore` | Maintenance (config, CI, dependances) |
| `perf` | Amelioration des performances |
| `ci` | Changements CI/CD |
| `security` | Correctif de securite |

### Scopes courants

| Scope | Perimetre |
|---|---|
| `api` | Backend Symfony |
| `front` | Frontend React |
| `docker` | Configuration Docker |
| `ci` | GitHub Actions |
| `docs` | Documentation |

### Exemples

```
feat(api): ajouter l'endpoint de reset password
fix(front): corriger la redirection apres login
docs: mettre a jour le README
chore(docker): upgrader PostgreSQL vers 17
test(api): ajouter les tests du UserVoter
security(api): corriger la faille XSS dans les notifications
```

## Hooks pre-commit automatiques

Le projet utilise **Husky** et **lint-staged** pour executer automatiquement des verifications avant chaque commit :

- **pre-commit** : `lint-staged` corrige automatiquement le code modifie
  - Fichiers PHP (`api/src/**/*.php`) : PHP CS Fixer via Docker
  - Fichiers TypeScript (`front/src/**/*.{ts,tsx}`) : ESLint + Prettier
  - Fichiers CSS (`front/src/**/*.css`) : Prettier
- **commit-msg** : `commitlint` valide que le message de commit respecte le format Conventional Commits

Les hooks sont installes automatiquement par `make install`. Pour les reinstaller manuellement :

```bash
make install-hooks
```

Si un hook echoue, corrigez les erreurs signalees puis relancez votre commit. Ne desactivez jamais les hooks (`--no-verify`) sauf cas exceptionnel valide par l'equipe.

## Convention de code

### Backend (PHP)

- **Standard** : PSR-12 (applique par PHP CS Fixer)
- **Analyse statique** : PHPStan level 6
- **Typage** : `declare(strict_types=1)` obligatoire dans chaque fichier
- **Classes** : `final class` par defaut
- **Commentaires** : en francais
- **Nommage** : classes, methodes et variables en anglais

```bash
make lint-back     # Verifier
make fix           # Corriger automatiquement
```

### Frontend (TypeScript/React)

- **Linting** : ESLint avec configuration stricte
- **Formatage** : Prettier
- **Typage** : TypeScript strict, zero `any`
- **Composants** : fonctionnels uniquement (pas de `class` React)
- **Hooks** : prefixe `use` pour les hooks custom

```bash
make lint-front    # Verifier
make fix           # Corriger automatiquement
```

## Tests

### Backend

```bash
make test-back              # Tous les tests PHPUnit
make test-coverage          # Avec couverture
make shell-php              # Puis :
php vendor/bin/phpunit --filter=MonTest   # Un test specifique
```

Les tests utilisent `dama/doctrine-test-bundle` pour l'isolation (chaque test s'execute dans une transaction annulee).

### Frontend

```bash
make test-front             # Tous les tests Vitest
make shell-node             # Puis :
npx vitest run --reporter=verbose   # Mode verbose
```

### Regles

- Chaque nouvelle fonctionnalite doit etre accompagnee de tests
- Les tests existants ne doivent pas casser
- Couverture minimale : 70% backend, 60% frontend

## Soumettre une Pull Request

### Checklist avant soumission

- [ ] Les tests passent (`make test`)
- [ ] Le linting passe (`make lint`)
- [ ] Les nouveaux fichiers suivent les conventions du projet
- [ ] La documentation est a jour si necessaire
- [ ] Les commits suivent la convention Conventional Commits
- [ ] Le titre de la PR est clair et concis

### Template de PR

Le template est pre-rempli automatiquement. Completer :

1. **Description** : ce que fait la PR et pourquoi
2. **Type de changement** : feat, fix, docs, etc.
3. **Tests** : comment tester la PR
4. **Captures d'ecran** : si changements visuels

## Process de review

1. **CI** : tous les checks doivent passer (tests, lint, build)
2. **Review** : au moins une approbation requise
3. **Merge** : squash and merge vers `main`
4. **Release** : les releases sont coupees periodiquement depuis `main`

### Criteres de review

- Le code est-il lisible et maintenable ?
- Les tests couvrent-ils les cas importants ?
- La PR est-elle focalisee (un seul sujet) ?
- Les conventions du projet sont-elles respectees ?
- Y a-t-il des risques de securite ?

## Signaler un bug

Ouvrir une issue GitHub avec le template "Bug report" :

1. **Description** : description claire et concise du bug
2. **Reproduction** : etapes pour reproduire le probleme
3. **Comportement attendu** : ce qui devrait se passer
4. **Comportement observe** : ce qui se passe reellement
5. **Environnement** : OS, version Docker, navigateur
6. **Logs** : messages d'erreur pertinents (`docker compose logs`)

## Proposer une fonctionnalite

Ouvrir une issue GitHub avec le template "Feature request" :

1. **Description** : description de la fonctionnalite
2. **Motivation** : pourquoi cette fonctionnalite serait utile
3. **Implementation** : proposition d'implementation (si vous en avez une)
4. **Alternatives** : solutions alternatives envisagees

Les fonctionnalites sont discutees dans les issues avant implementation. Ne commencez pas le code avant validation.
