import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function AlertMessage({ type = 'info', title, message, className = '' }) {
  const styles = {
    error: 'border-red-100 bg-red-50 text-red-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-100 bg-amber-50 text-amber-700',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`rounded-xl border p-3 text-xs shadow-sm ${styles[type]} ${className}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          {title && <p className="font-semibold">{title}</p>}
          {message && <p className="mt-0.5 text-[11px] leading-relaxed">{message}</p>}
        </div>
      </div>
    </div>
  );
}
