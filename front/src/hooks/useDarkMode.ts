import { createContext, useContext, useState, useEffect, useCallback, createElement } from 'react';
import type { ReactNode } from 'react';

// Modes disponibles
type ThemeMode = 'light' | 'dark' | 'system';

// Interface du contexte dark mode
interface DarkModeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

// Contexte du dark mode
const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

// Cle de stockage dans le localStorage
const STORAGE_KEY = 'theme_mode';

// Props du provider
interface DarkModeProviderProps {
  children: ReactNode;
}

// Determine si le systeme prefere le mode sombre
function getSystemPreference(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Applique ou retire la classe dark sur le document
function applyDarkClass(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function DarkModeProvider({ children }: DarkModeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (mode === 'system') return getSystemPreference();
    return mode === 'dark';
  });

  // Mise a jour du mode avec persistance
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  // Recalcul du isDark quand le mode change
  useEffect(() => {
    if (mode === 'system') {
      setIsDark(getSystemPreference());
    } else {
      setIsDark(mode === 'dark');
    }
  }, [mode]);

  // Ecoute les changements de preference systeme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  // Applique la classe dark sur le document
  useEffect(() => {
    applyDarkClass(isDark);
  }, [isDark]);

  const value: DarkModeContextType = { mode, isDark, setMode };

  return createElement(DarkModeContext.Provider, { value }, children);
}

export function useDarkMode(): DarkModeContextType {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode doit etre utilise dans un DarkModeProvider');
  }
  return context;
}
