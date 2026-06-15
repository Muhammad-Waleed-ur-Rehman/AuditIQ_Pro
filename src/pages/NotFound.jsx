import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileQuestion, Home, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fadeIn">
        {/* Visual Element */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-brand-100 rounded-3xl rotate-6 animate-pulse"></div>
          <div className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center">
            <FileQuestion className="h-12 w-12 text-brand-600" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-slate-900">404 - Page Not Found</h1>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            The audit trail ends here. The page you are looking for doesn't exist or has been moved to a different sector.
          </p>
        </div>

        {/* Dynamic Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/15 hover:bg-brand-700 transition-all active:scale-95"
            >
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/15 hover:bg-brand-700 transition-all active:scale-95"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          )}
          
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Helpful Footer */}
        <div className="pt-12 border-t border-slate-100">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Secure Workspace Intelligence</span>
          </div>
        </div>
      </div>
    </main>
  );
}
