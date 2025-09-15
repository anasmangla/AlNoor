export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-600" role="status" aria-live="polite">
      <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span>{label || 'Loading...'}</span>
    </div>
  );
}

