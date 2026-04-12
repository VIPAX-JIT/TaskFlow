export function PriorityBadge({ priority }) {
  const map = {
    HIGH:   'bg-[var(--rose-soft)]',
    MEDIUM: 'bg-[var(--amber-soft)]',
    LOW:    'bg-[var(--green-soft)]',
  };
  return (
    <span className={`tf-chip ${map[priority] || 'bg-white'}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    TODO:        { text: 'To Do',       cls: 'bg-white' },
    IN_PROGRESS: { text: 'In Progress', cls: 'bg-[var(--blue-soft)]' },
    DONE:        { text: 'Done',        cls: 'bg-[var(--green-soft)]' },
  }[status] || { text: status, cls: 'bg-white' };
  return (
    <span className={`tf-chip ${map.cls}`}>
      {map.text}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN';
  return (
    <span className={`tf-chip ${isAdmin ? 'bg-[var(--violet-soft)]' : 'bg-white'}`}>
      {role}
    </span>
  );
}
