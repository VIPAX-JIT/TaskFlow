import { Bell, Menu, Search, Sparkles } from 'lucide-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link, useLocation } from 'react-router-dom';
import Avatar from './ui/Avatar';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, handler]);
}

function pageLabel(path) {
  if (path.startsWith('/home')) return 'Dashboard';
  if (path.startsWith('/projects')) return 'Projects';
  if (path.startsWith('/project/')) return 'Project Detail';
  if (path.startsWith('/my-tasks')) return 'My Tasks';
  if (path.startsWith('/notifications')) return 'Notifications';
  return 'TaskFlow';
}

export default function Topbar({ onMobileMenu }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useClickOutside(dropdownRef, () => setOpen(false));

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {

    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
    const id = setInterval(() => { if (user) fetchNotifications(); }, 30000);
    return () => clearInterval(id);
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (_err) {}
  };
  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (_err) {}
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 bg-[var(--paper)] border-b-2 border-[var(--ink)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]"
        >
          <Menu size={18} strokeWidth={2.5} />
        </button>
        <div className="flex items-center text-sm">
          <span className="text-[var(--ink-muted)] font-semibold">TaskFlow</span>
          <span className="text-[var(--ink-muted)] mx-2">/</span>
          <span className="font-display font-bold text-[var(--ink)]">{pageLabel(location.pathname)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" strokeWidth={2.25} />
          <input
            placeholder="Search (coming soon)"
            disabled
            className="tf-input pl-9 pr-4 py-2 w-56 lg:w-72 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-white text-[var(--ink)] hover:bg-[var(--accent)] transition-colors shadow-[2px_2px_0_0_var(--ink)]"
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2.25} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full border-2 border-[var(--ink)] bg-[var(--rose-soft)] text-[var(--ink)] text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-96 tf-card overflow-hidden z-50 tf-fade-up">
              <div className="p-4 border-b-2 border-dashed border-[var(--ink)] bg-[var(--accent)] flex items-center justify-between">
                <div className="font-display font-bold text-[var(--ink)] flex items-center gap-2">
                  <Sparkles size={16} strokeWidth={2.25} /> Notifications
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs font-bold text-[var(--ink)] underline underline-offset-2 hover:no-underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto bg-white">
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-sm text-[var(--ink-muted)]">You're all caught up.</div>
                )}
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`px-4 py-3 text-sm border-b border-dashed border-[var(--ink)]/30 cursor-pointer hover:bg-[var(--paper-soft)] transition-colors ${!n.isRead ? 'bg-[var(--accent)]/20' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 border border-[var(--ink)] ${n.isRead ? 'bg-white' : 'bg-[var(--accent)]'}`} />
                      <div className="min-w-0 flex-1">
                        <div className={`${n.isRead ? 'text-[var(--ink-muted)]' : 'text-[var(--ink)] font-semibold'}`}>{n.message}</div>
                        <div className="text-xs text-[var(--ink-muted)] mt-0.5">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-bold text-[var(--ink)] py-3 border-t-2 border-dashed border-[var(--ink)] bg-[var(--paper-soft)] hover:bg-[var(--accent)] transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>

        <Link to="/home" className="flex items-center gap-2 pl-2 md:pl-3 md:border-l-2 md:border-[var(--ink)]">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden md:flex flex-col text-xs leading-tight">
            <span className="font-bold text-[var(--ink)] truncate max-w-[140px]">{user?.name || 'User'}</span>
            <span className="text-[var(--ink-muted)] uppercase tracking-wider">{user?.role}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
