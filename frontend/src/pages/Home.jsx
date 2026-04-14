import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import {
  BarChart3, CheckCircle2, Clock, AlertTriangle, FolderKanban, ListChecks, ArrowRight, Plus,
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

const PRIORITY_STRIPE = {
  HIGH:   'bg-[var(--rose-soft)]',
  MEDIUM: 'bg-[var(--amber-soft)]',
  LOW:    'bg-[var(--green-soft)]',
};

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t, a] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks/my-tasks'),
          api.get('/dashboard/me'),
        ]);
        setProjects(p.data);
        setMyTasks(t.data);
        setAnalytics(a.data);
      } catch (_err) {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Still up';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const upcoming = useMemo(() => {
    return [...myTasks]
      .filter((t) => t.status !== 'DONE')
      .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
      .slice(0, 5);
  }, [myTasks]);

  return (
    <div className="flex flex-col gap-7">

      <div className="tf-card-lg p-7 md:p-9 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--ink)] px-3 py-1 rounded-full border-2 border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
              Welcome back
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mt-4 text-[var(--ink)] leading-[1.05]">
              {greeting}, <span className="tf-text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="mt-3 text-[var(--ink-soft)] max-w-xl">
              {user?.role === 'ADMIN'
                ? 'Kick off projects, assign work, and keep an eye on team progress — all in one place.'
                : 'Here are your assigned tasks and the latest activity across your projects.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user?.role === 'ADMIN' && (
              <Link to="/projects" className="tf-btn bg-[var(--accent)] text-[var(--ink)] px-4 py-2.5 text-sm">
                <Plus size={16} strokeWidth={2.5} /> New project
              </Link>
            )}
            <Link to="/my-tasks" className="tf-btn bg-white text-[var(--ink)] px-4 py-2.5 text-sm">
              <ListChecks size={16} strokeWidth={2.5} /> My tasks
            </Link>
          </div>
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
            <StatCard label="My Tasks"    value={analytics?.totalTasks ?? 0}      icon={ListChecks}     tone="yellow" subtle="Across all projects" />
            <StatCard label="Completed"   value={analytics?.completedTasks ?? 0}  icon={CheckCircle2}   tone="green"  subtle={`${analytics?.completionRate ?? 0}% completion rate`} />
            <StatCard label="In Progress" value={analytics?.inProgressTasks ?? 0} icon={Clock}          tone="blue"   subtle={`${analytics?.todoTasks ?? 0} still to do`} />
            <StatCard label="Overdue"     value={analytics?.overdueTasks ?? 0}    icon={AlertTriangle}  tone="rose"   subtle={analytics?.overdueTasks ? 'Needs attention' : 'All on track'} />
          </>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 tf-card p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-dashed border-[var(--ink)]">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[var(--ink)]">Upcoming tasks</h2>
              <div className="text-sm text-[var(--ink-muted)]">Your next 5 deadlines</div>
            </div>
            <Link to="/my-tasks" className="text-sm font-bold text-[var(--ink)] underline underline-offset-4 decoration-[3px] decoration-[var(--accent)] inline-flex items-center gap-1 hover:decoration-[var(--accent-dark)]">
              View all <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center text-sm text-[var(--ink-muted)] py-10 bg-[var(--paper-soft)] rounded-xl border-2 border-dashed border-[var(--ink)]">
              You're all caught up.
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((t) => {
                const due = t.deadline ? new Date(t.deadline) : null;
                const overdue = due && due < new Date() && t.status !== 'DONE';
                const stripe = PRIORITY_STRIPE[t.priority] || 'bg-[var(--paper-soft)]';
                return (
                  <li
                    key={t._id}
                    onClick={() => navigate(`/project/${typeof t.projectId === 'object' ? t.projectId._id : t.projectId}`)}
                    className="group tf-lift cursor-pointer flex items-stretch gap-3 rounded-xl border-2 border-[var(--ink)] bg-white shadow-[3px_3px_0_0_var(--ink)] overflow-hidden"
                  >
                    <div className={`w-2 ${stripe} border-r-2 border-[var(--ink)]`} />
                    <div className="min-w-0 flex-1 py-3 pr-4">
                      <div className="font-display font-bold text-[var(--ink)] truncate">{t.title}</div>
                      <div className="text-xs text-[var(--ink-muted)] flex items-center gap-2 mt-1 flex-wrap">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                        {due && (
                          <span className={`font-semibold ${overdue ? 'text-rose-700' : 'text-[var(--ink-muted)]'}`}>
                            {overdue ? 'Overdue • ' : 'Due '}
                            {due.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center pr-4 text-[var(--ink-muted)] group-hover:text-[var(--ink)]">
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="tf-card p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-dashed border-[var(--ink)]">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[var(--ink)]">Projects</h2>
              <div className="text-sm text-[var(--ink-muted)]">Quick access</div>
            </div>
            <Link to="/projects" className="text-sm font-bold text-[var(--ink)] underline underline-offset-4 decoration-[3px] decoration-[var(--accent)] inline-flex items-center gap-1">
              All <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16" /><Skeleton className="h-16" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-sm text-[var(--ink-muted)] py-10 bg-[var(--paper-soft)] rounded-xl border-2 border-dashed border-[var(--ink)]">
              No projects yet.
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {projects.slice(0, 6).map((p) => (
                <li key={p._id}>
                  <Link
                    to={`/project/${p._id}`}
                    className="group flex items-center gap-3 p-3 rounded-xl border-2 border-[var(--ink)] bg-white hover:bg-[var(--paper-soft)] transition-colors shadow-[3px_3px_0_0_var(--ink)] hover:shadow-[4px_4px_0_0_var(--ink)]"
                  >
                    <div className="w-10 h-10 rounded-lg border-2 border-[var(--ink)] bg-[var(--accent)] text-[var(--ink)] flex items-center justify-center shrink-0">
                      <FolderKanban size={18} strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold text-[var(--ink)] truncate">{p.name}</div>
                      <div className="text-xs text-[var(--ink-muted)] truncate">{p.description || 'No description'}</div>
                    </div>
                    <Avatar name={p.adminId?.name || 'Admin'} size="xs" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {user?.role === 'ADMIN' && (
            <Button variant="secondary" size="md" className="w-full mt-5" onClick={() => navigate('/projects')}>
              <Plus size={16} strokeWidth={2.5} /> New project
            </Button>
          )}
        </div>
      </div>

      {!loading && (analytics?.totalTasks ?? 0) > 0 && (
        <div className="tf-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center text-[var(--ink)]">
              <BarChart3 size={20} strokeWidth={2.25} />
            </div>
            <div>
              <div className="font-display font-extrabold text-xl text-[var(--ink)]">Personal completion rate</div>
              <div className="text-sm text-[var(--ink-muted)]">Tasks you finished vs. assigned</div>
            </div>
            <div className="ml-auto font-display font-extrabold text-4xl text-[var(--ink)] leading-none">
              {analytics.completionRate}%
            </div>
          </div>
          <div className="w-full bg-white border-2 border-[var(--ink)] rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-700 border-r-2 border-[var(--ink)]"
              style={{ width: `${analytics.completionRate}%` }}
            />
          </div>
          <div className="mt-4 text-xs text-[var(--ink-muted)] flex gap-4 flex-wrap font-semibold">
            <span>Done: <b className="text-[var(--ink)]">{analytics.completedTasks}</b></span>
            <span>In progress: <b className="text-[var(--ink)]">{analytics.inProgressTasks}</b></span>
            <span>To do: <b className="text-[var(--ink)]">{analytics.todoTasks}</b></span>
            <span>Overdue: <b className="text-rose-700">{analytics.overdueTasks}</b></span>
          </div>
        </div>
      )}
    </div>
  );
}
