/**
 * Indicateur de chargement pour les routes chargees en lazy loading.
 * Affiche un spinner centre avec un message accessible.
 */
export default function LoadingSpinner() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Chargement en cours"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Chargement...</span>
      </div>
    </div>
  );
}
