"use client";

export default function KpiSkeleton() {
  return (
    <div className="rounded-2xl border p-5 bg-white/5 border-white/10 animate-pulse">
      <div className="flex justify-between items-start gap-2 mb-4">
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-6 w-12 bg-white/10 rounded" />
      </div>
      <div className="h-10 w-24 bg-white/10 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-32 bg-white/5 rounded" />
        <div className="h-2 w-20 bg-white/5 rounded" />
      </div>
    </div>
  );
}
