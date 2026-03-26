// Declarations TypeScript pour les commandes custom Cypress
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Connexion via l'API et stockage du token JWT
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Inscription d'un nouvel utilisateur via l'API
       */
      register(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
      ): Chainable<void>;
    }
  }
}

// Commande de connexion - envoie les credentials a l'API et stocke le token
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: { email, password },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/ld+json',
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const { token } = response.body;
    window.localStorage.setItem('auth_token', token);
  });
});

// Commande d'inscription - cree un nouveau compte via l'API
Cypress.Commands.add(
  'register',
  (email: string, password: string, firstName: string, lastName: string) => {
    cy.request({
      method: 'POST',
      url: '/api/register',
      body: { email, password, firstName, lastName },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/ld+json',
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
    });
  },
);

export {};
