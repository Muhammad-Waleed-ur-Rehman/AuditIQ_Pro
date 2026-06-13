import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { XCircle, CheckCircle2, Clock, Brain, FileText, LayoutDashboard } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const comparisons = [
  {
    icon: Clock,
    problem: 'Manual audit planning',
    solution: 'AI-generated planning memos',
    solutionSub: 'Automated, structured, and consistent',
  },
  {
    icon: FileText,
    problem: 'Repetitive working paper drafting',
    solution: 'AI-assisted working papers',
    solutionSub: 'Pre-populated with risks and evidence',
  },
  {
    icon: LayoutDashboard,
    problem: 'Spreadsheet-based tracking',
    solution: 'Centralized audit dashboard',
    solutionSub: 'Real-time status, risks, and findings',
  },
  {
    icon: Brain,
    problem: 'Manual risk documentation',
    solution: 'ISA 315-inspired risk visualization',
    solutionSub: 'Heatmap with inherent and residual risk',
  },
  {
    icon: XCircle,
    problem: 'Time-consuming audit procedure design',
    solution: 'AI-generated audit procedures',
    solutionSub: 'Tailored to risks and assertions',
  },
  {
    icon: CheckCircle2,
    problem: 'Scattered audit knowledge',
    solution: 'Audit knowledge hub and copilot',
    solutionSub: 'Ask questions, get guidance instantly',
  },
];

export default function ProblemSolution() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-ps-heading]',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        el.querySelectorAll('.problem-item'),
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        }
      );

      gsap.fromTo(
        el.querySelectorAll('.solution-item'),
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <div className="mb-10 text-center" data-ps-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Comparison</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Built for Real Audit Workflow Problems
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          Traditional audit work is often manual, fragmented, and documentation-heavy. AuditIQ Pro brings structure, automation, and AI assistance into one workspace.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Traditional column */}
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/15">
              <XCircle className="h-5 w-5 text-red-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-100">Traditional Audit</h3>
              <p className="text-[10px] uppercase tracking-widest text-red-200/50">Pain points</p>
            </div>
          </div>
          <div className="space-y-3">
            {comparisons.map((item) => (
              <div key={item.problem} className="problem-item flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <item.icon className="h-4 w-4 shrink-0 text-red-300/60" />
                <span className="text-sm text-slate-200/80">{item.problem}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solution column */}
        <div className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15">
              <CheckCircle2 className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-100">AuditIQ Pro</h3>
              <p className="text-[10px] uppercase tracking-widest text-cyan-200/50">AI-powered solution</p>
            </div>
          </div>
          <div className="space-y-3">
            {comparisons.map((item) => (
              <div key={item.solution} className="solution-item flex items-center gap-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] px-4 py-3">
                <item.icon className="h-4 w-4 shrink-0 text-cyan-300/60" />
                <div>
                  <span className="text-sm text-slate-100">{item.solution}</span>
                  <span className="ml-2 text-[10px] text-cyan-200/50">{item.solutionSub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
