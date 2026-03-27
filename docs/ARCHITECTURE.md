# Architecture

## Vue d'ensemble (C4 - Niveau 1 : Contexte)

```
                    +------------------+
                    |   Utilisateur    |
                    |   (Navigateur)   |
                    +--------+---------+
                             |
                             | HTTPS
                             v
                    +------------------+
                    |  Symfony         |
                    |  Kickstarter     |
                    |  (Application)   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
        +-----------+  +-----------+  +-----------+
        | Google    |  | GitHub    |  | SMTP      |
        | OAuth     |  | OAuth     |  | (emails)  |
        +-----------+  +-----------+  +-----------+
```

## Conteneurs (C4 - Niveau 2)

```
+----------------------------------------------------------------------+
|                        Nginx (reverse proxy)                          |
|  - Sert les assets statiques (React build)                           |
|  - Proxifie /api vers PHP-FPM                                        |
|  - Gzip, cache headers, HSTS, CSP                                    |
+---+----------------------------+-------------------------------------+
    |                            |
    | Assets statiques           | /api/*
    |                            |
    v                            v
+----------------+      +-------------------+
| Frontend React |      | Backend Symfony   |
| (SPA)          |      | (API Platform)    |
|                |      |                   |
| - React 18     |      | - PHP 8.3 FPM    |
| - TypeScript 5 |      | - Symfony 7.2     |
| - Tailwind CSS |      | - API Platform    |
| - Vite 5       |      | - JWT Auth        |
| - TanStack Q.  |      | - Messenger       |
| - Zustand      |      | - Monolog         |
+----------------+      +-------+-----------+
                                |
                 +--------------+--------------+
                 |              |              |
                 v              v              v
          +-----------+  +-----------+  +-----------+
          | PostgreSQL |  | Redis     |  | Mercure   |
          | 16         |  | 7         |  | (SSE)     |
          |            |  |           |  |           |
          | - Donnees  |  | - Cache   |  | - Notif.  |
          | - Migrations|  | - Sessions|  | - Temps   |
          | - Audit    |  | - Blacklist|  |   reel    |
          +-----------+  | - Rate lim.|  +-----------+
                         | - Flags    |
                         +-----------+
                                |
                 +--------------+--------------+
                 |                             |
                 v                             v
          +-----------+                 +-----------+
          | Meilisearch|                | Mailpit   |
          | (recherche)|                | (dev mail)|
          +-----------+                 +-----------+
```

## Flux d'authentification

```
Utilisateur              Frontend              Backend               Redis
    |                       |                     |                     |
    |--- Login ------------>|                     |                     |
    |                       |--- POST /api/login->|                     |
    |                       |                     |--- Hash password    |
    |                       |                     |--- Generate JWT     |
    |                       |                     |--- Create refresh   |
    |                       |<-- {token, refresh}-|    token (DB)       |
    |                       |                     |                     |
    |                       |--- Store tokens     |                     |
    |<-- Dashboard ---------|                     |                     |
    |                       |                     |                     |
    |--- Action API ------->|                     |                     |
    |                       |--- GET /api/users ->|                     |
    |                       |   (Bearer token)    |--- Verify JWT       |
    |                       |                     |--- Check blacklist->|
    |                       |                     |<-- Not blacklisted -|
    |                       |<-- 200 users -------|                     |
    |<-- Data --------------|                     |                     |
    |                       |                     |                     |
    |--- (Token expire) --->|                     |                     |
    |                       |--- POST /api/       |                     |
    |                       |    token/refresh -->|                     |
    |                       |                     |--- Validate refresh |
    |                       |                     |--- Rotate token     |
    |                       |<-- {new tokens} ----|                     |
    |                       |                     |                     |
    |--- Logout ----------->|                     |                     |
    |                       |--- POST /api/logout>|                     |
    |                       |                     |--- Blacklist JWT -->|
    |                       |                     |--- Revoke refresh   |
    |                       |<-- 200 OK ---------|                     |
    |                       |--- Clear storage    |                     |
    |<-- Login page --------|                     |                     |
```

## Schema de la base de donnees (ERD)

```
+-------------------+       +---------------------+       +--------------------+
| user              |       | permission_group    |       | permission         |
|-------------------|       |---------------------|       |--------------------|
| id (UUID) PK      |<---+  | id (UUID) PK        |<--+   | id (UUID) PK       |
| email (unique)    |    |  | name                |   |   | name (unique)      |
| password          |    |  | description         |   |   | description        |
| roles (JSON)      |    |  | created_at          |   |   | category           |
| first_name        |    |  +---------------------+   |   | created_at         |
| last_name         |    |                             |   +--------------------+
| is_verified       |    |  +---------------------+   |
| avatar_id FK -----+----+->| user_permission_group|   |   +--------------------+
| is_2fa_enabled    |    |  |---------------------|   +---| perm_group_perm    |
| totp_secret       |    |  | user_id FK          |       |--------------------|
| backup_codes JSON |    |  | permission_group_id |       | permission_group_id|
| last_login_at     |    |  +---------------------+       | permission_id FK   |
| created_at        |    |                                 +--------------------+
| updated_at        |    |
+-------------------+    |
         |               |
         |               |  +---------------------+
         |               +--| user_oauth_provider  |
         |                  |---------------------|
         |                  | id (UUID) PK        |
         |                  | user_id FK          |
         |                  | provider            |
         |                  | provider_id         |
         |                  | created_at          |
         |                  +---------------------+
         |
         |  +---------------------+       +--------------------+
         +--| refresh_token       |       | notification       |
         |  |---------------------|       |--------------------|
         |  | id (UUID) PK        |       | id (UUID) PK       |
         |  | user_id FK          |       | user_id FK ---------+
         |  | token (unique)      |       | title              |
         |  | expires_at          |       | message            |
         |  | created_at          |       | type               |
         |  | ip_address          |       | is_read            |
         |  | user_agent          |       | created_at         |
         |  | is_revoked          |       +--------------------+
         |  +---------------------+
         |
         |  +---------------------+       +--------------------+
         +--| audit_log           |       | media_object       |
            |---------------------|       |--------------------|
            | id (UUID) PK        |       | id (UUID) PK       |
            | user_id FK          |       | filename           |
            | action              |       | original_name      |
            | entity_type         |       | mime_type          |
            | entity_id           |       | size               |
            | details (JSON)      |       | created_at         |
            | ip_address          |       +--------------------+
            | created_at          |
            +---------------------+

+---------------------+
| messenger_messages  |
|---------------------|
| id PK               |
| body                |
| headers             |
| queue_name          |
| created_at          |
| available_at        |
| delivered_at        |
+---------------------+
```

## Stack de monitoring (optionnelle)

```
+-------------------+     +-------------------+     +-------------------+
| Node Exporter     |     | Postgres Exporter |     | Redis Exporter    |
| (metriques sys.)  |     | (metriques BDD)   |     | (metriques cache) |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                          |
         +------------+------------+--------------------------+
                      |
                      v
              +-------+--------+
              | Prometheus     |
              | (collecte)     |
              | - Scrape 15s   |
              | - Retention 30j|
              | - Alertes      |
              +-------+--------+
                      |
                      v
              +-------+--------+
              | Grafana        |
              | (visualisation)|
              | - Dashboard    |
              | - Alerting     |
              +----------------+
```
