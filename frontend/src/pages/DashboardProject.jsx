import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Users as UsersIcon, BarChart3, Columns, Search, Mail,
  Shield, UserMinus, UserPlus, AlertTriangle, CheckCircle2, Clock, ListChecks,
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import { RoleBadge } from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import KanbanBoard from '../components/project/KanbanBoard';
import TaskModal from '../components/project/TaskModal';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'board',     label: 'Board',     icon: Columns },
  { key: 'members',   label: 'Members',   icon: UsersIcon },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function DashboardProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('board');
  const [search, setSearch] = useState('');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submittingTask, setSubmittingTask] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const amProjectOwner = isAdmin && project && project.adminId?._id === user?._id;

  const loadAll = async () => {
    try {
      const [projRes, tasksRes, analyticsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/dashboard/${id}`).catch(() => ({ data: null })),
      ]);
      setProject(projRes.data.project);
      setMembers(projRes.data.members || []);
      setTasks(tasksRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      toast.error('Could not load project', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [id]);

  const refreshTasks = async () => {
    try {
      const [tasksRes, analyticsRes] = await Promise.all([
        api.get(`/tasks/project/${id}`),
        api.get(`/dashboard/${id}`).catch(() => ({ data: null })),
      ]);
      setTasks(tasksRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      toast.error('Failed to refresh', err.response?.data?.message);
    }
  };

  const handleCreateOrUpdate = async (payload) => {
    setSubmittingTask(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', { projectId: id, ...payload });
        toast.success('Task created');
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      refreshTasks();
    } catch (err) {
      toast.error('Save failed', err.response?.data?.details?.[0] || err.response?.data?.message);
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await api.put(`/tasks/${task._id}/status`, { status });
      toast.success(`Moved to ${status.replace('_', ' ').toLowerCase()}`);
      refreshTasks();
    } catch (err) {
      toast.error('Could not update status', err.response?.data?.message);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success('Task deleted');
      refreshTasks();
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message);
    }
  };

  const openCreateTask = () => { setEditingTask(null); setTaskModalOpen(true); };
  const openEditTask = (task) => {
    if (!isAdmin) return;
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }, [tasks, search]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Project not found"
        description="It may have been deleted or you no longer have access."
        action={<Button onClick={() => navigate('/projects')}>Back to projects</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="tf-card-lg p-7 md:p-9 relative">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div className="min-w-0">
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ink)] bg-white border-2 border-[var(--ink)] rounded-full px-3 py-1 shadow-[2px_2px_0_0_var(--ink)] hover:bg-[var(--accent)] transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={12} strokeWidth={2.5} /> All projects
            </button>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mt-4 text-[var(--ink)] leading-[1.05] truncate">
              {project.name}
            </h1>
            <p className="mt-2 text-[var(--ink-soft)] max-w-2xl line-clamp-2">
              {project.description || 'No description provided.'}
            </p>
            <div className="flex items-center gap-3 mt-5 text-sm flex-wrap">
              <div className="inline-flex items-center gap-2 bg-[var(--accent)] border-2 border-[var(--ink)] rounded-full px-3 py-1 font-bold text-[var(--ink)]">
                <Avatar name={project.adminId?.name || 'Admin'} size="xs" />
                <span>{project.adminId?.name || 'Admin'}</span>
                <span className="text-[var(--ink-muted)] font-normal">· Owner</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[var(--blue-soft)] border-2 border-[var(--ink)] rounded-full px-3 py-1 font-bold text-[var(--ink)]">
                <UsersIcon size={13} strokeWidth={2.25} /> {members.length} member{members.length === 1 ? '' : 's'}
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[var(--green-soft)] border-2 border-[var(--ink)] rounded-full px-3 py-1 font-bold text-[var(--ink)]">
                <ListChecks size={13} strokeWidth={2.25} /> {tasks.length} task{tasks.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 shrink-0">
              <Button onClick={openCreateTask}>
                <Plus size={16} strokeWidth={2.5} /> New task
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] w-fit">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  active
                    ? 'bg-[var(--accent)] text-[var(--ink)] border-2 border-[var(--ink)]'
                    : 'border-2 border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper-soft)]'
                }`}
              >
                <Icon size={14} strokeWidth={2.5} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === 'board' && (
          <div className="relative">
            <Search size={16} strokeWidth={2.25} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="tf-input pl-9 pr-3 py-2 w-full md:w-64 text-sm"
            />
          </div>
        )}
      </div>

      {tab === 'board' && (
        tasks.length === 0 ? (
          <EmptyState
            icon={Columns}
            title="No tasks yet"
            description={isAdmin ? 'Create the first task to kick things off.' : 'An admin will assign you tasks soon.'}
            action={isAdmin && <Button onClick={openCreateTask}><Plus size={16} strokeWidth={2.5} /> Create task</Button>}
          />
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onUpdateStatus={handleStatusChange}
            onDelete={handleDeleteTask}
            onOpen={openEditTask}
          />
        )
      )}

      {tab === 'members' && (
        <MembersPanel
          projectId={id}
          members={members}
          amProjectOwner={amProjectOwner}
          onChanged={loadAll}
        />
      )}

      {tab === 'analytics' && (
        <AnalyticsPanel analytics={analytics} tasks={tasks} />
      )}

      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
        members={members}
        submitting={submittingTask}
      />
    </div>
  );
}

