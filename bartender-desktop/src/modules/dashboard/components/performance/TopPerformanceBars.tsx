"use client";

import type { TopProduct } from "../../services/dashboardService";
import { ArrowUpRight } from "lucide-react";

interface Props {
  items: TopProduct[];
  color: string;
  bgBar: string;
}

export default function TopPerformanceBars({ items, color, bgBar }: Props) {
  const safeItems = items || [];
  const maxQty = Math.max(...safeItems.map((i) => i.qty), 1);

  if (safeItems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
         <p className="text-[10px] font-black uppercase tracking-widest">Sin Datos de Venta</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {safeItems.map((item, idx) => {
        const percentage = (item.qty / maxQty) * 100;
        return (
          <div key={idx} className="group cursor-default">
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-center gap-3">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{idx + 1}#</span>
                 <p className="text-xs font-black text-ivory uppercase tracking-tighter group-hover:text-gold transition-colors">{item.name}</p>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-ivory tracking-tighter">{item.qty}</span>
                    <ArrowUpRight size={10} className={`${color} opacity-50 group-hover:opacity-100 transition-all`} />
                 </div>
              </div>
            </div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${bgBar}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
