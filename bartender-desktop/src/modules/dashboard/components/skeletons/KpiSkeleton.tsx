"use client";

export default function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-5 animate-pulse">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="h-3 w-20 bg-[#21283A] rounded-full" />
        <div className="h-5 w-12 bg-[#21283A] rounded-lg" />
      </div>
      <div className="h-10 w-24 bg-[#21283A] rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="h-2.5 w-32 bg-[#21283A] rounded-full" />
        <div className="h-2 w-20 bg-[#21283A] rounded-full" />
      </div>
    </div>
  );
}
