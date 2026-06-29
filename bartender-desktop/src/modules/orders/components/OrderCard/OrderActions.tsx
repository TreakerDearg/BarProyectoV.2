import { CheckCircle, Play, Trash2, XCircle, Edit } from "lucide-react";
import type { Order } from "../../types/order";

interface Props {
  orderId: string;
  status: Order["status"];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onEdit?: (id: string) => void;
}

export default function OrderActions({
  orderId,
  status,
  onDelete,
  onStatusChange,
  onEdit,
}: Props) {
  return (
    <div className="flex gap-3 mt-4">
      {status === "pending" && (
        <button
          onClick={() => onStatusChange(orderId, "in-progress")}
          className="flex-1 h-14 rounded-xl bg-gradient-to-br from-cyan-200 to-lime text-bg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-cyan-300/15 border border-cyan-100/30 group"
        >
          <Play size={18} className="fill-current" />
          <span className="text-xs font-black uppercase tracking-widest">PROCESAR</span>
        </button>
      )}

      {status === "in-progress" && (
        <button
          onClick={() => onStatusChange(orderId, "completed")}
          className="flex-1 h-14 rounded-xl bg-gradient-to-br from-gold-light to-gold text-bg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg shadow-gold/25 border border-gold-light/30 group"
        >
          <CheckCircle size={18} />
          <span className="text-xs font-black uppercase tracking-widest">DESPACHAR</span>
        </button>
      )}

      {status === "pending" && onEdit && (
        <button
          onClick={() => onEdit(orderId)}
          className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 hover:bg-gold/10 transition-all group"
          title="Editar items"
        >
          <Edit size={18} />
        </button>
      )}

      <button
        onClick={() => onDelete(orderId)}
        className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-brand hover:border-brand/30 hover:bg-brand/10 transition-all group"
      >
        <Trash2 size={18} />
      </button>

      {status !== "completed" && status !== "cancelled" && (
        <button
          onClick={() => onStatusChange(orderId, "cancelled")}
          className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-red hover:border-red/30 hover:bg-red/10 transition-all group"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
}
