# ADR-003 : JWT vs Sessions

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

L'authentification est un composant critique du template. Le choix entre JWT (JSON Web Tokens) stateless et sessions serveur-side impacte l'architecture, la scalabilite et la securite.

## Decision

JWT via LexikJWTAuthenticationBundle est retenu comme mecanisme d'authentification principal, avec refresh token rotation en base de donnees.

## Raisons

1. **Stateless** : les JWT permettent une API stateless, essentielle pour le scaling horizontal. Chaque requete porte son propre contexte d'authentification sans necesiter de stockage session cote serveur.

2. **Decouplage frontend/backend** : le frontend React et le backend Symfony sont des applications separees. Les JWT sont mieux adaptes a cette architecture SPA + API que les cookies de session qui necessitent le meme domaine.

3. **Multi-clients** : les JWT fonctionnent naturellement avec les applications mobiles, les CLI, et les integrations tierces sans adaptations supplementaires.

4. **API Platform** : API Platform est optimise pour les APIs stateless et supporte nativement les JWT.

5. **Microservices** : si le projet evolue vers une architecture microservices, les JWT peuvent etre valides par n'importe quel service sans partage d'etat.

## Mesures de securite

Pour compenser les risques inherents aux JWT :

- **Duree de vie courte** : access token de 1 heure (configurable).
- **Refresh token rotation** : chaque rafraichissement invalide l'ancien token et en cree un nouveau.
- **Blacklist Redis** : les access tokens revoques sont stockes dans Redis avec un TTL egal a leur duree de vie restante.
- **Cookie httpOnly** : option activable via `JWT_COOKIE_ENABLED` pour proteger contre le XSS.
- **Limitation sessions** : maximum 5 sessions actives par utilisateur.

## Alternatives considerees

- **Sessions PHP + Redis** : plus simple, mais necessite un sticky session ou un store de sessions partage, et n'est pas adapte au pattern SPA + API.
- **Paseto** : alternative aux JWT plus securisee par design, mais ecosysteme et support Symfony trop limites.
- **OAuth2 complet (authorization server)** : trop complexe pour un template. Le template inclut un OAuth client (Google/GitHub) mais pas un authorization server.

## Consequences

- LexikJWTAuthenticationBundle est installe et configure.
- Les cles RSA sont generees via `make jwt-generate`.
- Le firewall Symfony est configure en mode `stateless: true`.
- Le frontend stocke le token en localStorage (ou cookie httpOnly si active).
- Le refresh token est stocke en base de donnees avec des metadonnees (IP, User-Agent).
- Redis est requis pour la blacklist des tokens revoques.
