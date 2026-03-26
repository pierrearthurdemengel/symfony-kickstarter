// Fichier de support Cypress - charge avant chaque fichier de spec

import './commands';

// Desactiver les uncaught exceptions pour eviter les echecs de test
// lies a des erreurs non gerees par l'application
Cypress.on('uncaught:exception', () => {
  return false;
});
