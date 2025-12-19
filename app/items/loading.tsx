export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-7 w-40 rounded bg-white/10" />
      <div className="h-10 w-full rounded bg-white/5" />
      <ul className="space-y-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <li
            key={`items-loading-${index}`}
            className="h-14 rounded border border-slate-700 bg-slate-900"
          />
        ))}
      </ul>
    </div>
  );
}
