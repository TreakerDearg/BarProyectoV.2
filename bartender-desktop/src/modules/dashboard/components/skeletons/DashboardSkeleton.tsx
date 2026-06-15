"use client";

import KpiSkeleton from "./KpiSkeleton";
import ChartSkeleton from "./ChartSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full gap-6 md:gap-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/5 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-white/10 rounded-xl" />
          <div className="h-10 w-32 bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* KPI Strip Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton height="320px" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border p-6 bg-white/5 border-white/10">
              <div className="h-6 w-32 bg-white/10 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
            <div className="rounded-2xl border p-6 bg-white/5 border-white/10">
              <div className="h-6 w-32 bg-white/10 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-4 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border p-6 bg-white/5 border-white/10">
            <div className="h-5 w-24 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          </div>
          <div className="rounded-2xl border p-6 bg-white/5 border-white/10">
            <div className="h-5 w-24 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
