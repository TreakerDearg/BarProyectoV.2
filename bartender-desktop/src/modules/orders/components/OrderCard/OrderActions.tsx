import { CheckCircle, Play, Trash2, XCircle } from "lucide-react";
import type { Order } from "../../types/order";

interface Props {
  orderId: string;
  status: Order["status"];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
}

export default function OrderActions({
  orderId,
  status,
  onDelete,
  onStatusChange,
}: Props) {
  return (
    <div className="flex gap-3 mt-4">
      {status === "pending" && (
        <button
          onClick={() => onStatusChange(orderId, "in-progress")}
          className="flex-1 h-14 rounded-xl bg-lime text-bg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-lime/20 group"
        >
          <Play size={18} className="fill-current" />
          <span className="text-xs font-black uppercase tracking-widest">PROCESAR</span>
        </button>
      )}

      {status === "in-progress" && (
        <button
          onClick={() => onStatusChange(orderId, "completed")}
          className="flex-1 h-14 rounded-xl bg-gold text-bg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/20 group"
        >
          <CheckCircle size={18} />
          <span className="text-xs font-black uppercase tracking-widest">DESPACHAR</span>
        </button>
      )}

      <button
        onClick={() => onDelete(orderId)}
        className="w-14 h-14 rounded-xl bg-surface-4 border border-white/5 flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 hover:bg-brand/10 transition-all group"
      >
        <Trash2 size={18} />
      </button>

      {status !== "completed" && status !== "cancelled" && (
        <button
          onClick={() => onStatusChange(orderId, "cancelled")}
          className="w-14 h-14 rounded-xl bg-surface-4 border border-white/5 flex items-center justify-center text-muted hover:text-red hover:border-red/30 hover:bg-red/10 transition-all group"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
}