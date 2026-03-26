describe('Page d\'accueil', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('affiche le titre principal', () => {
    cy.get('h1').contains('Symfony Kickstarter').should('be.visible');
  });

  it('affiche la description du projet', () => {
    cy.contains('Template de demarrage rapide').should('be.visible');
  });

  it('affiche les fonctionnalites principales', () => {
    cy.contains('API Platform').should('be.visible');
    cy.contains('JWT Authentication').should('be.visible');
    cy.contains('React + TypeScript').should('be.visible');
    cy.contains('Docker').should('be.visible');
  });

  it('affiche la section fonctionnalites avec le bon titre', () => {
    cy.contains('Tout inclus').should('be.visible');
  });

  it('contient les liens de navigation dans le header', () => {
    cy.get('header').within(() => {
      cy.contains('a', 'Home').should('be.visible');
      cy.contains('a', 'Login').should('be.visible');
      cy.contains('a', 'Register').should('be.visible');
    });
  });

  it('navigue vers la page de connexion via le header', () => {
    cy.get('header').contains('a', 'Login').click();
    cy.url().should('include', '/login');
  });

  it('navigue vers la page d\'inscription via le header', () => {
    cy.get('header').contains('a', 'Register').click();
    cy.url().should('include', '/register');
  });

  it('redirige le CTA "Commencer" vers la page d\'inscription', () => {
    cy.contains('a', 'Commencer').click();
    cy.url().should('include', '/register');
  });

  it('affiche le CTA "Se connecter" sur la page d\'accueil', () => {
    cy.contains('a', 'Se connecter').should('be.visible');
    cy.contains('a', 'Se connecter').click();
    cy.url().should('include', '/login');
  });

  it('affiche le logo Symfony Kickstarter dans le header', () => {
    cy.get('header').contains('Symfony Kickstarter').should('be.visible');
  });
});
