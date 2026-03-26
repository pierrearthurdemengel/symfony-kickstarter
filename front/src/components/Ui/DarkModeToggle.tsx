import { useDarkMode } from '@/hooks/useDarkMode';

// Icone soleil (mode light)
function SunIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

// Icone lune (mode dark)
function MoonIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

// Icone auto (mode systeme)
function SystemIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function DarkModeToggle() {
  const { mode, setMode } = useDarkMode();

  // Cycle entre les modes : light -> dark -> system -> light
  const toggleMode = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  // Label accessible selon le mode actif
  const labelMap = {
    light: 'Mode clair actif',
    dark: 'Mode sombre actif',
    system: 'Mode systeme actif',
  };

  return (
    <button
      onClick={toggleMode}
      className="rounded-md p-2 text-secondary-600 transition-colors hover:bg-secondary-100 hover:text-primary-600 dark:text-secondary-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
      aria-label={labelMap[mode]}
      title={labelMap[mode]}
    >
      {mode === 'light' && <SunIcon />}
      {mode === 'dark' && <MoonIcon />}
      {mode === 'system' && <SystemIcon />}
    </button>
  );
}
