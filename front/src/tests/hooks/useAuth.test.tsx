import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';

// Composant utilitaire pour tester le hook
function AuthConsumer() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div data-testid="loading">Chargement...</div>;
  }

  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
    </div>
  );
}

// Wrapper avec les providers necessaires
function renderWithProviders() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </BrowserRouter>,
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('etat initial : non authentifie, pas de user', async () => {
    renderWithProviders();

    // Attendre que le loading se termine
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('affiche le loading pendant la verification du token', () => {
    // Simuler un token existant pour declencher le chargement
    localStorage.setItem('auth_token', 'fake-token');

    // Mock fetch pour qu'il ne resolve pas immediatement
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('nettoie le state apres un token invalide', async () => {
    localStorage.setItem('auth_token', 'invalid-token');

    // Mock fetch pour retourner une erreur 401
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Token invalide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderWithProviders();

    // Attendre la resolution
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('lance une erreur si utilise en dehors du provider', () => {
    // Supprimer les erreurs console attendues
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadConsumer() {
      useAuth();
      return null;
    }

    expect(() => {
      render(
        <BrowserRouter>
          <BadConsumer />
        </BrowserRouter>,
      );
    }).toThrow('useAuth doit etre utilise dans un AuthProvider');

    consoleSpy.mockRestore();
  });
});
