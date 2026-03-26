import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Ui/Button';

describe('Button', () => {
  it('affiche le contenu passe en children', () => {
    render(<Button>Cliquer</Button>);
    expect(screen.getByRole('button', { name: 'Cliquer' })).toBeInTheDocument();
  });

  it('appelle onClick lors du clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('affiche le spinner en mode loading', () => {
    render(<Button isLoading>Chargement</Button>);

    const spinner = screen.getByTestId('button-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('est desactive en mode loading', () => {
    render(<Button isLoading>Chargement</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('est desactive quand disabled est true', () => {
    render(<Button disabled>Desactive</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('ne declenche pas onClick quand desactive', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Desactive
      </Button>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applique la variante primary par defaut', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-primary-600');
  });

  it('applique la variante danger', () => {
    render(<Button variant="danger">Supprimer</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-danger-600');
  });

  it('applique la taille lg', () => {
    render(<Button size="lg">Grand</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('px-6');
  });
});
