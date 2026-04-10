import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bell,
  LogOut,
} from 'lucide-react';
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Avatar from './ui/Avatar';
import { RoleBadge } from './ui/Badge';

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
    isActive
      ? 'bg-[var(--accent)] border-[var(--ink)] text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)]'
      : 'border-transparent text-[var(--ink-soft)] hover:bg-white hover:border-[var(--ink)] hover:shadow-[3px_3px_0_0_var(--ink)]'
  }`;

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex w-64 bg-[var(--paper-soft)] border-r-2 border-[var(--ink)] flex-col shrink-0 h-screen sticky top-0">

      <div className="px-5 py-5 border-b-2 border-dashed border-[var(--ink)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] tf-rot-neg-3">
          <CheckSquare size={20} strokeWidth={2.5} />
        </div>
        <div className="font-display text-2xl font-extrabold tracking-tight leading-none text-[var(--ink)]">
          <span className="tf-text-gradient">Task</span>Flow
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)] font-bold px-3 mb-2">Workspace</div>
        <NavLink to="/home" className={linkClasses}>
          <LayoutDashboard size={18} strokeWidth={2.25} /> Dashboard
        </NavLink>
        <NavLink to="/projects" className={linkClasses}>
          <FolderKanban size={18} strokeWidth={2.25} /> Projects
        </NavLink>
        <NavLink to="/my-tasks" className={linkClasses}>
          <CheckSquare size={18} strokeWidth={2.25} /> My Tasks
        </NavLink>
        <NavLink to="/notifications" className={linkClasses}>
          <Bell size={18} strokeWidth={2.25} /> Notifications
        </NavLink>
      </nav>

      <div className="border-t-2 border-dashed border-[var(--ink)] p-4 bg-white">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-[var(--ink)] truncate">{user?.name || 'Loading...'}</div>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={user?.role || 'MEMBER'} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)] transition-colors shadow-[2px_2px_0_0_var(--ink)]"
          >
            <LogOut size={16} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </aside>
  );
}
