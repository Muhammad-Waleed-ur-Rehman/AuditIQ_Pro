export default function SectionCard({ title, subtitle, children, action, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
