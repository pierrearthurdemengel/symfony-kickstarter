# Contribuer a Symfony Kickstarter

Merci de votre interet pour ce projet. Ce guide explique comment contribuer efficacement.

## Table des matieres

- [Prerequis](#prerequis)
- [Fork et installation](#fork-et-installation)
- [Workflow de developpement](#workflow-de-developpement)
- [Convention de commits](#convention-de-commits)
- [Convention de code](#convention-de-code)
- [Soumettre une Pull Request](#soumettre-une-pull-request)
- [Signaler un bug](#signaler-un-bug)
- [Proposer une fonctionnalite](#proposer-une-fonctionnalite)

## Prerequis

- Docker et Docker Compose
- Make
- Git

## Fork et installation

1. Forker le repository sur GitHub
2. Cloner votre fork :

```bash
git clone https://github.com/votre-utilisateur/symfony-kickstarter.git
cd symfony-kickstarter
```

3. Ajouter le repository upstream :

```bash
git remote add upstream https://github.com/original/symfony-kickstarter.git
```

4. Installer le projet :

```bash
make install
make db-fixtures
make jwt-generate
```

5. Verifier que tout fonctionne :

```bash
make test
make lint
```

## Workflow de developpement

1. Synchroniser votre branche `main` avec l'upstream :

```bash
git checkout main
git pull upstream main
```

2. Creer une branche a partir de `main` :

```bash
git checkout -b feat/ma-fonctionnalite
```

3. Developper et committer vos changements (voir conventions ci-dessous)

4. Pousser votre branche et ouvrir une Pull Request

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
| `style` | Formatage, points-virgules manquants, etc. (pas de changement de code) |
| `refactor` | Refactorisation sans changement fonctionnel |
| `test` | Ajout ou correction de tests |
| `chore` | Maintenance (config, CI, dependances) |
| `perf` | Amelioration des performances |

### Scopes courants

- `api` - Backend Symfony
- `front` - Frontend React
- `docker` - Configuration Docker
- `ci` - GitHub Actions

### Exemples

```
feat(api): ajouter l'endpoint de reset password
fix(front): corriger la redirection apres login
docs: mettre a jour le README
chore(docker): upgrader PostgreSQL vers 17
test(api): ajouter les tests du UserVoter
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
- **Analyse statique** : PHPStan level 8
- **Verifier avant de committer** :

```bash
make lint-back
make test-back
```

### Frontend (TypeScript/React)

- **Linting** : ESLint avec configuration stricte
- **Formatage** : Prettier
- **Verifier avant de committer** :

```bash
make lint-front
make test-front
```

### Regles generales

- Typage strict partout (`declare(strict_types=1)` en PHP, TypeScript strict mode)
- Pas de `any` en TypeScript sauf cas exceptionnels documentes
- Tests requis pour toute nouvelle fonctionnalite
- Les classes PHP finales par defaut (`final class`)
- Composants React fonctionnels uniquement

## Soumettre une Pull Request

1. Verifier que tous les tests passent : `make test`
2. Verifier que le code respecte les standards : `make lint`
3. Pousser votre branche sur votre fork
4. Ouvrir une Pull Request sur le repository original
5. Remplir le template de PR avec :
   - Description claire des changements
   - Lien vers l'issue associee (si applicable)
   - Captures d'ecran (si changements visuels)
   - Instructions de test

### Checklist PR

- [ ] Les tests passent (`make test`)
- [ ] Le linting passe (`make lint`)
- [ ] Les nouveaux fichiers suivent les conventions du projet
- [ ] La documentation est a jour si necessaire
- [ ] Le commit suit la convention Conventional Commits

## Signaler un bug

Ouvrir une issue GitHub avec les informations suivantes :

1. **Description** : description claire et concise du bug
2. **Reproduction** : etapes pour reproduire le probleme
3. **Comportement attendu** : ce qui devrait se passer
4. **Comportement observe** : ce qui se passe reellement
5. **Environnement** : OS, version Docker, navigateur
6. **Logs** : messages d'erreur pertinents (console, Docker logs)

## Proposer une fonctionnalite

Ouvrir une issue GitHub avec :

1. **Description** : description de la fonctionnalite
2. **Motivation** : pourquoi cette fonctionnalite serait utile
3. **Implementation** : proposition d'implementation (si vous en avez une)
4. **Alternatives** : solutions alternatives envisagees
