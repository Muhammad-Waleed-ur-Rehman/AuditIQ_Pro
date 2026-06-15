import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const screenshots = [
  {
    title: 'Dashboard Overview',
    subtitle: 'Real-time audit intelligence at a glance',
    gradient: 'from-cyan-600/30 via-blue-600/20 to-indigo-600/30',
    gradientBg: 'from-cyan-500/15 via-blue-500/10 to-indigo-500/15',
    badge: 'Analytics',
    elements: [
      { label: 'Total Risks', value: '12', color: 'text-cyan-100' },
      { label: 'Open Findings', value: '4', color: 'text-amber-100' },
      { label: 'Completed', value: '8', color: 'text-green-100' },
    ],
  },
  {
    title: 'Audit Projects Hub',
    subtitle: 'Centralized project oversight and progress tracking',
    gradient: 'from-violet-600/30 via-purple-600/20 to-pink-600/30',
    gradientBg: 'from-violet-500/15 via-purple-500/10 to-pink-500/15',
    badge: 'Projects',
    elements: [
      { label: 'FY 2026 — Q2', value: 'In Progress', color: 'text-cyan-100' },
      { label: 'FY 2026 — Q1', value: 'Completed', color: 'text-green-100' },
      { label: 'FY 2025 — Q4', value: 'Completed', color: 'text-green-100' },
    ],
  },
  {
    title: 'ISA 315-Inspired Risk View',
    subtitle: 'Risk heatmap with inherent and residual risk mapping',
    gradient: 'from-emerald-600/30 via-teal-600/20 to-cyan-600/30',
    gradientBg: 'from-emerald-500/15 via-teal-500/10 to-cyan-500/15',
    badge: 'Risk Assessment',
    elements: [
      { label: 'High Risks', value: '3', color: 'text-red-100' },
      { label: 'Medium Risks', value: '5', color: 'text-amber-100' },
      { label: 'Low Risks', value: '4', color: 'text-green-100' },
    ],
  },
  {
    title: 'Financial Red Flag Intelligence',
    subtitle: 'Automated anomaly detection across financial statements',
    gradient: 'from-rose-600/30 via-orange-600/20 to-amber-600/30',
    gradientBg: 'from-rose-500/15 via-orange-500/10 to-amber-500/15',
    badge: 'Financial Analyzer',
    elements: [
      { label: 'Anomalies', value: '6', color: 'text-red-100' },
      { label: 'Ratios Analyzed', value: '14', color: 'text-cyan-100' },
      { label: 'Risk Score', value: '72/100', color: 'text-amber-100' },
    ],
  },
  {
    title: 'Audit Copilot Chat',
    subtitle: 'AI assistant for audit procedures and documentation',
    gradient: 'from-sky-600/30 via-blue-600/20 to-indigo-600/30',
    gradientBg: 'from-sky-500/15 via-blue-500/10 to-indigo-500/15',
    badge: 'AI Copilot',
    elements: [
      { label: 'Procedures', value: 'Generated', color: 'text-cyan-100' },
      { label: 'Confidence', value: '94%', color: 'text-green-100' },
      { label: 'Tokens Used', value: '2.4K', color: 'text-slate-100' },
    ],
  },
  {
    title: 'Planning Memo Assistant',
    subtitle: 'AI-drafted planning memos with ISA compliance checks',
    gradient: 'from-teal-600/30 via-cyan-600/20 to-blue-600/30',
    gradientBg: 'from-teal-500/15 via-cyan-500/10 to-blue-500/15',
    badge: 'Planning Memo',
    elements: [
      { label: 'Memos Created', value: '8', color: 'text-cyan-100' },
      { label: 'Compliance', value: 'ISA 315', color: 'text-green-100' },
      { label: 'Status', value: 'Draft', color: 'text-amber-100' },
    ],
  },
];

function MockBrowserFrame({ children, gradientBg }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 shadow-lg shadow-black/30 backdrop-blur-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-[10px] text-slate-400/60 text-center">
          app.auditiqpro.com
        </div>
      </div>
      {/* Content area */}
      <div className={`bg-gradient-to-br ${gradientBg} p-5`}>
        {children}
      </div>
    </div>
  );
}

function PlaceholderChart({ elements }) {
  return (
    <div className="space-y-3">
      {elements.map((el) => (
        <div key={el.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-xs">
          <span className="text-slate-400">{el.label}</span>
          <span className={`font-semibold ${el.color}`}>{el.value}</span>
        </div>
      ))}
      {/* Mock bar chart */}
      <div className="mt-3 flex items-end gap-1.5 pt-3 border-t border-white/8">
        {[35, 55, 25, 70, 45, 60, 30].map((h, i) => (
          <div
            key={i}
            className="w-full rounded-t-sm bg-cyan-400/30 transition-all hover:bg-cyan-400/50"
            style={{ height: `${h * 0.6}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function ScreenshotCard({ item, index }) {
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
          delay: index * 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-400/5"
    >
      {/* Badge */}
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-cyan-200/70">
        <span className={`inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
        {item.badge}
      </div>

      {/* Mock browser frame */}
      <MockBrowserFrame gradient={item.gradient} gradientBg={item.gradientBg}>
        {/* Card header inside browser */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
          <p className="mt-0.5 text-[11px] text-slate-400/80">{item.subtitle}</p>
        </div>

        {/* Placeholder chart / data */}
        <PlaceholderChart elements={item.elements} />

        {/* Gradient overlay mock "screen" */}
        <div className={`mt-4 h-16 rounded-lg bg-gradient-to-br ${item.gradient} opacity-40`} />
      </MockBrowserFrame>
    </div>
  );
}

export default function ProductShowcase() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        '[data-showcase-heading]',
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
    <section ref={sectionRef} className="mt-12">
      <div className="mb-10 text-center" data-showcase-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Product showcase</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          See AuditIQ Pro in Action
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          Explore the core audit workflows powered by AI, automation, and structured audit intelligence.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {screenshots.map((item, index) => (
          <ScreenshotCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}
