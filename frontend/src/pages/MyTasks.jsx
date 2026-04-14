import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListChecks, CheckCircle2, Clock, PlayCircle, CalendarClock, Search, Filter, ArrowRight,
  AlertTriangle, FolderKanban,
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';

const STATUS_FILTERS = [
  { key: 'ALL',         label: 'All' },
  { key: 'TODO',        label: 'To do' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'DONE',        label: 'Done' },
];

const PRIORITY_FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_STRIPE = {
  HIGH:   'bg-[var(--rose-soft)]',
  MEDIUM: 'bg-[var(--amber-soft)]',
  LOW:    'bg-[var(--green-soft)]',
};

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks/my-tasks');
      setTasks(res.data || []);
    } catch (err) {
      toast.error('Failed to load tasks', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyTasks(); }, []);

  const updateTaskStatus = async (task, status) => {
    try {
      await api.put(`/tasks/${task._id}/status`, { status });
      toast.success(`Moved to ${status.replace('_', ' ').toLowerCase()}`);
      fetchMyTasks();
    } catch (err) {
      toast.error('Could not update status', err.response?.data?.message);
    }
  };

  const stats = useMemo(() => {
    const t = tasks;
    const now = new Date();
    return {
      total: t.length,
      done: t.filter((x) => x.status === 'DONE').length,
      inProgress: t.filter((x) => x.status === 'IN_PROGRESS').length,
      overdue: t.filter((x) => x.deadline && new Date(x.deadline) < now && x.status !== 'DONE').length,
    };
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (q) {
        const hay = `${t.title} ${t.description || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.status === 'DONE' && b.status !== 'DONE') return 1;
      if (a.status !== 'DONE' && b.status === 'DONE') return -1;
      return new Date(a.deadline || 8.64e15) - new Date(b.deadline || 8.64e15);
    });
  }, [filtered]);

  const pillActive = 'bg-[var(--accent)] text-[var(--ink)] border-2 border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]';
  const pillIdle   = 'bg-white text-[var(--ink-soft)] border-2 border-[var(--ink)] hover:bg-[var(--paper-soft)]';
  const pillActiveDark = 'bg-[var(--ink)] text-white border-2 border-[var(--ink)]';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--ink)]">My tasks</h1>
          <p className="text-[var(--ink-soft)] mt-2">Everything assigned to you across every project.</p>
        </div>
        <div className="relative">
          <Search size={16} strokeWidth={2.25} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my tasks..."
            className="tf-input pl-9 pr-3 py-2 w-full md:w-64 text-sm"
          />
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-28" /><Skeleton className="h-28" />
            <Skeleton className="h-28" /><Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard label="Total"       value={stats.total}      icon={ListChecks}    tone="yellow" subtle="Assigned to me" />
            <StatCard label="In progress" value={stats.inProgress} icon={Clock}         tone="blue"   subtle="Active work" />
            <StatCard label="Completed"   value={stats.done}       icon={CheckCircle2}  tone="green"  subtle={stats.total ? `${Math.round((stats.done / stats.total) * 100)}%` : '—'} />
            <StatCard label="Overdue"     value={stats.overdue}    icon={AlertTriangle} tone="rose"   subtle={stats.overdue ? 'Needs attention' : 'All on track'} />
          </>
        )}
      </section>

      <div className="tf-card p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink)] shrink-0">
          <Filter size={14} strokeWidth={2.5} /> Filters
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                statusFilter === s.key ? pillActive : pillIdle
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-[var(--ink)] hidden md:block" />
        <div className="flex flex-wrap items-center gap-2">
          {PRIORITY_FILTERS.map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                priorityFilter === p ? pillActiveDark : pillIdle
              }`}
            >
              {p === 'ALL' ? 'Any priority' : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={tasks.length === 0 ? 'Nothing on your plate' : 'No tasks match those filters'}
          description={tasks.length === 0
            ? "You're all caught up. When an admin assigns something, it'll show here."
            : 'Try adjusting the filters or clearing the search.'}
          action={(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}>
              Clear filters
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((task) => {
            const due = task.deadline ? new Date(task.deadline) : null;
            const overdue = due && due < new Date() && task.status !== 'DONE';
            const projectId = typeof task.projectId === 'object' ? task.projectId?._id : task.projectId;
            const projectName = typeof task.projectId === 'object' ? task.projectId?.name : null;
            const stripe = PRIORITY_STRIPE[task.priority] || 'bg-[var(--paper-soft)]';
            return (
              <div
                key={task._id}
                className="tf-card tf-lift flex flex-col gap-3 relative overflow-hidden"
              >
                <div className={`h-2 w-full ${stripe} border-b-2 border-[var(--ink)]`} />
                <div className="p-5 pt-2 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-display font-bold text-lg ${task.status === 'DONE' ? 'text-[var(--ink-muted)] line-through' : 'text-[var(--ink)]'} line-clamp-2 leading-tight`}>
                      {task.title}
                    </h3>
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {task.description && (
                    <p className={`text-sm line-clamp-2 ${task.status === 'DONE' ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-soft)]'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <StatusBadge status={task.status} />
                    {due && (
                      <span className={`inline-flex items-center gap-1 font-semibold ${overdue ? 'text-rose-700' : 'text-[var(--ink-muted)]'}`}>
                        <CalendarClock size={12} strokeWidth={2.25} />
                        {overdue ? 'Overdue · ' : 'Due '}
                        {due.toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {projectId && (
                    <button
                      onClick={() => navigate(`/project/${projectId}`)}
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] font-bold w-fit"
                    >
                      <FolderKanban size={12} strokeWidth={2.25} /> {projectName || 'Open project'}
                      <ArrowRight size={12} strokeWidth={2.25} />
                    </button>
                  )}

                  <div className="pt-3 mt-auto border-t-2 border-dashed border-[var(--ink)]/30 flex items-center justify-between gap-2">
                    {task.status === 'TODO' && (
                      <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task, 'IN_PROGRESS')}>
                        <PlayCircle size={14} strokeWidth={2.5} /> Start
                      </Button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <Button variant="success" size="sm" onClick={() => updateTaskStatus(task, 'DONE')}>
                        <CheckCircle2 size={14} strokeWidth={2.5} /> Mark done
                      </Button>
                    )}
                    {task.status === 'DONE' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--ink)]">
                        <CheckCircle2 size={12} strokeWidth={2.5} /> Completed
                      </span>
                    )}
                    {projectId && (
                      <button
                        onClick={() => navigate(`/project/${projectId}`)}
                        className="text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-2"
                      >
                        Open →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
