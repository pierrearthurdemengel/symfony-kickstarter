# ADR-004 : API Platform vs FOSRestBundle

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

Le template necessite un framework API pour exposer les ressources Doctrine en REST. Les deux principaux choix dans l'ecosysteme Symfony sont API Platform et FOSRestBundle.

## Decision

API Platform 3.4 est retenu comme framework API.

## Raisons

1. **Productivite** : API Platform genere automatiquement les endpoints CRUD, la documentation OpenAPI/Swagger, la validation, la serialisation et la pagination a partir des attributs PHP sur les entites. Un CRUD complet se configure en quelques lignes.

2. **JSON-LD/Hydra** : le format par defaut JSON-LD avec Hydra fournit une API auto-descriptive et explorable. Les clients peuvent decouvrir les endpoints et les relations automatiquement.

3. **Filtres integres** : les filtres de recherche, tri, pagination et range sont disponibles nativement et se configurent par attribut.

4. **State processors** : les state processors permettent d'intercepter les operations CRUD pour ajouter de la logique metier (hachage de mot de passe, envoi d'email, etc.) sans controller.

5. **Serialization groups** : le controle fin de la serialisation via les groupes permet de definir facilement ce qui est expose en lecture vs ecriture, et par role.

6. **Ecosysteme** : API Platform inclut nativement le support Mercure (temps reel), GraphQL, la generation de clients, et l'admin panel.

7. **Communaute** : API Platform est le framework API le plus actif de l'ecosysteme Symfony avec une communaute large et une documentation exhaustive.

## Alternatives considerees

- **FOSRestBundle** : mature et eprouve, mais necessite beaucoup plus de code boilerplate (controllers, serialisation manuelle, documentation manuelle). En mode maintenance plutot qu'en developpement actif.
- **Symfony natif (sans framework)** : controle total mais productivite faible. Chaque endpoint, la documentation, les filtres, la pagination doivent etre implementes manuellement.

## Consequences

- Les entites API sont annotees avec les attributs `#[ApiResource]`.
- La documentation Swagger est disponible automatiquement sur `/api`.
- Les filtres et la pagination sont configures via attributs sur les entites.
- Les state processors gerent la logique metier des operations CRUD.
- Les groupes de serialisation controlent les champs exposes.
- Les controllers custom sont utilises uniquement pour les endpoints non-CRUD (healthcheck, OAuth, 2FA, etc.).
