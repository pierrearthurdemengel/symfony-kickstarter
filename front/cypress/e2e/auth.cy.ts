describe('Authentification', () => {
  // Identifiants uniques pour eviter les conflits entre les tests
  const timestamp = Date.now();
  const testEmail = `test-${timestamp}@example.com`;
  const testPassword = 'Password123!';
  const testFirstName = 'Jean';
  const testLastName = 'Dupont';

  beforeEach(() => {
    // Nettoyage du localStorage avant chaque test
    cy.clearLocalStorage();
  });

  it('affiche la page d\'accueil', () => {
    cy.visit('/');
    cy.contains('Symfony Kickstarter').should('be.visible');
  });

  it('navigue vers la page d\'inscription', () => {
    cy.visit('/');
    cy.contains('a', 'Register').click();
    cy.url().should('include', '/register');
    cy.contains('Inscription').should('be.visible');
  });

  it('inscrit un nouvel utilisateur et redirige vers le dashboard', () => {
    cy.visit('/register');

    // Remplissage du formulaire d'inscription
    cy.get('input[name="firstName"]').type(testFirstName);
    cy.get('input[name="lastName"]').type(testLastName);
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(testPassword);

    // Soumission du formulaire
    cy.contains('button', 'Creer mon compte').click();

    // Verification de la redirection vers le dashboard
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    cy.contains('Dashboard').should('be.visible');
  });

  it('se deconnecte correctement', () => {
    // Connexion prealable via l'API
    cy.register(testEmail, testPassword, testFirstName, testLastName).then(() => {
      cy.login(testEmail, testPassword);
    });
    cy.visit('/dashboard');

    // Verification que l'utilisateur est connecte
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');

    // Deconnexion via le bouton Logout
    cy.contains('Logout').click();

    // Verification de la redirection vers l'accueil
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('se connecte avec les identifiants existants', () => {
    cy.visit('/login');

    // Remplissage du formulaire de connexion
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(testPassword);

    // Soumission du formulaire
    cy.contains('button', 'Se connecter').click();

    // Verification de la redirection vers le dashboard
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    cy.contains('Dashboard').should('be.visible');
  });

  it('redirige les routes protegees vers login si non authentifie', () => {
    cy.visit('/dashboard');

    // Verification que l'utilisateur est redirige
    cy.url().should('not.include', '/dashboard');
  });

  it('affiche une erreur avec des identifiants invalides', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('invalide@example.com');
    cy.get('input[name="password"]').type('mauvais_mot_de_passe');
    cy.contains('button', 'Se connecter').click();

    // Verification qu'un message d'erreur est affiche
    cy.get('[role="alert"], .text-danger-600, .bg-danger-50')
      .should('be.visible', { timeout: 10000 });
  });

  it('navigue entre login et register via les liens', () => {
    cy.visit('/login');
    cy.contains('a', 'Creer un compte').click();
    cy.url().should('include', '/register');

    cy.contains('a', 'Se connecter').click();
    cy.url().should('include', '/login');
  });
});
