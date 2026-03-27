# ADR-007 : Redis vs Memcached

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

Le template utilise un systeme de cache et de stockage cle-valeur pour plusieurs fonctionnalites : cache applicatif, sessions, blacklist JWT, feature flags, rate limiting, et transport Messenger (optionnel).

## Decision

Redis 7 est retenu comme cache et store cle-valeur.

## Raisons

1. **Structures de donnees riches** : Redis supporte les strings, listes, sets, hashes, sorted sets, et streams. Memcached ne supporte que des paires cle-valeur simples. Les feature flags, la blacklist JWT et le rate limiting beneficient des structures avancees de Redis.

2. **TTL par cle** : Redis permet de definir un TTL individuel par cle (`SETEX`), essentiel pour la blacklist JWT ou chaque token a un TTL egal a sa duree de vie restante.

3. **Persistance optionnelle** : Redis peut persister les donnees sur disque (RDB/AOF), ce qui est utile pour les feature flags et les sessions qui doivent survivre a un redemarrage.

4. **Pub/Sub** : Redis supporte le pattern pub/sub, utilisable pour la communication inter-processus ou les notifications temps reel.

5. **Adapter Symfony** : le `RedisAdapter` de Symfony est mature et supporte nativement le tagging, les pools multiples et la serialisation.

6. **Multi-usage** : Redis sert a la fois de cache, de store pour la blacklist JWT, de backend pour les feature flags, et de limiteur de debit (rate limiting). Un seul service pour plusieurs usages simplifie l'infrastructure.

7. **Monitoring** : `redis-exporter` pour Prometheus est bien maintenu et fournit des metriques detaillees.

## Alternatives considerees

- **Memcached** : plus rapide pour le cache pur (cle-valeur simple), mais ne supporte pas les TTL par cle, les structures de donnees avancees, ni la persistance. Trop limite pour les usages non-cache du template.
- **APCu** : cache PHP local, rapide mais non partage entre les processus PHP-FPM et non accessible depuis d'autres services.

## Consequences

- Un container `redis:7-alpine` est inclus dans tous les environnements (dev, prod, monitoring).
- Le cache Symfony utilise le pool Redis par defaut.
- La blacklist JWT utilise une connexion Redis directe (`\Redis`).
- Les feature flags sont stockes dans Redis.
- Le rate limiting Symfony utilise Redis comme backend.
- Les utilisateurs peuvent configurer Redis Sentinel ou Redis Cluster pour la haute disponibilite en production.
