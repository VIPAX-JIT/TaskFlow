const PALETTE = [
  'var(--accent)',
  'var(--blue-soft)',
  'var(--rose-soft)',
  'var(--green-soft)',
  'var(--violet-soft)',
  'var(--amber-soft)',
  'var(--pink-soft)',
];

function hashIndex(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE.length;
}

export default function Avatar({ name = '?', size = 'md', className = '' }) {
  const initials = (name || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const bg = PALETTE[hashIndex(name)];

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-[var(--ink)] text-[var(--ink)] font-bold flex items-center justify-center shrink-0 ${className}`}
      style={{ backgroundColor: bg }}
    >
      {initials || '?'}
    </div>
  );
}
