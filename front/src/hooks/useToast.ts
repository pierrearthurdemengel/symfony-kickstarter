import { createContext, useContext, useState, useCallback, useRef, createElement } from 'react';
import type { ReactNode } from 'react';
import type { ToastMessage } from '@/types';

// Type du toast avec duree
interface ToastWithDuration extends ToastMessage {
  duration: number;
}

// Interface du contexte de toast
interface ToastContextType {
  toasts: ToastWithDuration[];
  addToast: (type: ToastMessage['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Contexte des toasts
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Props du provider
interface ToastProviderProps {
  children: ReactNode;
}

// Compteur pour generer des IDs uniques
let toastCounter = 0;

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastWithDuration[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Suppression d'un toast par son ID
  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Ajout d'un nouveau toast
  const addToast = useCallback(
    (type: ToastMessage['type'], message: string, duration = 5000) => {
      toastCounter += 1;
      const id = `toast-${toastCounter}-${Date.now()}`;
      const toast: ToastWithDuration = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss apres la duree configuree
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  const value: ToastContextType = { toasts, addToast, removeToast };

  return createElement(ToastContext.Provider, { value }, children);
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast doit etre utilise dans un ToastProvider');
  }
  return context;
}
