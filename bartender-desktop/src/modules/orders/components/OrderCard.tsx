import {
  Trash2,
  Clock,
  AlertCircle,
  Coffee,
  Utensils,
} from "lucide-react";
import type { Order } from "../types/order";

interface Props {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => void;
  onSelectItem?: (item: any) => void;
  selectedItemId?: string;
}

/* =========================
   STATUS UI MAP
========================= */
const statusConfig = {
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "in-progress": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  completed: "text-green-400 bg-green-500/10 border-green-500/20",
  cancelled: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function OrderCard({
  order,
  onDelete,
  onStatusChange,
  onSelectItem,
  selectedItemId,
}: Props) {
  const orderId = order._id ?? "";

  const tableNumber =
    typeof order.table === "object"
      ? (order.table as any)?.number
      : null;
  const tableLabel = tableNumber ?? `XX`;

  const isBar = order.items.some(i => i.type === "drink" || (typeof i.product === "object" && i.product?.type === "drink"));
  const typeBadge = isBar ? "BAR_ACTIVE" : "KITCHEN";

  return (
    <div className="bg-void border border-obsidian/60 rounded-xl p-5 shadow-glass flex flex-col relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full transition ${order.status === 'completed' ? 'bg-bar-green' : 'bg-[#8B5CF6] group-hover:shadow-[0_0_15px_#8B5CF6]'}`} />
      
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs text-gray-400 tracking-widest font-bold">
          ORD_{orderId.slice(-4).toUpperCase()}
        </span>
        <span className={`px-2 py-0.5 rounded text-[9px] tracking-widest font-bold border ${order.status === 'completed' ? 'border-bar-green/30 bg-bar-green/10 text-bar-green' : 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]'}`}>
          {order.status === 'completed' ? 'COMPLETED' : typeBadge}
        </span>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider mb-1 text-white">MESA_{tableLabel}</h2>
          <p className="text-xs text-gray-500 tracking-widest">
            S_ID: {order.sessionId?.slice(-6).toUpperCase() || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${order.status === 'completed' ? 'text-bar-green' : 'text-[#8B5CF6]'}`}>--:--</p>
          <p className={`text-[9px] tracking-widest uppercase ${order.status === 'completed' ? 'text-bar-green' : 'text-[#8B5CF6]'}`}>
            {order.status}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {order.items?.map((item, i) => {
          const product = typeof item.product === "object" ? item.product : null;
          const name = product?.name || item.name || "Producto";
          
          return (
            <div 
              key={item._id || i} 
              onClick={() => onSelectItem?.(item)}
              className={`bg-obsidian/30 border hover:border-gray-500 rounded p-3 flex items-center gap-4 cursor-pointer transition ${selectedItemId === item._id ? 'border-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.2)]' : 'border-obsidian'}`}
            >
              <span className={`${order.status === 'completed' ? 'text-bar-green' : 'text-[#8B5CF6]'} font-bold text-sm flex-shrink-0`}>
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <span className="text-sm font-bold tracking-wider text-gray-300">
                {name.toUpperCase().replace(/\s+/g, '_')}
              </span>
              <span className="ml-auto text-xs text-gray-500">x{item.quantity}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
        {order.status !== 'completed' && (
          <button 
            onClick={() => handleStatusChange("completed")}
            className="col-span-2 w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-black font-black tracking-widest text-xs py-3 rounded transition shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            MARK_READY
          </button>
        )}
        
        <select
          value={order.status}
          onChange={(e) => onStatusChange(orderId, e.target.value as Order["status"])}
          className="col-span-1 w-full p-2 bg-obsidian rounded text-xs border border-obsidian/60 text-gray-400 font-mono"
        >
          <option value="pending">PENDING</option>
          <option value="in-progress">PROCESSING</option>
          <option value="completed">COMPLETED</option>
          <option value="cancelled">CANCELLED</option>
        </select>

        <button
          onClick={() => onDelete(orderId)}
          className="col-span-1 w-full flex justify-center items-center gap-2 bg-bar-red/10 border border-bar-red/30 text-bar-red p-2 rounded hover:bg-bar-red/20 transition text-xs font-mono"
        >
          <Trash2 size={14} /> DEL
        </button>
      </div>
    </div>
  );

  function handleStatusChange(status: Order["status"]) {
    onStatusChange(orderId, status);
  }
}