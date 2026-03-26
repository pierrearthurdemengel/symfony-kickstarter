// Types pour l'entite User
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
}

// Types pour les reponses API Platform (Hydra)
export interface HydraCollection<T> {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:totalItems': number;
  'hydra:member': T[];
}

// Types pour les erreurs API
export interface ApiError {
  message: string;
  status: number;
}
