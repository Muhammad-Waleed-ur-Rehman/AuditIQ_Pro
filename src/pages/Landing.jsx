import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import RealProductPreview from '../components/landing/RealProductPreview';
import FeatureSection from '../components/landing/FeatureSection';
import ProductShowcase from '../components/landing/ProductShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import ProblemSolution from '../components/landing/ProblemSolution';
import WhoItsFor from '../components/landing/WhoItsFor';
import AIFeaturesShowcase from '../components/landing/AIFeaturesShowcase';
import AICopilotDemo from '../components/landing/AICopilotDemo';
import FAQSection from '../components/landing/FAQSection';
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

          <section id="real-preview" className="mt-12">
            <RealProductPreview />
          </section>

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

          <section id="comparison" className="mt-12">
            <ProblemSolution />
          </section>

          <section id="audience" className="mt-12">
            <WhoItsFor />
          </section>

          <section id="ai-features" className="mt-12">
            <AIFeaturesShowcase />
          </section>

          <section id="ai-copilot" className="mt-12">
            <AICopilotDemo />
          </section>
        </main>

        <section id="faq" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <FAQSection />
        </section>

        <Footer />
      </div>
    </div>
  );
}
