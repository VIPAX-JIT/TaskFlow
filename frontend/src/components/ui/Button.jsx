export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  className = '',
  ...rest
}) {
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };
  const variants = {
    primary:   'tf-btn bg-[var(--accent)] text-[var(--ink)] hover:bg-[var(--accent-dark)]',
    secondary: 'tf-btn bg-white text-[var(--ink)]',
    danger:    'tf-btn bg-[var(--rose-soft)] text-[var(--ink)]',
    success:   'tf-btn bg-[var(--green-soft)] text-[var(--ink)]',
    outline:   'tf-btn bg-white text-[var(--ink)]',
    ghost:     'inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-3 py-1.5 text-[var(--ink)] hover:bg-[var(--paper-soft)] border-2 border-transparent hover:border-[var(--ink)] transition-all',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
