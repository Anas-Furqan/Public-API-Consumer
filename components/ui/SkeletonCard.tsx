export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 h-6 w-1/2 rounded-full bg-white/10" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded-full bg-white/10" />
        <div className="h-4 w-5/6 rounded-full bg-white/10" />
        <div className="h-4 w-2/3 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
