import { TrendingUp, TrendingDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { MovementEntry, MovementType } from "../types/reward";

interface RedemptionsLogProps {
  movements: MovementEntry[];
}

const TYPE_CONFIG: Record<MovementType, { icon: React.ElementType; color: string; label: string }> = {
  earn:   { icon: TrendingUp,        color: "text-emerald-400", label: "Ganados"   },
  redeem: { icon: TrendingDown,      color: "text-gold",        label: "Canjeados" },
  expire: { icon: RotateCcw,         color: "text-red-400",     label: "Expirados" },
  adjust: { icon: SlidersHorizontal, color: "text-blue-400",    label: "Ajuste"    },
};

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day:    "2-digit",
      month:  "short",
      hour:   "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function RedemptionsLog({ movements }: RedemptionsLogProps) {
  if (!movements.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted">
        <RotateCcw size={28} className="opacity-30" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
          Sin movimientos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {movements.map((m, i) => {
        const config = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.adjust;
        const Icon   = config.icon;
        const isEarn = m.amount > 0;

        return (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
          >
            {/* Icon */}
            <div className={`flex-shrink-0 p-1.5 rounded-lg bg-white/5 ${config.color}`}>
              <Icon size={13} />
            </div>

            {/* Description */}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-ivory truncate">
                {m.description || config.label}
              </p>
              <p className="text-[9px] text-muted uppercase tracking-widest mt-0.5">
                {formatDate(m.createdAt)}
              </p>
            </div>

            {/* Amount */}
            <span
              className={`flex-shrink-0 text-xs font-black ${
                isEarn ? "text-emerald-400" : "text-gold"
              }`}
            >
              {isEarn ? "+" : ""}{m.amount} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}
