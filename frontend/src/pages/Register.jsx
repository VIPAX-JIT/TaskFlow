import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, User, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
      await login(email, password);
      navigate('/home');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.details?.[0] || data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex tf-auth-bg">
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="w-11 h-11 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] tf-rot-neg-3">
              <CheckSquare size={22} strokeWidth={2.5} />
            </div>
            <div className="font-display text-3xl font-extrabold leading-none text-[var(--ink)]">
              <span className="tf-text-gradient">Task</span>Flow
            </div>
          </div>

          <div className="tf-glass p-8 tf-fade-up">
            <h2 className="font-display text-3xl font-extrabold text-[var(--ink)]">Create your account</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Set up your workspace in under a minute.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="text-sm font-semibold bg-[var(--rose-soft)] text-[var(--ink)] border-2 border-[var(--ink)] px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <Field label="Full name" icon={User}>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="tf-input w-full pl-10 pr-3 py-2.5 text-sm"
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Email address" icon={Mail}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="tf-input w-full pl-10 pr-3 py-2.5 text-sm"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Password" icon={Lock}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="tf-input w-full pl-10 pr-3 py-2.5 text-sm"
                  placeholder="Min 6 characters"
                />
              </Field>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                  I'll use TaskFlow as...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleOption active={role === 'MEMBER'} onClick={() => setRole('MEMBER')} label="Team Member" desc="Work on assigned tasks" icon={User} />
                  <RoleOption active={role === 'ADMIN'}  onClick={() => setRole('ADMIN')}  label="Project Admin" desc="Create projects & assign" icon={Shield} />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : <>Create account <ArrowRight size={16} strokeWidth={2.5} /></>}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--ink-soft)]">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[var(--ink)] underline underline-offset-4 decoration-[var(--accent-dark)] decoration-[3px] hover:decoration-[var(--accent)]">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoleOption({ active, onClick, label, desc, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-3 rounded-xl border-2 border-[var(--ink)] transition-all ${
        active
          ? 'bg-[var(--accent)] shadow-[3px_3px_0_0_var(--ink)]'
          : 'bg-white hover:bg-[var(--paper-soft)] hover:shadow-[3px_3px_0_0_var(--ink)]'
      }`}
    >
      <div className="flex items-center gap-2 font-display font-bold text-[var(--ink)]">
        {Icon && <Icon size={16} strokeWidth={2.25} />} {label}
      </div>
      <div className="text-xs text-[var(--ink-soft)] mt-1">{desc}</div>
    </button>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} strokeWidth={2.25} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink)]" />
        {children}
      </div>
    </div>
  );
}
