# ADR-006 : Monorepo vs repos separes

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

Le projet comprend un backend Symfony, un frontend React, une configuration Docker et des scripts DevOps. La question est de savoir si ces composants doivent vivre dans un seul repository ou etre separes.

## Decision

L'architecture monorepo est retenue : backend, frontend, Docker et scripts DevOps cohabitent dans un seul repository Git.

## Raisons

1. **Simplicite pour un template** : un `git clone` unique suffit pour obtenir tout le projet. Pas besoin de coordonner plusieurs repos, sous-modules, ou registry npm/Composer prives.

2. **Docker Compose** : la stack Docker necessite les fichiers des deux applications (backend et frontend). Un monorepo simplifie les volumes, les Dockerfiles multi-stage et les builds de production.

3. **CI/CD unifiee** : un seul workflow GitHub Actions teste et deploie le backend et le frontend. Les changements cross-stack (ex: modification d'un endpoint API + adaptation du type TypeScript) sont commits et testes ensemble.

4. **Versionning coherent** : un seul CHANGELOG, un seul schema de tags, une seule source de verite pour la version du projet.

5. **DX** : les developpeurs ouvrent un seul projet dans leur IDE, avec la completion TypeScript des types API directement dans le frontend.

6. **Deploiement atomique** : les changements API + frontend sont deployes ensemble, ce qui evite les desynchronisations de contrat API.

## Alternatives considerees

- **Repos separes** (api + front + infra) : meilleure separation des responsabilites, mais complexite accrue pour la coordination, les tests d'integration et le deploiement. Plus adapte aux grandes equipes avec des cycles de release independants.
- **Git submodules** : pire des deux mondes. Complexite de Git submodules sans les avantages d'une vraie separation.

## Consequences

- Le repository contient trois dossiers principaux : `api/`, `front/`, `docker/`.
- Le `Makefile` a la racine orchestre les commandes des deux applications.
- Le workflow CI teste le backend et le frontend dans le meme pipeline.
- Le `docker-compose.yaml` reference les deux applications via des volumes.
- Le script `init.sh` renomme le projet dans les deux applications en une seule passe.
- Si un utilisateur veut separer les repos plus tard, la structure en dossiers facilite l'extraction.
