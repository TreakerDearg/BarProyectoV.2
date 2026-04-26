import type { DiscountStatsData } from "../types/discounts";

interface Props {
  data: DiscountStatsData;
  loading?: boolean;
}

export default function DiscountStats({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-surface-container border border-white/10 rounded-xl">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Today total</p>
        <p className="text-xl font-bold text-primary">
          {loading ? "..." : `-$${data.todayTotal.toFixed(2)}`}
        </p>
      </div>

      <div className="p-4 bg-surface-container border border-white/10 rounded-xl">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Applied count</p>
        <p className="text-xl font-bold text-white">{loading ? "..." : data.appliedCount}</p>
      </div>

      <div className="p-4 bg-surface-container border border-white/10 rounded-xl">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Average percent</p>
        <p className="text-xl font-bold text-white">
          {loading ? "..." : `${data.averagePercent.toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
}