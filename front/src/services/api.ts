import type { ApiError } from '@/types';

// URL de base de l'API, configurable via variable d'environnement
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Cle de stockage du token JWT et du refresh token
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Verrou pour eviter les rafraichissements concurrents
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Recupere le token JWT depuis le localStorage
 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Sauvegarde le token JWT dans le localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Supprime le token JWT du localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Sauvegarde le refresh token
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * Recupere le refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Construit les headers de la requete avec injection automatique du JWT
 */
function buildHeaders(contentType?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': contentType || 'application/json',
    Accept: 'application/ld+json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Cree une erreur API a partir de la reponse HTTP
 */
async function createApiError(response: Response): Promise<ApiError> {
  let message = `Erreur HTTP ${response.status}`;

  try {
    const body = await response.json();
    if (body.message) {
      message = body.message;
    } else if (body['hydra:description']) {
      message = body['hydra:description'];
    } else if (body.detail) {
      message = body.detail;
    }
  } catch {
    // Le corps de la reponse n'est pas du JSON valide
  }

  return { message, status: response.status };
}

/**
 * Tente de rafraichir le token JWT via le refresh token.
 * Utilise un verrou pour eviter les appels concurrents.
 */
async function tryRefreshToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        removeToken();
        return null;
      }

      const data = (await response.json()) as { token: string; refresh_token: string };
      setToken(data.token);
      setRefreshToken(data.refresh_token);
      return data.token;
    } catch {
      removeToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Execute une requete HTTP avec retry automatique sur 401 (refresh token).
 * Backoff exponentiel sur les erreurs reseau.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  contentType?: string,
  retryCount = 0,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const options: RequestInit = {
    method,
    headers: buildHeaders(contentType),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    // Tentative de rafraichissement sur 401
    if (response.status === 401 && retryCount === 0 && !path.includes('/login')) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        return request<T>(method, path, body, contentType, 1);
      }
    }

    if (!response.ok) {
      const error = await createApiError(response);
      throw error;
    }

    // Gestion des reponses sans contenu (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // Retry avec backoff exponentiel sur erreur reseau (pas sur erreur API)
    if (error instanceof TypeError && error.message === 'Failed to fetch' && retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return request<T>(method, path, body, contentType, retryCount + 1);
    }
    throw error;
  }
}

// Methodes publiques du client API
export function get<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export function post<T>(path: string, body: unknown, contentType?: string): Promise<T> {
  return request<T>('POST', path, body, contentType);
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>('PUT', path, body);
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>('PATCH', path, body, 'application/merge-patch+json');
}

export function del<T>(path: string): Promise<T> {
  return request<T>('DELETE', path);
}
