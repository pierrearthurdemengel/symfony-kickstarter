import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from '@/components/Ui/Modal';

describe('Modal', () => {
  // Test d'ouverture du modal
  it('affiche le contenu quand isOpen est true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Contenu du modal</p>
      </Modal>,
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Contenu du modal')).toBeInTheDocument();
  });

  // Test de fermeture du modal
  it('ne rend rien quand isOpen est false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Contenu du modal</p>
      </Modal>,
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  // Test de fermeture avec le bouton X
  it('appelle onClose au clic sur le bouton fermer', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Contenu</p>
      </Modal>,
    );

    const closeButton = screen.getByLabelText('Fermer');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Test de fermeture avec la touche Escape
  it('appelle onClose quand Escape est presse', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Contenu</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Test de fermeture au clic sur l'overlay
  it('appelle onClose au clic sur l overlay', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Contenu</p>
      </Modal>,
    );

    // L'overlay est l'element avec role="dialog"
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
