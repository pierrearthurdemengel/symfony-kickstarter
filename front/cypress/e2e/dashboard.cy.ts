describe('Dashboard', () => {
  const timestamp = Date.now();
  const testEmail = `dashboard-${timestamp}@example.com`;
  const testPassword = 'Password123!';
  const testFirstName = 'Marie';
  const testLastName = 'Martin';

  before(() => {
    // Creation du compte de test via l'API
    cy.register(testEmail, testPassword, testFirstName, testLastName);
  });

  beforeEach(() => {
    // Connexion via la commande custom avant chaque test
    cy.login(testEmail, testPassword);
    cy.visit('/dashboard');
  });

  it('affiche les informations de l\'utilisateur', () => {
    // Verification du nom complet
    cy.contains(`${testFirstName} ${testLastName}`, { timeout: 10000 })
      .should('be.visible');

    // Verification de l'email
    cy.contains(testEmail).should('be.visible');

    // Verification que les roles sont affiches
    cy.contains('ROLE_USER').should('be.visible');
  });

  it('affiche le titre Dashboard', () => {
    cy.get('h1').contains('Dashboard').should('be.visible');
  });

  it('affiche les initiales de l\'utilisateur dans l\'avatar', () => {
    // Les initiales doivent etre MM (Marie Martin)
    const initials = `${testFirstName[0]}${testLastName[0]}`.toUpperCase();
    cy.contains(initials).should('be.visible');
  });

  it('affiche les champs du profil utilisateur', () => {
    // Verification des labels des champs
    cy.contains('Email').should('be.visible');
    cy.contains('Prenom').should('be.visible');
    cy.contains('Nom').should('be.visible');
    cy.contains('Roles').should('be.visible');
    cy.contains('Membre depuis').should('be.visible');
    cy.contains('Identifiant').should('be.visible');
  });

  it('permet de naviguer vers l\'accueil depuis le header', () => {
    cy.contains('a', 'Home').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('affiche le lien Dashboard dans la navigation', () => {
    cy.get('header').contains('a', 'Dashboard').should('be.visible');
  });
});
