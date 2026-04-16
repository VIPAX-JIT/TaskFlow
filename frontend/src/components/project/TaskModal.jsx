import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function TaskModal({ open, onClose, onSubmit, task, members = [], submitting }) {
  const isEdit = Boolean(task);

  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', deadline: '', assignedTo: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'MEDIUM',
        deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : '',
        assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
      });
    }
  }, [open, task]);

  const memberOptions = useMemo(() => {
    return members.map((m) => ({
      value: m.userId?._id || m.userId,
      label: `${m.userId?.name || 'Member'}${m.userId?.role === 'ADMIN' ? ' (Admin)' : ''}`,
    }));
  }, [members]);

  const submit = (e) => {
    e?.preventDefault();
    const payload = { ...form };
    if (!payload.deadline) delete payload.deadline;
    if (!payload.assignedTo) delete payload.assignedTo;
    onSubmit(payload);
  };

  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5';
  const fieldCls = 'tf-input w-full px-3 py-2.5 text-sm';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit task' : 'Create task'}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      )}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className={labelCls}>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={fieldCls}
            placeholder="e.g. Implement login flow"
          />
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${fieldCls} resize-none`}
            placeholder="Details, acceptance criteria..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className={fieldCls}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className={fieldCls}
            />
          </div>
        </div>

        {!isEdit && (
          <div>
            <label className={labelCls}>Assign to (optional)</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className={fieldCls}
            >
              <option value="">Unassigned</option>
              {memberOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <div className="text-xs text-[var(--ink-muted)] mt-1.5">
              Assigning fires a notification via the Observer pattern.
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
