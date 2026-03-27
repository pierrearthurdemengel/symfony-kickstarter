import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

// Item du menu deroulant
interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
}

export default function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic exterieur
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  // Fermeture avec Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Declencheur */}
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
        {trigger}
      </button>

      {/* Menu deroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className={`
                flex w-full items-center px-4 py-2 text-left text-sm transition-colors
                ${
                  item.danger
                    ? 'text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20'
                    : 'text-secondary-700 hover:bg-secondary-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              `.trim()}
            >
              {item.icon && <span className="mr-2 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
