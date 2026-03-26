import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/Ui/ToastContainer';

// Composant utilitaire pour tester le hook useToast
function ToastTrigger() {
  const { addToast } = useToast();

  return (
    <div>
      <button onClick={() => addToast('success', 'Operation reussie')}>
        Ajouter succes
      </button>
      <button onClick={() => addToast('error', 'Une erreur est survenue')}>
        Ajouter erreur
      </button>
    </div>
  );
}

// Wrapper pour fournir le contexte Toast
function TestWrapper() {
  return (
    <ToastProvider>
      <ToastContainer />
      <ToastTrigger />
    </ToastProvider>
  );
}

describe('Toast', () => {
  // Test d'ajout d'un toast
  it('affiche un toast apres ajout', () => {
    render(<TestWrapper />);

    act(() => {
      fireEvent.click(screen.getByText('Ajouter succes'));
    });

    expect(screen.getByText('Operation reussie')).toBeInTheDocument();
  });

  // Test d'ajout de plusieurs toasts
  it('affiche plusieurs toasts', () => {
    render(<TestWrapper />);

    act(() => {
      fireEvent.click(screen.getByText('Ajouter succes'));
      fireEvent.click(screen.getByText('Ajouter erreur'));
    });

    expect(screen.getByText('Operation reussie')).toBeInTheDocument();
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
  });

  // Test de suppression d'un toast via le bouton fermer
  it('supprime un toast au clic sur fermer', async () => {
    vi.useFakeTimers();

    render(<TestWrapper />);

    act(() => {
      fireEvent.click(screen.getByText('Ajouter succes'));
    });

    expect(screen.getByText('Operation reussie')).toBeInTheDocument();

    const closeButtons = screen.getAllByLabelText('Fermer');
    act(() => {
      fireEvent.click(closeButtons[0]);
    });

    // Attente de l'animation de sortie
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText('Operation reussie')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
