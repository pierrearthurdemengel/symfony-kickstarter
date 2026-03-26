import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '@/components/Ui/Badge';

describe('Badge', () => {
  it('affiche le contenu passe en children', () => {
    render(<Badge>ADMIN</Badge>);
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('applique la variante primary par defaut', () => {
    render(<Badge>Label</Badge>);
    const badge = screen.getByText('Label');
    expect(badge.className).toContain('bg-primary-100');
    expect(badge.className).toContain('text-primary-700');
  });

  it('applique la variante success', () => {
    render(<Badge variant="success">Actif</Badge>);
    const badge = screen.getByText('Actif');
    expect(badge.className).toContain('bg-success-100');
    expect(badge.className).toContain('text-success-700');
  });

  it('applique la variante danger', () => {
    render(<Badge variant="danger">Erreur</Badge>);
    const badge = screen.getByText('Erreur');
    expect(badge.className).toContain('bg-danger-100');
    expect(badge.className).toContain('text-danger-700');
  });

  it('applique la variante warning', () => {
    render(<Badge variant="warning">Attention</Badge>);
    const badge = screen.getByText('Attention');
    expect(badge.className).toContain('bg-amber-100');
    expect(badge.className).toContain('text-amber-700');
  });

  it('applique la variante secondary', () => {
    render(<Badge variant="secondary">Inactif</Badge>);
    const badge = screen.getByText('Inactif');
    expect(badge.className).toContain('bg-secondary-100');
    expect(badge.className).toContain('text-secondary-700');
  });

  it('applique la variante info', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge.className).toContain('bg-sky-100');
    expect(badge.className).toContain('text-sky-700');
  });

  it('est rendu comme un span', () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge.tagName).toBe('SPAN');
  });
});
