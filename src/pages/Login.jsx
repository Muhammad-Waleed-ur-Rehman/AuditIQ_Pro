import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_25%),linear-gradient(135deg,#020617_0%,#111827_45%,#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <section className="flex flex-col justify-between rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/80">Secure access</p>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Welcome back to AuditIQ Pro.</h1>
              <p className="mt-4 text-slate-200/90">Sign in to continue into the protected dashboard and AI-led assurance workspace.</p>
            </div>
            <div className="mt-8 space-y-4 text-sm text-slate-200/90">
              <article className="rounded-2xl border border-white/8 bg-white/5 p-4"> <ShieldCheck className="mb-2 h-5 w-5 text-cyan-200" /> Protected workspace with session-aware routing.</article>
              <article className="rounded-2xl border border-white/8 bg-white/5 p-4"> Supabase authentication will be wired in as the dashboard is unlocked.</article>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/80">Login</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Access your audit workspace</h2>
              </div>
              <Link to="/" className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-100 hover:border-cyan-400/30 hover:bg-cyan-400/10">Back to landing</Link>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <label className="block text-sm text-slate-200">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/50 focus:bg-slate-900"
                  placeholder="auditor@company.com"
                />
              </label>

              <label className="block text-sm text-slate-200">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/50 focus:bg-slate-900"
                  placeholder="••••••••"
                />
              </label>

              {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-200/90">Need an account? <Link to="/signup" className="font-semibold text-cyan-100 hover:text-white">Create one here</Link>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
