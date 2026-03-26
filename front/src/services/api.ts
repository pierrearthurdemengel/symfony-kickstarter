import type { ApiError } from '@/types';

// URL de base de l'API, configurable via variable d'environnement
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Cle de stockage du token JWT
const TOKEN_KEY = 'auth_token';

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
 * Execute une requete HTTP et retourne la reponse typee
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  contentType?: string,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const options: RequestInit = {
    method,
    headers: buildHeaders(contentType),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await createApiError(response);
    throw error;
  }

  // Gestion des reponses sans contenu (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
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
