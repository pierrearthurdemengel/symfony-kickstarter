import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import type { ToastMessage } from '@/types';

// Couleurs selon le type de toast
const typeStyles: Record<ToastMessage['type'], string> = {
  success:
    'bg-success-50 border-success-500 text-success-800 dark:bg-success-900/30 dark:border-success-600 dark:text-success-300',
  error:
    'bg-danger-50 border-danger-500 text-danger-800 dark:bg-danger-900/30 dark:border-danger-600 dark:text-danger-300',
  warning:
    'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-300',
  info: 'bg-primary-50 border-primary-500 text-primary-800 dark:bg-primary-900/30 dark:border-primary-600 dark:text-primary-300',
};

// Icones selon le type de toast
const typeIcons: Record<ToastMessage['type'], string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

// Composant individuel pour un toast avec animation
function ToastItem({ id, type, message }: ToastMessage) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  // Animation d'entree
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Animation de sortie avant suppression
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(id), 300);
  };

  return (
    <div
      className={`
        flex items-center border-l-4 rounded-lg p-4 shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${typeStyles[type]}
      `.trim()}
      role="alert"
    >
      <svg
        className="mr-3 h-5 w-5 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[type]} />
      </svg>
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={handleClose}
        className="ml-3 inline-flex flex-shrink-0 rounded-lg p-1 hover:opacity-70 focus:outline-none"
        aria-label="Fermer"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} type={toast.type} message={toast.message} />
      ))}
    </div>
  );
}
