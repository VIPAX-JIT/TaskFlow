import { useContext } from 'react';
import { CheckCircle2, PlayCircle, Trash2, User as UserIcon, CalendarClock } from 'lucide-react';
import { PriorityBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { AuthContext } from '../../context/AuthContext';

const COLUMNS = [
  { key: 'TODO',        title: 'To do',       bg: 'bg-[var(--paper-soft)]', chip: 'bg-white' },
  { key: 'IN_PROGRESS', title: 'In progress', bg: 'bg-[var(--blue-soft)]',  chip: 'bg-white' },
  { key: 'DONE',        title: 'Done',        bg: 'bg-[var(--green-soft)]', chip: 'bg-white' },
];

const PRIORITY_STRIPE = {
  HIGH:   'bg-[var(--rose-soft)]',
  MEDIUM: 'bg-[var(--amber-soft)]',
  LOW:    'bg-[var(--green-soft)]',
};

export default function KanbanBoard({ tasks, onUpdateStatus, onDelete, onOpen }) {
  const { user } = useContext(AuthContext);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`${col.bg} border-2 border-[var(--ink)] rounded-2xl p-4 flex flex-col min-h-[280px] shadow-[4px_4px_0_0_var(--ink)]`}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-[var(--ink)]">
            <div className="font-display font-bold text-lg uppercase tracking-tight text-[var(--ink)]">
              {col.title}
            </div>
            <span className={`min-w-[28px] h-7 px-2 inline-flex items-center justify-center rounded-full text-xs font-bold border-2 border-[var(--ink)] ${col.chip} text-[var(--ink)]`}>
              {grouped[col.key].length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {grouped[col.key].length === 0 && (
              <div className="text-xs text-[var(--ink-muted)] border-2 border-dashed border-[var(--ink)]/40 rounded-lg text-center py-6 bg-white/40">
                No tasks here
              </div>
            )}
            {grouped[col.key].map((task) => {
              const due = task.deadline ? new Date(task.deadline) : null;
              const overdue = due && due < new Date() && task.status !== 'DONE';
              const canDelete = user?.role === 'ADMIN';
              const canAct = user?.role === 'ADMIN' || (task.assignedTo && (task.assignedTo._id || task.assignedTo) === user?._id);
              const stripe = PRIORITY_STRIPE[task.priority] || 'bg-[var(--paper-soft)]';

              return (
                <div
                  key={task._id}
                  className="bg-white rounded-xl border-2 border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] tf-lift group relative overflow-hidden"
                >
                  <div className={`h-2 w-full ${stripe} border-b-2 border-[var(--ink)]`} />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => onOpen?.(task)} className="text-left flex-1 min-w-0">
                        <h4 className={`font-display font-bold text-[15px] leading-tight ${task.status === 'DONE' ? 'text-[var(--ink-muted)] line-through' : 'text-[var(--ink)]'} line-clamp-2`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-[var(--ink-muted)] mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => onDelete(task)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)] opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete task"
                        >
                          <Trash2 size={12} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <PriorityBadge priority={task.priority} />
                      {due && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${overdue ? 'text-rose-700' : 'text-[var(--ink-muted)]'}`}>
                          <CalendarClock size={12} strokeWidth={2.25} />
                          {due.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-dashed border-[var(--ink)]/30">
                      <div className="flex items-center gap-2 min-w-0">
                        {task.assignedTo ? (
                          <>
                            <Avatar name={task.assignedTo.name || 'Member'} size="xs" />
                            <span className="text-xs text-[var(--ink)] font-semibold truncate">{task.assignedTo.name || 'Assigned'}</span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--ink-muted)] font-semibold">
                            <UserIcon size={12} strokeWidth={2.25} /> Unassigned
                          </span>
                        )}
                      </div>
                      {col.key === 'TODO' && canAct && (
                        <button
                          onClick={() => onUpdateStatus(task, 'IN_PROGRESS')}
                          className="text-xs font-bold text-[var(--ink)] inline-flex items-center gap-1 border-2 border-[var(--ink)] bg-[var(--blue-soft)] px-2 py-1 rounded-md hover:bg-white transition-colors"
                        >
                          <PlayCircle size={12} strokeWidth={2.5} /> Start
                        </button>
                      )}
                      {col.key === 'IN_PROGRESS' && canAct && (
                        <button
                          onClick={() => onUpdateStatus(task, 'DONE')}
                          className="text-xs font-bold text-[var(--ink)] inline-flex items-center gap-1 border-2 border-[var(--ink)] bg-[var(--green-soft)] px-2 py-1 rounded-md hover:bg-white transition-colors"
                        >
                          <CheckCircle2 size={12} strokeWidth={2.5} /> Done
                        </button>
                      )}
                      {col.key === 'DONE' && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink)] inline-flex items-center gap-1">
                          <CheckCircle2 size={12} strokeWidth={2.5} /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
