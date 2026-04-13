import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex tf-auth-bg">

      <aside className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] tf-rot-neg-3">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <div className="font-display text-3xl font-extrabold leading-none text-[var(--ink)]">
            <span className="tf-text-gradient">Task</span>Flow
          </div>
        </div>

        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold bg-white border-2 border-[var(--ink)] text-[var(--ink)] px-3 py-1.5 rounded-full mb-7 shadow-[2px_2px_0_0_var(--ink)] uppercase tracking-wider">
            Team task management, done right
          </div>
          <h1 className="font-display text-[56px] font-extrabold text-[var(--ink)] leading-[1.02]">
            Ship work that <span className="tf-text-gradient">actually moves</span> your project forward.
          </h1>
          <p className="mt-6 text-lg text-[var(--ink-soft)] leading-relaxed max-w-lg">
            Role-based projects, a lifecycle-aware task board, and event-driven notifications — in one crisp workspace for your team.
          </p>

          <div className="mt-10 flex items-center gap-6 flex-wrap">
            <div className="tf-sticky bg-[var(--accent)] px-5 py-4 tf-rot-neg-3 max-w-[200px]">
              <div className="font-display font-bold text-[var(--ink)] text-lg leading-tight">Monday, unafraid.</div>
              <div className="text-xs text-[var(--ink-soft)] mt-1 italic">A week with a plan is a week you keep.</div>
            </div>
            <div className="tf-sticky bg-[var(--blue-soft)] px-5 py-4 tf-rot-2 max-w-[200px]">
              <div className="font-display font-bold text-[var(--ink)] text-lg leading-tight">Small moves, loud wins.</div>
              <div className="text-xs text-[var(--ink-soft)] mt-1 italic">Progress lives in the checkmarks.</div>
            </div>
            <div className="tf-sticky bg-[var(--green-soft)] px-5 py-4 tf-rot-neg-2 max-w-[200px]">
              <div className="font-display font-bold text-[var(--ink)] text-lg leading-tight">Ink over inbox.</div>
              <div className="text-xs text-[var(--ink-soft)] mt-1 italic">Less chasing. More shipping.</div>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ink)] w-fit">
          <span>crafted by</span>
          <span className="tf-text-gradient font-display text-base normal-case tracking-tight">VIPAX</span>
          <span className="text-[var(--ink-muted)] normal-case">· made with late-night ink</span>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-11 h-11 rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] flex items-center justify-center text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)] tf-rot-neg-3">
              <CheckSquare size={22} strokeWidth={2.5} />
            </div>
            <div className="font-display text-3xl font-extrabold leading-none text-[var(--ink)]">
              <span className="tf-text-gradient">Task</span>Flow
            </div>
          </div>

          <div className="tf-glass p-8 tf-fade-up">
            <h2 className="font-display text-3xl font-extrabold text-[var(--ink)]">Welcome back</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Sign in to continue to your workspace.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="text-sm font-semibold bg-[var(--rose-soft)] text-[var(--ink)] border-2 border-[var(--ink)] px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <Field label="Email address" icon={Mail}>
                <input
                  type="email"
                  required
                  autoComplete="email"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="tf-input w-full pl-10 pr-3 py-2.5 text-sm"
                  placeholder="••••••••"
                />
              </Field>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16} strokeWidth={2.5} /></>}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--ink-soft)]">
              New to TaskFlow?{' '}
              <Link to="/register" className="font-bold text-[var(--ink)] underline underline-offset-4 decoration-[var(--accent-dark)] decoration-[3px] hover:decoration-[var(--accent)]">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
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
