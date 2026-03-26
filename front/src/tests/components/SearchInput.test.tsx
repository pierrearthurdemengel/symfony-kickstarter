import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchInput from '@/components/Ui/SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche le champ de recherche', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('affiche le placeholder personnalise', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Chercher ici..." />);
    expect(screen.getByPlaceholderText('Chercher ici...')).toBeInTheDocument();
  });

  it('affiche la valeur initiale', () => {
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);
    const input = screen.getByTestId('search-input') as HTMLInputElement;
    expect(input.value).toBe('test');
  });

  it('appelle onChange apres le debounce', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={300} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'recherche' } });

    // Le callback ne doit pas etre appele immediatement
    expect(onChange).not.toHaveBeenCalled();

    // Avancer le temps du debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('recherche');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('affiche le bouton clear quand il y a du texte', () => {
    const onChange = vi.fn();
    render(<SearchInput value="texte" onChange={onChange} />);
    expect(screen.getByTestId('search-clear')).toBeInTheDocument();
  });

  it('masque le bouton clear quand le champ est vide', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    expect(screen.queryByTestId('search-clear')).not.toBeInTheDocument();
  });

  it('vide le champ au clic sur clear', () => {
    const onChange = vi.fn();
    render(<SearchInput value="texte" onChange={onChange} />);

    fireEvent.click(screen.getByTestId('search-clear'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
