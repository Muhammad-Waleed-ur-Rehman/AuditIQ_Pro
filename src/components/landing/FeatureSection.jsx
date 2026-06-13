import { Bot, FileText, Landmark, ShieldCheck, Workflow, PenSquare, BookOpen } from 'lucide-react';

const featureCards = [
  {
    title: 'Risk Assessment Engine',
    description: 'Benchmark exposures, map control weaknesses, and prioritize high-impact audit risks with clear scorecards.',
    icon: ShieldCheck,
    accent: 'from-cyan-400/10 to-blue-500/10'
  },
  {
    title: 'Financial Statement Analyzer',
    description: 'Review ratios, trends, and anomaly signals to surface precise financial insights quickly.',
    icon: Landmark,
    accent: 'from-indigo-400/10 to-violet-500/10'
  },
  {
    title: 'Working Paper Generator',
    description: 'Turn observations into structured working papers with audit-ready framing and evidence prompts.',
    icon: FileText,
    accent: 'from-emerald-400/10 to-cyan-500/10'
  },
  {
    title: 'Audit Procedure Generator',
    description: 'Create tailored procedure maps, assertion coverage, and evidence guidance by engagement area.',
    icon: Workflow,
    accent: 'from-amber-400/10 to-orange-500/10'
  },
  {
    title: 'Management Letter Generator',
    description: 'Turn control weaknesses into professional management letter drafts with AI-powered recommendations.',
    icon: PenSquare,
    accent: 'from-rose-400/10 to-pink-500/10'
  },
  {
    title: 'Planning Memo Assistant',
    description: 'Build engagement planning memos reflecting client background, financial risks, and audit strategy.',
    icon: BookOpen,
    accent: 'from-teal-400/10 to-emerald-500/10'
  },
  {
    title: 'AI Audit Copilot',
    description: 'Ask follow-up questions, refine planning, and accelerate insights without leaving the assurance workspace.',
    icon: Bot,
    accent: 'from-pink-400/10 to-fuchsia-500/10'
  }
];

export default function FeatureSection() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {featureCards.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <article
            key={feature.title}
            className={`feature-card rounded-[28px] border border-white/10 bg-gradient-to-br ${feature.accent} p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/12`}
            data-reveal
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs uppercase tracking-[0.35em] text-cyan-100/80">0{index + 1}</span>
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-200/90">{feature.description}</p>
          </article>
        );
      })}
    </div>
  );
}
