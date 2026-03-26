import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, className = '', ...props }, ref) => {
    return (
      <div className="mb-4">
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-secondary-700 dark:text-gray-300"
        >
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
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
            dark:focus:border-primary-500 dark:focus:ring-primary-800
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-200 dark:border-danger-500' : 'border-secondary-300'}
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
