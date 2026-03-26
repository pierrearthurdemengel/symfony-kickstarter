// Types d'alerte disponibles
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

// Styles selon le type d'alerte
const alertStyles: Record<AlertType, string> = {
  success: 'bg-success-50 border-success-500 text-success-800',
  error: 'bg-danger-50 border-danger-500 text-danger-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  info: 'bg-primary-50 border-primary-500 text-primary-800',
};

// Icones SVG selon le type d'alerte
const alertIcons: Record<AlertType, string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export default function Alert({ type, message, onClose }: AlertProps) {
  return (
    <div
      className={`flex items-center rounded-lg border-l-4 p-4 ${alertStyles[type]}`}
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
        <path strokeLinecap="round" strokeLinejoin="round" d={alertIcons[type]} />
      </svg>
      <span className="flex-1 text-sm">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
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
      )}
    </div>
  );
}
