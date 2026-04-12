import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white border-2 border-dashed border-[var(--ink)] rounded-2xl">
      <div className="w-14 h-14 rounded-full border-2 border-[var(--ink)] bg-[var(--accent)] text-[var(--ink)] flex items-center justify-center mb-4 tf-rot-neg-3">
        <Icon size={24} strokeWidth={2.25} />
      </div>
      <div className="font-display text-xl font-bold text-[var(--ink)]">{title}</div>
      {description && <div className="text-sm text-[var(--ink-muted)] mt-1 max-w-md">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
