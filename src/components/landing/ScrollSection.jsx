const scrollPanels = [
  {
    eyebrow: '01 — Observe',
    title: 'See risk signals and financial trends in one glance.',
    text: 'The immersive experience uses scroll-based storytelling to highlight how the platform surfaces findings, balances, and anomalies in real audit work.'
  },
  {
    eyebrow: '02 — Analyze',
    title: 'Move from raw numbers to confident audit decisions.',
    text: 'Cards animate upward as the page scrolls, letting the user feel the pace of the product before entering the working dashboard.'
  },
  {
    eyebrow: '03 — Generate',
    title: 'Generate working papers and procedures in the flow of work.',
    text: 'Each section is intentionally full-height so Lenis smooth scrolling and GSAP ScrollTrigger can visibly demonstrate the experience.'
  },
  {
    eyebrow: '04 — Deliver',
    title: 'Present insight-ready output for engagement teams.',
    text: 'The result is a polished, portfolio-grade landing page with a separate dashboard path for production workflows.'
  }
];

export default function ScrollSection() {
  return (
    <div className="space-y-6">
      {scrollPanels.map((panel, index) => (
        <article
          key={panel.eyebrow}
          className="scroll-panel min-h-[92vh] rounded-[32px] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl md:p-10"
          data-reveal
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className="flex h-full flex-col justify-between gap-8 rounded-[28px] border border-white/8 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 md:p-8">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-cyan-100/80">
              <span>{panel.eyebrow}</span>
              <span>0{index + 1}</span>
            </div>
            <div className="max-w-3xl space-y-4">
              <h3 className="text-3xl font-semibold text-white md:text-4xl">{panel.title}</h3>
              <p className="max-w-2xl text-slate-200/90 md:text-lg">{panel.text}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {['Audit visibility', 'AI guidance', 'Clear evidence trails'].map((chip) => (
                <span key={chip} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">{chip}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
