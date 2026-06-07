import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  alert?: boolean;
}

export default function KpiCard({ title, value, trend, trendUp, icon, alert }: KpiCardProps) {
  return (
    <div className={`p-5 rounded-xl bg-surface-3/50 border ${alert ? 'border-red/50 shadow-[0_0_15px_rgba(200,50,40,0.2)]' : 'border-white/5'} relative overflow-hidden group`}>
      {/* Top subtle glow */}
      <div className={`absolute top-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent ${alert ? 'via-red' : 'via-white/20'} to-transparent`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white/5 p-2 rounded-lg border border-white/10">
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-semibold px-2 py-1 rounded bg-white/5 border ${trendUp ? (alert ? 'text-red border-red/20' : 'text-emerald-400 border-emerald-400/20') : 'text-muted border-white/10'}`}>
            {trendUp && !alert ? '↗' : ''} {trend}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-ivory tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
