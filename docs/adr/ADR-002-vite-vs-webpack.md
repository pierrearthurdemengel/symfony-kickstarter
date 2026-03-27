# ADR-002 : Vite vs Webpack

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

Le frontend React necessite un bundler pour le developpement (HMR) et la production (optimisation, tree-shaking, code splitting). Les deux principaux choix sont Vite et Webpack (via Webpack Encore de Symfony).

## Decision

Vite 5 est retenu comme bundler frontend.

## Raisons

1. **Vitesse de developpement** : Vite demarre en moins d'une seconde grace aux ES modules natifs, contre 10-30 secondes pour Webpack sur un projet de cette taille.

2. **HMR instantane** : Le Hot Module Replacement de Vite est quasi-instantane, independamment de la taille du projet. Webpack ralentit proportionnellement au nombre de modules.

3. **Configuration minimale** : Vite fonctionne avec une configuration tres legere (< 20 lignes). Webpack Encore necessite une configuration plus verbeuse et plus de plugins.

4. **Build production** : Vite utilise Rollup en production, qui produit des bundles plus petits grace a un meilleur tree-shaking. Le template genere 32 chunks lazy-loaded.

5. **Ecosysteme React** : Vite est devenu le standard de facto pour les projets React (recommande par la doc officielle React depuis 2023).

6. **TypeScript natif** : Vite supporte TypeScript nativement sans plugin supplementaire.

## Alternatives considerees

- **Webpack Encore** : integration Symfony native, mais significativement plus lent et plus complexe a configurer.
- **Turbopack** : prometteur mais encore en beta et couple a Next.js.
- **esbuild** : extremement rapide mais ne gere pas nativement le code splitting avance et le CSS.

## Consequences

- Le frontend est un projet Node autonome dans `front/` avec son propre `package.json`.
- Le dev server Vite tourne dans un container Docker separe (port 3010).
- Nginx proxifie les requetes frontend en developpement vers le dev server Vite.
- En production, Vite genere des fichiers statiques dans `front/dist/` qui sont servis directement par Nginx.
- Les assets Symfony (Twig) ne sont pas utilises pour le frontend principal.
