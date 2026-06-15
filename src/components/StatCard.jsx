export default function StatCard({ icon: Icon, label, value, detail, accent = 'brand', onClick }) {
  const accentClasses = {
    brand: 'bg-brand-50 text-brand-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <article
      onClick={onClick}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
        <div className={`rounded-xl p-2.5 ${accentClasses[accent] || accentClasses.brand}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-display text-2xl font-bold text-slate-900">{value}</h3>
        {detail && <p className="text-xs text-slate-500">{detail}</p>}
      </div>
    </article>
  );
}
