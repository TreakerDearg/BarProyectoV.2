import { ReactNode } from "react";

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
    <div className={`p-5 rounded-xl bg-void border ${alert ? 'border-bar-red/50 shadow-[0_0_15px_rgba(200,50,40,0.2)]' : 'border-obsidian/40'} relative overflow-hidden group`}>
      {/* Top subtle glow */}
      <div className={`absolute top-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent ${alert ? 'via-bar-red' : 'via-obsidian/80'} to-transparent`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="bg-obsidian/50 p-2 rounded-lg border border-obsidian/60">
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-semibold px-2 py-1 rounded bg-obsidian/30 border ${trendUp ? (alert ? 'text-bar-red border-bar-red/20' : 'text-bar-green border-bar-green/20') : 'text-gray-400 border-gray-600/20'}`}>
            {trendUp && !alert ? '↗' : ''} {trend}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
