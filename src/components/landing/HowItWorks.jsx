import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderPlus, ShieldAlert, BarChart3, FileText, ListChecks, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: FolderPlus,
    title: 'Create Audit Engagement',
    description: 'Set up a new audit engagement with client details, scope, and period. Define the team and timeline to kick off the engagement lifecycle.',
    accent: 'from-cyan-400 to-blue-500',
  },
  {
    icon: ShieldAlert,
    title: 'Assess Risks',
    description: 'Identify and evaluate inherent and control risks using ISA 315-aligned frameworks. Map risks to assertions and build a heatmap for audit focus.',
    accent: 'from-rose-400 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Analyze Financial Data',
    description: 'Upload financial statements and run automated ratio analysis, trend detection, and anomaly flagging to surface red flags before fieldwork.',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: FileText,
    title: 'Generate Working Papers',
    description: 'Automatically draft working papers populated with risk assessments, financial findings, and audit evidence organized by assertion.',
    accent: 'from-violet-400 to-purple-500',
  },
  {
    icon: ListChecks,
    title: 'Generate Audit Procedures',
    description: 'Produce tailored audit procedures based on assessed risks and financial analysis, with clear testing instructions and evidence requirements.',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    icon: CheckCircle2,
    title: 'Complete Audit Documentation',
    description: 'Finalize audit files with reviewed working papers, procedures, planning memos, and management letters in a structured, ready-to-review format.',
    accent: 'from-cyan-400 to-indigo-500',
  },
];

function StepCard({ step, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: index * 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index]);

  const isLeft = index % 2 === 0;

  return (
    <div ref={cardRef} className="relative flex items-start gap-6 md:gap-0">
      {/* Desktop layout: alternating left/right */}
      <div className={`hidden md:flex w-1/2 ${isLeft ? 'justify-end pr-10 text-right' : 'justify-start pl-10'}`}>
        <div className={`group w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.07]`}>
          <div className={`mb-3 flex items-center gap-3 ${isLeft ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} shadow-lg`}>
              <step.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">{step.title}</h3>
          </div>
          <p className={`text-xs text-slate-300/80 leading-relaxed ${isLeft ? 'text-right' : ''}`}>
            {step.description}
          </p>
        </div>
      </div>

      {/* Center line dot */}
      <div className="hidden md:flex absolute left-1/2 top-0 -translate-x-1/2 flex-col items-center">
        <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-slate-950 text-xs font-bold text-cyan-100 shadow-lg shadow-cyan-950/40`}>
          {index + 1}
        </div>
      </div>

      {/* Spacer for right-side cards on desktop */}
      <div className="hidden md:flex w-1/2" />

      {/* Mobile layout: stacked */}
      <div className="md:hidden flex-1">
        <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.07]">
          <div className="mb-3 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} shadow-lg`}>
              <step.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-cyan-200/60">Step {index + 1}</span>
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-300/80 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-how-heading]',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      {/* Section heading */}
      <div className="mb-12 text-center" data-how-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Workflow</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          How AuditIQ Pro Works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          From engagement setup to AI-assisted audit documentation, AuditIQ Pro supports the audit lifecycle in a structured workflow.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Desktop center line */}
        <div className="hidden md:block absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan-400/40 via-cyan-300/20 to-transparent" />

        {/* Mobile left line */}
        <div className="md:hidden absolute left-4 top-0 h-full w-px bg-gradient-to-b from-cyan-400/40 via-cyan-300/20 to-transparent" />

        <div className="relative space-y-8 md:space-y-12">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
