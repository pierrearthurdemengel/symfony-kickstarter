import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronisation quand la valeur externe change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Appel debounce du callback parent
  const debouncedChange = useCallback(
    (newValue: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // Nettoyage du timer au demontage
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="relative">
      {/* Icone loupe */}
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400 dark:text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-secondary-300 py-2 pl-10 pr-10 text-sm text-secondary-900 placeholder-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-800"
        data-testid="search-input"
      />

      {/* Bouton clear */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-secondary-400 hover:text-secondary-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Effacer la recherche"
          data-testid="search-clear"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
