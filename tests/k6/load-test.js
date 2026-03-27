/**
 * Script de test de charge k6 pour les endpoints critiques.
 * Utilisation : k6 run tests/k6/load-test.js
 * Documentation : https://k6.io/docs/
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Metriques personnalisees
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');

// Configuration du test
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Montee en charge progressive
    { duration: '1m', target: 50 }, // Charge soutenue
    { duration: '30s', target: 100 }, // Pic de charge
    { duration: '30s', target: 0 }, // Descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requetes sous 500ms
    http_req_failed: ['rate<0.05'], // Moins de 5% d'echecs
    errors: ['rate<0.1'], // Moins de 10% d'erreurs applicatives
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';

/**
 * Scenario principal : flux utilisateur complet.
 */
export default function () {
  // Healthcheck
  const healthRes = http.get(`${BASE_URL}/healthcheck`);
  check(healthRes, {
    'healthcheck status 200': (r) => r.status === 200,
    'healthcheck ok': (r) => JSON.parse(r.body).status === 'ok',
  });

  // Inscription
  const email = `k6_user_${__VU}_${__ITER}@test.dev`;
  const registerRes = http.post(
    `${BASE_URL}/register`,
    JSON.stringify({
      email: email,
      password: 'TestPassword123!',
      firstName: 'K6',
      lastName: 'Test',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const registered = check(registerRes, {
    'register status 201': (r) => r.status === 201,
  });
  errorRate.add(!registered);

  // Connexion
  const loginStart = Date.now();
  const loginRes = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({
      email: email,
      password: 'TestPassword123!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  loginDuration.add(Date.now() - loginStart);

  const loggedIn = check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login returns token': (r) => JSON.parse(r.body).token !== undefined,
  });
  errorRate.add(!loggedIn);

  if (!loggedIn) {
    sleep(1);
    return;
  }

  const token = JSON.parse(loginRes.body).token;
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/ld+json',
  };

  // Acces au profil
  const meRes = http.get(`${BASE_URL}/me`, { headers: authHeaders });
  check(meRes, {
    'me status 200': (r) => r.status === 200,
  });

  // Liste des utilisateurs (endpoint pagine)
  const usersRes = http.get(`${BASE_URL}/users?itemsPerPage=10`, {
    headers: authHeaders,
  });
  check(usersRes, {
    'users status 200': (r) => r.status === 200,
  });

  sleep(1);
}
