import { defineConfig } from 'cypress';

export default defineConfig({
  // Configuration de la fenetre de test
  viewportWidth: 1280,
  viewportHeight: 720,

  // Desactiver l'enregistrement video pour accelerer les tests
  video: false,

  // Capture d'ecran uniquement en cas d'echec
  screenshotOnRunFailure: true,

  e2e: {
    baseUrl: 'http://localhost',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
  },
});
