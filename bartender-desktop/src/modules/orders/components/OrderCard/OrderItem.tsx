import type { OrderItem as IOrderItem } from "../../types/order";
import { CheckCircle2, Circle, AlertCircle, Zap } from "lucide-react";

interface Props {
  item: IOrderItem;
  status: string;
  onSelect?: (item: any) => void;
  isActive?: boolean;
}

const statusConfig = {
  pending: {
    color: "text-white/50",
    bg: "bg-white/5",
    border: "border-white/10",
    icon: <Circle size={12} className="fill-current" />
  },
  preparing: {
    color: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-300/25",
    icon: <Zap size={14} className="animate-pulse" />
  },
  ready: {
    color: "text-gold-light",
    bg: "bg-gold/10",
    border: "border-gold/30",
    icon: <CheckCircle2 size={14} />
  },
  served: {
    color: "text-cyan-200",
    bg: "bg-cyan-300/10",
    border: "border-cyan-300/25",
    icon: <CheckCircle2 size={14} />
  },
  cancelled: {
    color: "text-red-400",
    bg: "bg-red/10",
    border: "border-red/30",
    icon: <AlertCircle size={14} />
  }
};

export default function OrderItem({ item, onSelect, isActive }: Props) {
  const itemStatus = (item.status as string) || "pending";
  const config = statusConfig[itemStatus as keyof typeof statusConfig] || statusConfig.pending;
  const isCancelled = itemStatus === "cancelled";
  const isReady = itemStatus === "ready" || itemStatus === "served";
  const itemAny = item as any;

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group/item
        ${isActive 
          ? "bg-gold/10 border-gold/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-gold/25"
        }
        ${isCancelled ? "opacity-40 grayscale" : ""}
      `}
    >
      <div className="flex items-center justify-center relative">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${config.bg} ${config.border} ${config.color}`}>
          {config.icon}
        </div>
        {item.quantity > 1 && (
          <div className="absolute -top-1 -right-1 bg-gold-light text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-black">
            {item.quantity}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold uppercase tracking-tight truncate ${isCancelled ? 'line-through text-white/30' : 'text-white group-hover/item:text-gold-light transition-colors'}`}>
          {(item.product as any)?.name || "Producto desconocido"}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
            {itemStatus === "pending" ? "Pendiente" : 
             itemStatus === "preparing" ? "Preparando" :
             itemStatus === "ready" ? "Listo" :
             itemStatus === "served" ? "Servido" : "Cancelado"}
          </span>
        </div>
        {itemAny.notes && (
          <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mt-1">
            ! {itemAny.notes}
          </p>
        )}
      </div>

      {isReady && !isCancelled && (
        <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider ${config.bg} ${config.color} ${config.border}`}>
          LISTO
        </div>
      )}
    </div>
  );
}
