export default function LoadingSpinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold text-slate-600 ${className}`}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
