import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (title: string, options?: { message?: string; type?: ToastType; duration?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, options?: { message?: string; type?: ToastType; duration?: number }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: Toast = {
        id,
        title,
        message: options?.message,
        type: options?.type || 'info',
      };

      setToasts((prev) => [...prev, newToast]);

      const duration = options?.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E9EAF3] shadow-lg shadow-[#8B7CF6]/5 transition-all animate-in slide-in-from-bottom-3 duration-200"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#6FD6B0] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#FFAD91] shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#FFD978] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#8B7CF6] shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#252842]">{toast.title}</h4>
              {toast.message && <p className="text-xs text-[#777D96] mt-0.5 break-words">{toast.message}</p>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#777D96] hover:text-[#252842] p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
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
