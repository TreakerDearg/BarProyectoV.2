"use client";

interface Props {
  height?: string;
}

export default function ChartSkeleton({ height = "320px" }: Props) {
  return (
    <div className="rounded-2xl border p-6 bg-white/5 border-white/10 animate-pulse">
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-3 w-32 bg-white/5 rounded" />
        </div>
        <div className="h-8 w-24 bg-white/10 rounded" />
      </div>
      <div className={`w-full bg-white/5 rounded-lg`} style={{ height }} />
    </div>
  );
}
