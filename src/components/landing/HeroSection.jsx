import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="top" className="grid gap-10 rounded-[36px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr] md:p-10 lg:min-h-[82vh] lg:items-center">
      <div className="space-y-6" data-reveal>
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">AI-Powered Assurance Intelligence</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
          Audit Smarter with AI-Powered Assurance Intelligence
        </h1>
        <p className="max-w-xl text-lg text-slate-200/90 md:text-xl">
          AuditIQ Pro helps internal and external auditors assess risk, analyze financials, generate working papers, and plan audit procedures faster.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02] hover:shadow-cyan-400/30"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#workflow"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            View Workflow
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-200/90">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Shield className="h-4 w-4 text-cyan-200" /> Risk-first workflows</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Sparkles className="h-4 w-4 text-cyan-200" /> AI-assisted insights</span>
        </div>

        <a href="#workflow" className="mt-6 inline-flex items-center gap-2 text-sm text-cyan-100/90 hover:text-cyan-50">
          Scroll to explore
          <ArrowDown className="h-4 w-4" />
        </a>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30" data-reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['92%', 'Findings triaged in under 2 minutes'],
            ['6x', 'Faster procedure planning'],
            ['18 hrs', 'Saved weekly on documentation'],
            ['24/7', 'AI support for audit teams']
          ].map(([value, label]) => (
            <article key={label} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-5 shadow-inner shadow-cyan-950/30">
              <p className="text-3xl font-semibold text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-200/90">{label}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-[24px] border border-cyan-400/20 bg-cyan-400/8 p-5 text-sm text-slate-100">
          <p className="text-cyan-100">Live preview</p>
          <p className="mt-2 text-slate-200/90">This immersive page showcases the product experience before the protected dashboard, keeping the operational workspace separate and uncluttered.</p>
        </div>
      </div>
    </section>
  );
}
