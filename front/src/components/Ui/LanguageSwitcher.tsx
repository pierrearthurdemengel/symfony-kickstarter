import { useTranslation } from 'react-i18next';

// Langues supportees avec leur drapeau et label
const LANGUAGES = [
  { code: 'fr', label: 'FR', flag: 'FR' },
  { code: 'en', label: 'EN', flag: 'EN' },
] as const;

/**
 * Bouton de bascule entre les langues disponibles.
 * Stocke la preference dans localStorage via i18next-browser-languagedetector.
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Bascule a la langue suivante dans la liste
  const toggleLanguage = () => {
    const currentIndex = LANGUAGES.findIndex((l) => l.code === i18n.language);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    i18n.changeLanguage(LANGUAGES[nextIndex].code);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <button
      onClick={toggleLanguage}
      className="rounded-full px-2 py-1 text-xs font-semibold text-secondary-600 hover:bg-secondary-100 dark:text-gray-300 dark:hover:bg-gray-700"
      aria-label={`Langue: ${currentLang.label}`}
      title={`Langue: ${currentLang.label}`}
    >
      {currentLang.flag}
    </button>
  );
}
