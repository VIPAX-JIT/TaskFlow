import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = ++_id;
    const next = { id, kind: 'info', duration: 3500, ...toast };
    setToasts((t) => [...t, next]);
    if (next.duration > 0) {
      setTimeout(() => dismiss(id), next.duration);
    }
  }, [dismiss]);

  const api = {
    success: (title, description) => push({ kind: 'success', title, description }),
    error: (title, description) => push({ kind: 'error', title, description, duration: 5000 }),
    info: (title, description) => push({ kind: 'info', title, description }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[1000] flex flex-col gap-3 w-[min(92vw,360px)] pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const styles = {
    success: { Icon: CheckCircle2,  bg: 'bg-[var(--green-soft)]' },
    error:   { Icon: AlertTriangle, bg: 'bg-[var(--rose-soft)]' },
    info:    { Icon: Info,          bg: 'bg-[var(--blue-soft)]' },
  }[toast.kind] || { Icon: Info, bg: 'bg-white' };

  const { Icon } = styles;

  return (
    <div className="pointer-events-auto tf-fade-up tf-card p-4 flex items-start gap-3">
      <div className={`shrink-0 w-9 h-9 rounded-lg border-2 border-[var(--ink)] flex items-center justify-center text-[var(--ink)] ${styles.bg}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[var(--ink)] text-sm truncate">{toast.title}</div>
        {toast.description && <div className="text-sm text-[var(--ink-muted)] mt-0.5">{toast.description}</div>}
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-white hover:bg-[var(--paper-soft)] transition-colors"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
