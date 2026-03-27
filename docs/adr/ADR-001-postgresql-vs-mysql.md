# ADR-001 : PostgreSQL vs MySQL

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

Le choix du SGBD est structurant pour le template. Les deux candidats principaux sont PostgreSQL et MySQL/MariaDB, tous deux largement supportes par Symfony et Doctrine.

## Decision

PostgreSQL 16 est retenu comme base de donnees par defaut.

## Raisons

1. **Types avances** : PostgreSQL supporte nativement JSON/JSONB, les arrays, les UUID, les types enumerations. Ces types sont utilises dans plusieurs entites du template (audit logs, feature flags, backup codes 2FA).

2. **Performance** : PostgreSQL offre de meilleures performances sur les requetes complexes (jointures, sous-requetes, CTE) grace a son optimiseur de requetes plus avance.

3. **Conformite SQL** : PostgreSQL respecte mieux le standard SQL, ce qui facilite la portabilite et reduit les surprises lors des migrations.

4. **Concurrence** : Le modele MVCC de PostgreSQL gere mieux les acces concurrents en ecriture que le verrouillage par tables d'InnoDB dans certains scenarios.

5. **Extensions** : PostGIS, pg_trgm (recherche floue), pg_stat_statements (monitoring) sont des extensions precieuses en production.

6. **Ecosysteme cloud** : Disponible sur tous les providers majeurs (AWS RDS, Google Cloud SQL, Azure Database, DigitalOcean, Supabase, Neon).

## Alternatives considerees

- **MySQL 8** : plus repandu historiquement, mais moins riche en types et plus laxiste sur la conformite SQL.
- **MariaDB** : fork communautaire de MySQL, mais diverge de plus en plus et n'est pas supporte par certains services cloud.
- **SQLite** : trop limite pour un template production (pas de concurrence, pas de types avances).

## Consequences

- Les migrations Doctrine utilisent des types specifiques PostgreSQL (`jsonb`, `uuid`).
- Le fichier `docker-compose.yaml` inclut un container `postgres:16-alpine`.
- Le `DATABASE_URL` par defaut utilise le driver `postgresql://`.
- Les utilisateurs souhaitant MySQL devront adapter les migrations et la configuration Doctrine.
