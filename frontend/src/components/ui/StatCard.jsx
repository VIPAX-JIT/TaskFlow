export default function StatCard({ label, value, icon: Icon, tone = 'yellow', trend, subtle }) {
  const tones = {
    yellow:  'bg-[var(--accent)]',
    blue:    'bg-[var(--blue-soft)]',
    green:   'bg-[var(--green-soft)]',
    rose:    'bg-[var(--rose-soft)]',
    violet:  'bg-[var(--violet-soft)]',
    amber:   'bg-[var(--amber-soft)]',
    pink:    'bg-[var(--pink-soft)]',

    indigo:  'bg-[var(--blue-soft)]',
    emerald: 'bg-[var(--green-soft)]',
    slate:   'bg-white',
  };
  const iconBg = tones[tone] || tones.yellow;

  return (
    <div className="tf-card p-5 tf-lift">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">{label}</div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg border-2 border-[var(--ink)] flex items-center justify-center text-[var(--ink)] ${iconBg}`}>
            <Icon size={18} strokeWidth={2.25} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <div className="font-display text-4xl font-extrabold text-[var(--ink)] leading-none">{value}</div>
        {trend && (
          <div className={`text-xs font-bold pb-1 ${trend.startsWith('-') ? 'text-rose-700' : 'text-emerald-700'}`}>
            {trend}
          </div>
        )}
      </div>
      {subtle && <div className="text-xs text-[var(--ink-muted)] mt-1">{subtle}</div>}
    </div>
  );
}
