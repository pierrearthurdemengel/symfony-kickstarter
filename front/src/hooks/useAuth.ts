import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createElement } from 'react';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';
import { get, post, setToken, removeToken } from '@/services/api';

// Interface du contexte d'authentification
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

// Contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cle de stockage du token
const TOKEN_KEY = 'auth_token';

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider d'authentification qui encapsule l'application
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Charge le profil utilisateur depuis l'API
  const loadUser = useCallback(async () => {
    try {
      const userData = await get<User>('/me');
      setUser(userData);
    } catch {
      // Token invalide ou expire, on nettoie
      setTokenState(null);
      setUser(null);
      removeToken();
    }
  }, []);

  // Verification du token au montage du composant
  useEffect(() => {
    if (token) {
      loadUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, loadUser]);

  // Connexion avec email et mot de passe
  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await post<AuthResponse>('/login', credentials);
    setToken(response.token);
    setTokenState(response.token);

    const userData = await get<User>('/me');
    setUser(userData);
  }, []);

  // Inscription d'un nouvel utilisateur
  const register = useCallback(async (data: RegisterData) => {
    await post<User>('/register', data);

    // Connexion automatique apres inscription
    const response = await post<AuthResponse>('/login', {
      email: data.email,
      password: data.password,
    });
    setToken(response.token);
    setTokenState(response.token);

    const userData = await get<User>('/me');
    setUser(userData);
  }, []);

  // Deconnexion
  const logout = useCallback(() => {
    setUser(null);
    setTokenState(null);
    removeToken();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

/**
 * Hook pour acceder au contexte d'authentification
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit etre utilise dans un AuthProvider');
  }
  return context;
}
