import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[var(--ink)]/40" onClick={onClose}></div>
      <div className={`relative w-full ${widths[size]} tf-fade-up tf-card overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--ink)] bg-[var(--accent)]">
          <h3 className="font-display font-bold text-lg text-[var(--ink)]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-white hover:bg-[var(--paper-soft)] transition-colors"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-5 bg-white">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t-2 border-dashed border-[var(--ink)] bg-[var(--paper-soft)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
