import { useEffect } from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeatureSection from '../components/landing/FeatureSection';
import ProductShowcase from '../components/landing/ProductShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import ParticleBackground from '../components/landing/ParticleBackground';
import Footer from '../components/landing/Footer';
import { useLenis } from '../hooks/useLenis';
import { initLandingAnimations } from '../lib/animations';

export default function Landing({ onEnterDashboard }) {
  useLenis();

  useEffect(() => {
    const cleanup = initLandingAnimations();
    return () => cleanup();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-400/20">
      <ParticleBackground />
      <div className="relative z-10">
        <LandingNavbar onEnterDashboard={onEnterDashboard} />

        <main className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <HeroSection onEnterDashboard={onEnterDashboard} />

          <section id="features" className="mt-12 rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl md:p-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Core modules</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-white md:text-4xl">AuditIQ Pro combines assurance intelligence, financial analysis, and AI-generated guidance.</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Designed for premium audit workflows
              </div>
            </div>
            <FeatureSection />
          </section>

          <section id="showcase" className="mt-12">
            <ProductShowcase />
          </section>

          <section id="workflow" className="mt-12">
            <HowItWorks />
          </section>

          <section id="ai-copilot" className="mt-12 rounded-[32px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-slate-900 to-indigo-500/10 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl md:p-10" data-reveal>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">AI Copilot</p>
                <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Ask questions, surface findings, and draft next steps with confidence.</h2>
                <p className="mt-4 max-w-xl text-slate-200/90">The landing page is intentionally separate from the protected dashboard so teams can preview the product experience without disturbing the operational workspace.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center gap-3 text-cyan-100">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-[0.35em]">Assurance-ready</span>
                </div>
                <ul className="mt-6 space-y-4 text-sm text-slate-200">
                  <li className="rounded-2xl border border-white/8 bg-white/5 p-4">AI-generated suggestions stay in the preview experience during this iteration.</li>
                  <li className="rounded-2xl border border-white/8 bg-white/5 p-4">The protected dashboard remains available through the “Launch Audit Console” action.</li>
                  <li className="rounded-2xl border border-white/8 bg-white/5 p-4">Lenis, GSAP, and Three.js are mounted only on this landing surface.</li>
                </ul>
                <button
                  onClick={onEnterDashboard}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02] hover:shadow-cyan-400/30"
                  type="button"
                >
                  Launch Audit Console
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
