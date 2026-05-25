import type { OrderItem as IOrderItem } from "../../types/order";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface Props {
  item: IOrderItem;
  status: string;
  onSelect?: (item: any) => void;
  isActive?: boolean;
}

export default function OrderItem({ item, onSelect, isActive }: Props) {
  const isCancelled = (item.status as string) === "cancelled";
  const isReady = item.status === "ready" || (item.status as string) === "served";
  const itemAny = item as any;

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={`
        flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group/item
        ${isActive 
          ? "bg-gold/10 border-gold/40 shadow-gold-glow" 
          : "bg-surface-3/50 border-white/5 hover:bg-surface-4 hover:border-white/10"
        }
        ${isCancelled ? "opacity-30 grayscale" : ""}
      `}
    >
      <div className="flex items-center justify-center relative">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
          isReady ? 'bg-lime/10 border-lime text-lime' : 
          isCancelled ? 'border-muted text-muted' : 
          'border-gold/30 text-gold/30'
        }`}>
          {isReady ? <CheckCircle2 size={16} /> : isCancelled ? <AlertCircle size={16} /> : <Circle size={12} className="fill-current" />}
        </div>
        {item.quantity > 1 && (
          <div className="absolute -top-1 -right-1 bg-gold text-bg text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-bg">
            {item.quantity}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isCancelled ? 'line-through text-muted' : 'text-ivory group-hover/item:text-gold transition-colors'}`}>
          {(item.product as any)?.name || "Producto desconocido"}
        </h4>
        {itemAny.notes && (
          <p className="text-[10px] text-ember font-black uppercase tracking-widest mt-1 animate-pulse">
            ! {itemAny.notes}
          </p>
        )}
      </div>

      {isReady && !isCancelled && (
        <div className="badge badge-lime text-[8px] py-1 px-2 uppercase tracking-widest font-black">LISTO</div>
      )}
    </div>
  );
}