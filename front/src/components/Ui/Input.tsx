import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

/**
 * Champ de saisie avec label et gestion des erreurs
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="mb-1 block text-sm font-medium text-secondary-700">
          {label}
          {props.required && <span className="ml-1 text-danger-500">*</span>}
        </label>
        <input
          ref={ref}
          id={name}
          name={name}
          className={`
            w-full rounded-lg border px-3 py-2 text-secondary-900
            placeholder-secondary-400
            transition-colors duration-200
            focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200' : 'border-secondary-300'}
            ${className}
          `.trim()}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
