import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileText,
  ListChecks,
  FileOutput,
  Clipboard,
  Bot,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: FileText,
    title: 'AI Working Paper Generator',
    input: 'Risk assessments, financial findings, entity details',
    output: 'Populated working papers organized by assertion with cross-referenced evidence',
    example: '"Cash and cash equivalents — assessed at low inherent risk. Confirmed via bank confirmations and reconciled to GL."',
  },
  {
    icon: ListChecks,
    title: 'AI Audit Procedure Generator',
    input: 'Identified risks, account balances, assertions mapped',
    output: 'Step-by-step procedures with sample sizes, testing methods, and evidence requirements',
    example: '"Test existence of PPE: select 15 additions from fixed asset register, vouch to supplier invoice and physical inspection."',
  },
  {
    icon: FileOutput,
    title: 'AI Management Letter Generator',
    input: 'Control deficiencies, findings, auditor recommendations',
    output: 'Formatted management letter with severity ratings and remediation guidance',
    example: '"Segregation of duties deficiency — IT access provisioning. Recommendation: implement dual-approval workflow."',
  },
  {
    icon: Clipboard,
    title: 'AI Planning Memo Generator',
    input: 'Engement scope, timelines, team structure, risk areas',
    output: 'Comprehensive planning memo aligned with ISA 315 requirements',
    example: '"Engement scope: FY 2026 consolidated audit. Key risks identified: revenue recognition (3 streams), goodwill impairment."',
  },
  {
    icon: Bot,
    title: 'AI Audit Copilot',
    input: 'Natural language questions about audit guidance, risks, or procedures',
    output: 'Context-aware answers drawn from audit framework knowledge and your project data',
    example: '"What procedures are appropriate for related party transactions?" → list of 6 procedures with ISA 550 references.',
  },
  {
    icon: BookOpen,
    title: 'AI Knowledge Hub',
    input: 'Search queries across audit frameworks, past engagements, and firm guidance',
    output: 'Curated snippets with source references and relevance scoring',
    example: '"ISA 315 risk assessment requirements" → summary of identification, assessment, and documentation steps.',
  },
  {
    icon: AlertTriangle,
    title: 'Financial Red Flag Intelligence',
    input: 'Upload financial statements (P&L, balance sheet, cash flow)',
    output: 'Automated ratio analysis, trend detection, anomaly flags, and risk scoring',
    example: '"Revenue growth 28% vs industry 6% — flag. Receivables days jumped from 38 to 54 — investigate collectibility."',
  },
];

function FeatureCard({ feature, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-400/5"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
            <feature.icon className="h-5 w-5 text-cyan-200" />
          </div>
          <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-amber-200/80">
          <ShieldCheck className="h-3 w-3" />
          Review required
        </span>
      </div>

      {/* Input / Output grid */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2">
          <span className="block text-[9px] uppercase tracking-wider text-slate-500">Input</span>
          <span className="text-slate-300/80">{feature.input}</span>
        </div>
        <div className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] px-3 py-2">
          <span className="block text-[9px] uppercase tracking-wider text-cyan-500/70">Output</span>
          <span className="text-cyan-100/80">{feature.output}</span>
        </div>
      </div>

      {/* Example mini-output */}
      <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-slate-500">
          <ArrowRight className="h-3 w-3 text-cyan-400/60" />
          Example output
        </div>
        <p className="mt-1 text-xs text-slate-400/80 italic leading-relaxed">
          &ldquo;{feature.example}&rdquo;
        </p>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/5 to-blue-500/5 blur-xl" />
      </div>
    </div>
  );
}

export default function AIFeaturesShowcase() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-ai-heading]',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <div className="mb-10 text-center" data-ai-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">AI Capabilities</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          AI Assistance Built for Auditors
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          AuditIQ Pro uses AI to support documentation, risk analysis, planning, and knowledge retrieval while keeping auditor review at the center.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>

      {/* Global disclaimer */}
      <div className="mt-8 rounded-2xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-center text-[11px] text-amber-200/60 backdrop-blur-sm">
        AI outputs are assistance only and must be reviewed by a qualified auditor.
      </div>
    </section>
  );
}
