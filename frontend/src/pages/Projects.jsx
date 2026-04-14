import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FolderKanban, Plus, Trash2, Users, Search, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import Avatar from '../components/ui/Avatar';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STICKY_BG = [
  'bg-[var(--accent)]',
  'bg-[var(--blue-soft)]',
  'bg-[var(--green-soft)]',
  'bg-[var(--violet-soft)]',
  'bg-[var(--pink-soft)]',
  'bg-[var(--amber-soft)]',
];
const ROTATIONS = ['tf-rot-neg-1', 'tf-rot-1', 'tf-rot-neg-2', 'tf-rot-2'];

function hashIndex(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const toast = useToast();

  const isAdmin = user?.role === 'ADMIN';

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (_err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      toast.success('Project created');
      fetchProjects();
    } catch (err) {
      toast.error('Could not create project', err.response?.data?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"? This also removes all tasks and members.`)) return;
    try {
      await api.delete(`/projects/${project._id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error('Delete failed', err.response?.data?.message);
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--ink)]">Projects</h1>
          <p className="text-[var(--ink-soft)] mt-2">
            {isAdmin ? 'Projects you manage or are a member of.' : 'Projects you belong to.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} strokeWidth={2.25} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="tf-input pl-9 pr-3 py-2 w-56 text-sm"
            />
          </div>
          {isAdmin && (
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} strokeWidth={2.5} /> New project
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search ? 'No projects match your search' : isAdmin ? 'No projects yet' : 'Nothing assigned to you yet'}
          description={isAdmin ? 'Create your first project to get started.' : 'Ask an admin to add you to a project.'}
          action={isAdmin && !search && (
            <Button onClick={() => setShowModal(true)}><Plus size={16} strokeWidth={2.5} /> Create project</Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 py-2">
          {filtered.map((p) => {
            const amAdmin = user && p.adminId?._id === user._id;
            const bg = STICKY_BG[hashIndex(p._id || p.name, STICKY_BG.length)];
            const rot = ROTATIONS[hashIndex(p._id || p.name, ROTATIONS.length)];
            return (
              <div
                key={p._id}
                onClick={() => navigate(`/project/${p._id}`)}
                className={`${bg} ${rot} tf-sticky tf-lift cursor-pointer p-6 group relative hover:rotate-0`}
                style={{ transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl border-2 border-[var(--ink)] bg-white text-[var(--ink)] flex items-center justify-center">
                    <FolderKanban size={22} strokeWidth={2.25} />
                  </div>
                  {amAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                      title="Delete project"
                      className="w-8 h-8 flex items-center justify-center rounded-md border-2 border-[var(--ink)] bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)] transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[var(--ink)] mt-4 line-clamp-2 leading-tight">{p.name}</h3>
                <p className="text-sm text-[var(--ink-soft)] mt-2 line-clamp-2 min-h-[2.5em]">
                  {p.description || 'No description.'}
                </p>

                <div className="mt-5 pt-4 border-t-2 border-dashed border-[var(--ink)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Avatar name={p.adminId?.name || 'Admin'} size="xs" />
                    <span className="font-bold text-[var(--ink)]">{p.adminId?.name || 'Admin'}</span>
                    {amAdmin && (
                      <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-white border-2 border-[var(--ink)] rounded-full px-2 py-0.5">
                        <Shield size={10} strokeWidth={2.5} /> Owner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] flex items-center gap-1 font-semibold">
                    <Users size={14} strokeWidth={2.25} /> Team
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create a new project"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create project'}
            </Button>
          </>
        )}
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Project name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="tf-input w-full px-3 py-2.5 text-sm"
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="tf-input w-full px-3 py-2.5 text-sm resize-none"
              placeholder="A few words about the project..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
