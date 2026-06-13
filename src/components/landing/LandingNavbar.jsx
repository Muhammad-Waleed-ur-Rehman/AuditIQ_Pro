import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, GitBranch, Menu } from 'lucide-react';

export default function LandingNavbar({ onEnterDashboard }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3 text-white" aria-label="AuditIQ Pro home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-100 shadow-lg shadow-cyan-950/40">AI</span>
          <span>
            <span className="block text-lg font-semibold tracking-[0.25em] text-white">AUDITIQ PRO</span>
            <span className="block text-[10px] uppercase tracking-[0.35em] text-cyan-100/70">Assurance intelligence</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          <a href="#features" className="transition hover:text-cyan-200">Features</a>
          <a href="#showcase" className="transition hover:text-cyan-200">Products</a>
          <a href="#workflow" className="transition hover:text-cyan-200">Workflow</a>
          <a href="#ai-features" className="transition hover:text-cyan-200">AI Capabilities</a>
          <a href="#faq" className="transition hover:text-cyan-200">FAQs</a>
          <a href="#ai-copilot" className="transition hover:text-cyan-200">AI Copilot</a>
          <Link to="/login" className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10">Login</Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button type="button" className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-100" aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-100 transition hover:border-cyan-400/30 hover:text-cyan-100" aria-label="GitHub">
            <GitBranch className="h-4 w-4" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/6 p-2 text-slate-100 transition hover:border-cyan-400/30 hover:text-cyan-100" aria-label="LinkedIn">
            <BadgeCheck className="h-4 w-4" />
          </a>
          <button onClick={onEnterDashboard} type="button" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02]">
            Launch
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </header>
  );
}
