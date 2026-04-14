import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Check, CheckCheck, Inbox, ListChecks, FolderKanban } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

const FILTERS = [
  { key: 'ALL',    label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
  { key: 'READ',   label: 'Read' },
];

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setItems(res.data || []);
    } catch (err) {
      toast.error('Could not load notifications', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markOneRead = async (n) => {
    if (n.isRead) return;
    try {
      await api.patch(`/notifications/${n._id}/read`);
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    } catch (err) {
      toast.error('Could not mark as read', err.response?.data?.message);
    }
  };

  const markAllRead = async () => {
    setBusy(true);
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      toast.success('All caught up');
    } catch (err) {
      toast.error('Failed', err.response?.data?.message);
    } finally {
      setBusy(false);
    }
  };

  const handleClick = async (n) => {
    await markOneRead(n);
    const taskId = n.taskId?._id || n.taskId;
    const projectId = n.taskId?.projectId?._id || n.taskId?.projectId;
    if (projectId) navigate(`/project/${projectId}`);
    else if (taskId) navigate('/my-tasks');
  };

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'UNREAD') return !n.isRead;
      if (filter === 'READ') return n.isRead;
      return true;
    });
  }, [items, filter]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const pillActive = 'bg-[var(--accent)] text-[var(--ink)] border-2 border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]';
  const pillIdle   = 'bg-white text-[var(--ink-soft)] border-2 border-[var(--ink)] hover:bg-[var(--paper-soft)]';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--ink)] flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm bg-[var(--rose-soft)] text-[var(--ink)] font-bold rounded-full border-2 border-[var(--ink)] px-3 py-0.5 shadow-[2px_2px_0_0_var(--ink)]">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[var(--ink-soft)] mt-2">Task assignments and updates pushed to you by the Observer pattern.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
          <Button onClick={markAllRead} disabled={busy || unreadCount === 0}>
            <CheckCheck size={16} strokeWidth={2.5} /> Mark all read
          </Button>
        </div>
      </div>

      <div className="tf-card p-3 flex items-center gap-2 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              filter === f.key ? pillActive : pillIdle
            }`}
          >
            {f.label}
            {f.key === 'UNREAD' && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={filter === 'UNREAD' ? BellOff : Inbox}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'Nothing here yet'}
          description={filter === 'UNREAD'
            ? 'You are fully caught up on updates.'
            : 'Notifications about task assignments and updates will appear here.'}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((n) => {
            const task = n.taskId || {};
            const project = task.projectId || {};
            const time = n.createdAt ? formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true }) : '';
            return (
              <li
                key={n._id}
                onClick={() => handleClick(n)}
                className={`group cursor-pointer p-4 rounded-xl border-2 border-[var(--ink)] flex items-start gap-3 transition-all shadow-[3px_3px_0_0_var(--ink)] hover:shadow-[4px_4px_0_0_var(--ink)] hover:translate-x-[-1px] hover:translate-y-[-1px] ${
                  n.isRead ? 'bg-white' : 'bg-[var(--accent)]/40'
                }`}
              >
                <div className={`shrink-0 w-11 h-11 rounded-lg border-2 border-[var(--ink)] flex items-center justify-center text-[var(--ink)] ${
                  n.isRead ? 'bg-white' : 'bg-[var(--accent)]'
                }`}>
                  <Bell size={16} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${n.isRead ? 'text-[var(--ink-soft)]' : 'text-[var(--ink)] font-bold'}`}>
                      {n.message}
                    </p>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 border border-[var(--ink)]" />}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--ink-muted)] font-semibold flex-wrap">
                    {project.name && (
                      <span className="inline-flex items-center gap-1">
                        <FolderKanban size={12} strokeWidth={2.25} /> {project.name}
                      </span>
                    )}
                    {task.title && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                        <ListChecks size={12} strokeWidth={2.25} /> {task.title}
                      </span>
                    )}
                    <span>· {time}</span>
                  </div>
                </div>
                {!n.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markOneRead(n); }}
                    title="Mark as read"
                    className="w-9 h-9 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-white text-[var(--ink)] hover:bg-[var(--green-soft)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0_0_var(--ink)]"
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
