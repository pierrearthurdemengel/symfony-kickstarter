// Configuration Sentry frontend (desactive par defaut)
// Pour activer :
// 1. npm install @sentry/react
// 2. Definir VITE_SENTRY_DSN dans .env
// 3. Decommenter le code ci-dessous et l'importer dans main.tsx
//
// import * as Sentry from '@sentry/react';
//
// export function initSentry(): void {
//   if (import.meta.env.VITE_SENTRY_DSN) {
//     Sentry.init({
//       dsn: import.meta.env.VITE_SENTRY_DSN,
//       environment: import.meta.env.MODE,
//       tracesSampleRate: 0.2,
//     });
//   }
// }
