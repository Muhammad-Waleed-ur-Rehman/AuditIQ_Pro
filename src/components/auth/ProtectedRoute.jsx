import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { ShieldAlert, Settings } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Configuration Required</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your database environment variables are missing or incorrect. Please configure <code className="bg-slate-100 px-1 rounded text-slate-800">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 px-1 rounded text-slate-800">VITE_SUPABASE_ANON_KEY</code> to access the protected dashboard.
            </p>
          </div>
          <div className="pt-2">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold text-sm hover:underline"
            >
              <Settings className="h-4 w-4" />
              Go to Supabase Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/80">Authentication</p>
          <h1 className="mt-4 text-2xl font-semibold text-white">Checking your session…</h1>
          <p className="mt-2 text-slate-200/90">You will be redirected to the secure dashboard once your session is verified.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
