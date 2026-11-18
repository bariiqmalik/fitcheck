import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, description?: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, description }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((message: string, description?: string) => addToast('success', message, description), [addToast]);
  const error = useCallback((message: string, description?: string) => addToast('error', message, description), [addToast]);
  const info = useCallback((message: string, description?: string) => addToast('info', message, description), [addToast]);
  const warning = useCallback((message: string, description?: string) => addToast('warning', message, description), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
            error: <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
            info: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
            warning: <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          };

          const borders = {
            success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-stone-900',
            error: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-stone-900',
            info: 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-stone-900',
            warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-stone-900',
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border ${borders[t.type]} transition-all duration-200 transform translate-y-0 opacity-100`}
            >
              {icons[t.type]}
              <div className="flex-1 text-sm">
                <div className="font-semibold text-stone-900 dark:text-stone-100">{t.message}</div>
                {t.description && (
                  <div className="text-stone-500 dark:text-stone-400 mt-0.5 text-xs">{t.description}</div>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

