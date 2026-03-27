# ADR-005 : Tailwind CSS vs Bootstrap/Material

**Date** : 2026-03-27
**Statut** : Accepte

## Contexte

Le template inclut un frontend React complet avec une interface admin, des formulaires, des composants UI et un theme dark mode. Le choix du framework CSS impacte la maintenabilite, la personnalisation et la taille du bundle.

## Decision

Tailwind CSS 3 est retenu comme framework CSS.

## Raisons

1. **Utility-first** : l'approche utility-first de Tailwind permet de construire des interfaces sans ecrire de CSS custom. Chaque classe correspond a une propriete CSS, ce qui rend le code previsible et facile a modifier.

2. **Personnalisation** : `tailwind.config.js` permet de definir un design system complet (couleurs, espacements, typographie, breakpoints) en un seul fichier. Les composants Bootstrap necessitent des surcharges CSS complexes pour s'en ecarter.

3. **Dark mode natif** : Tailwind supporte nativement le dark mode avec le prefixe `dark:`, ce qui est utilise par le template pour le theme clair/sombre/systeme.

4. **Bundle size** : Tailwind purge automatiquement les classes CSS inutilisees en production. Le CSS final pese quelques Ko, contre 150+ Ko pour Bootstrap complet.

5. **Composants React** : les composants React du template (Button, Input, Modal, DataTable, etc.) encapsulent les classes Tailwind. Les utilisateurs interagissent avec des props propres, pas directement avec les classes CSS.

6. **Pas de JS impose** : Tailwind est du CSS pur, sans JavaScript. Les interactions (modales, dropdowns) sont gerees par React, ce qui evite les conflits avec jQuery/Popper (Bootstrap) ou les runtime frameworks (Material UI).

7. **Ecosysteme** : Headless UI, Radix UI, et d'autres libraries de composants accessibles sont conques pour fonctionner avec Tailwind.

## Alternatives considerees

- **Bootstrap 5** : tres populaire et rapide a demarrer, mais difficile a personnaliser au-dela du theme par defaut. Le JavaScript inclus (jQuery legacy, Popper) entre en conflit avec React.
- **Material UI (MUI)** : riche en composants prets a l'emploi, mais impose un style Material Design fortement opinionne. Le bundle est significativement plus lourd (300+ Ko JS). La personnalisation du theme est complexe.
- **CSS Modules** : flexibilite maximale mais pas de design system partage. Chaque composant necessite son propre fichier CSS.
- **Styled Components** : CSS-in-JS populaire, mais ajoute un runtime JavaScript et complexifie le SSR.

## Consequences

- `tailwind.config.js` definit le design system du template.
- Les composants React utilisent des classes Tailwind via des props (`variant`, `size`, etc.).
- Le dark mode est gere par une classe `dark` sur le `<html>` et les prefixes `dark:` Tailwind.
- Le CSS en production est purge automatiquement par PostCSS.
- Les utilisateurs peuvent personnaliser le design system en modifiant `tailwind.config.js`.