function MembersPanel({ projectId, members, amProjectOwner, onChanged }) {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selected, setSelected] = useState('');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (!amProjectOwner) return;
    setLoadingUsers(true);
    api.get('/auth/users')
      .then((res) => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, [amProjectOwner]);

  const memberIds = new Set(members.map((m) => m.userId?._id || m.userId));
  const addable = users.filter((u) => !memberIds.has(u._id));

  const handleAdd = async () => {
    if (!selected) return;
    const u = users.find((x) => x._id === selected);
    if (!u) return;
    setAdding(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email: u.email });
      toast.success(`${u.name} added to project`);
      setSelected('');
      onChanged();
    } catch (err) {
      toast.error('Add failed', err.response?.data?.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (member) => {
    const mId = member.userId?._id || member.userId;
    const name = member.userId?.name || 'this member';
    if (!window.confirm(`Remove ${name} from the project? Their tasks will remain but unassigned.`)) return;
    setRemovingId(mId);
    try {
      await api.delete(`/projects/${projectId}/members/${mId}`);
      toast.success(`${name} removed`);
      onChanged();
    } catch (err) {
      toast.error('Remove failed', err.response?.data?.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {amProjectOwner && (
        <div className="tf-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg border-2 border-[var(--ink)] bg-[var(--accent)] text-[var(--ink)] flex items-center justify-center">
              <UserPlus size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg text-[var(--ink)]">Invite a member</div>
              <div className="text-xs text-[var(--ink-muted)]">Pick from registered users to add to this project.</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="tf-input flex-1 px-3 py-2.5 text-sm"
              disabled={loadingUsers || addable.length === 0}
            >
              <option value="">
                {loadingUsers ? 'Loading users…' : addable.length === 0 ? 'No users available to add' : 'Select a user…'}
              </option>
              {addable.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} · {u.email}{u.role === 'ADMIN' ? ' (Admin)' : ''}
                </option>
              ))}
            </select>
            <Button onClick={handleAdd} disabled={!selected || adding}>
              {adding ? 'Adding…' : (<><UserPlus size={16} strokeWidth={2.5} /> Add</>)}
            </Button>
          </div>
        </div>
      )}

      <div className="tf-card p-5">
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-dashed border-[var(--ink)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-[var(--ink)] bg-[var(--blue-soft)] text-[var(--ink)] flex items-center justify-center">
              <UsersIcon size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-extrabold text-lg text-[var(--ink)]">Team members</div>
              <div className="text-xs text-[var(--ink-muted)]">{members.length} total · includes the project admin</div>
            </div>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-sm text-[var(--ink-muted)] bg-[var(--paper-soft)] border-2 border-dashed border-[var(--ink)] rounded-xl p-6 text-center">
            No members yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((m) => {
              const u = m.userId || {};
              const mid = u._id || m.userId;
              return (
                <div
                  key={mid}
                  className="border-2 border-[var(--ink)] rounded-xl p-4 flex items-center gap-3 bg-white shadow-[3px_3px_0_0_var(--ink)]"
                >
                  <Avatar name={u.name || 'Member'} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-[var(--ink)] truncate">{u.name || 'Unknown'}</span>
                      <RoleBadge role={u.role || 'MEMBER'} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)] mt-0.5 truncate">
                      <Mail size={12} strokeWidth={2.25} /> {u.email || '—'}
                    </div>
                  </div>
                  {amProjectOwner && u.role !== 'ADMIN' && (
                    <button
                      onClick={() => handleRemove(m)}
                      disabled={removingId === mid}
                      title="Remove member"
                      className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)] transition-colors disabled:opacity-50 shadow-[2px_2px_0_0_var(--ink)]"
                    >
                      <UserMinus size={14} strokeWidth={2.5} />
                    </button>
                  )}
                  {u.role === 'ADMIN' && (
                    <span title="Project owner" className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-[var(--violet-soft)] text-[var(--ink)]">
                      <Shield size={14} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsPanel({ analytics, tasks }) {
  const total = analytics?.totalTasks ?? tasks.length;
  const done = analytics?.completedTasks ?? tasks.filter((t) => t.status === 'DONE').length;
  const inProgress = analytics?.inProgressTasks ?? tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todo = analytics?.todoTasks ?? tasks.filter((t) => t.status === 'TODO').length;
  const overdue = analytics?.overdueTasks ?? tasks.filter((t) => {
    return t.deadline && new Date(t.deadline) < new Date() && t.status !== 'DONE';
  }).length;
  const rate = analytics?.completionRate ?? (total ? Math.round((done / total) * 100) : 0);

  const byPriority = ['HIGH', 'MEDIUM', 'LOW'].map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));
  const maxPriority = Math.max(1, ...byPriority.map((b) => b.count));

  const priorityBar = {
    HIGH:   'bg-[var(--rose-soft)]',
    MEDIUM: 'bg-[var(--amber-soft)]',
    LOW:    'bg-[var(--green-soft)]',
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total tasks" value={total}      icon={ListChecks}    tone="yellow" subtle="Across this project" />
        <StatCard label="Completed"   value={done}       icon={CheckCircle2}  tone="green"  subtle={`${rate}% completion rate`} />
        <StatCard label="In progress" value={inProgress} icon={Clock}         tone="blue"   subtle={`${todo} still to do`} />
        <StatCard label="Overdue"     value={overdue}    icon={AlertTriangle} tone="rose"   subtle={overdue ? 'Needs attention' : 'All on track'} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 tf-card p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-dashed border-[var(--ink)]">
            <div className="w-11 h-11 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center text-[var(--ink)]">
              <BarChart3 size={20} strokeWidth={2.25} />
            </div>
            <div>
              <div className="font-display font-extrabold text-xl text-[var(--ink)]">Completion progress</div>
              <div className="text-sm text-[var(--ink-muted)]">How far along the project is</div>
            </div>
            <div className="ml-auto font-display font-extrabold text-4xl text-[var(--ink)] leading-none">{rate}%</div>
          </div>
          <div className="w-full bg-white border-2 border-[var(--ink)] rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] border-r-2 border-[var(--ink)] transition-all duration-700"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <MetricPill label="To do"       value={todo}       bg="bg-white" />
            <MetricPill label="In progress" value={inProgress} bg="bg-[var(--blue-soft)]" />
            <MetricPill label="Done"        value={done}       bg="bg-[var(--green-soft)]" />
            <MetricPill label="Overdue"     value={overdue}    bg="bg-[var(--rose-soft)]" />
          </div>
        </div>

        <div className="tf-card p-6">
          <div className="font-display font-extrabold text-xl text-[var(--ink)] mb-5 pb-4 border-b-2 border-dashed border-[var(--ink)]">
            By priority
          </div>
          <div className="flex flex-col gap-4">
            {byPriority.map((b) => (
              <div key={b.priority}>
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)] mb-1 uppercase tracking-wider">
                  <span>{b.priority}</span>
                  <span>{b.count}</span>
                </div>
                <div className="h-3 bg-white border-2 border-[var(--ink)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${priorityBar[b.priority]} transition-all duration-700 ${b.count > 0 ? 'border-r-2 border-[var(--ink)]' : ''}`}
                    style={{ width: `${(b.count / maxPriority) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-xs text-[var(--ink-muted)]">No tasks yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, bg }) {
  return (
    <div className={`rounded-lg px-3 py-2 border-2 border-[var(--ink)] ${bg}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-muted)]">{label}</div>
      <div className="text-xl font-display font-extrabold text-[var(--ink)]">{value}</div>
    </div>
  );
}
