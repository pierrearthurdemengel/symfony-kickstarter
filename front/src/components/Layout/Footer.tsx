export default function Footer() {
  // Annee courante pour le copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-secondary-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
          <p className="text-sm text-secondary-500 dark:text-gray-400">
            Symfony Kickstarter - MIT License &copy; {currentYear}
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-secondary-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
