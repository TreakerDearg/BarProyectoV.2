import { Pencil, Trash2, AlertTriangle, Package } from "lucide-react";
import type { InventoryItem } from "../types/inventory";

interface Props {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export default function InventoryCard({
  item,
  onEdit,
  onDelete,
}: Props) {
  const stock = Number(item.stock ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const maxStock = Number(item.maxStock ?? 100);
  const cost = Number(item.cost ?? 0);

  const percent = Math.min((stock / maxStock) * 100, 100);

  const status =
    stock <= minStock
      ? "critical"
      : stock <= minStock * 2
      ? "low"
      : "ok";

  const styles = {
    critical: {
      text: "text-red-400",
      bar: "bg-red-500",
      badge: "bg-red-500/10 border-red-500/30",
    },
    low: {
      text: "text-yellow-400",
      bar: "bg-yellow-500",
      badge: "bg-yellow-500/10 border-yellow-500/30",
    },
    ok: {
      text: "text-emerald-400",
      bar: "bg-emerald-500",
      badge: "bg-emerald-500/10 border-emerald-500/30",
    },
  }[status];

  return (
    <div className="group relative bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Package size={16} className="text-gray-400" />
            {item.name || "Sin nombre"}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {item.category} • {item.sector} • {item.location}
          </p>
        </div>

        <span
          className={`text-[10px] px-2 py-1 rounded-full border ${styles.badge} ${styles.text} font-semibold`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {/* STOCK */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Stock</span>
          <span className="text-white font-medium">
            {stock} {item.unit}
          </span>
        </div>

        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${styles.bar}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Mín: {minStock}</span>
          <span>Máx: {maxStock}</span>
        </div>
      </div>

      {/* ALERT */}
      {status === "critical" && (
        <div className="flex items-center gap-2 text-red-400 text-xs mt-3">
          <AlertTriangle size={14} />
          Reposición urgente
        </div>
      )}

      {/* COST */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-amber-400 font-semibold text-sm">
          ${cost.toFixed(2)}
        </span>

        <span className="text-xs text-gray-500">
          costo unitario
        </span>
      </div>

      {/* ACTIONS (HOVER REVEAL STYLE) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => onEdit(item)}
          className="p-2 bg-blue-500/20 hover:bg-blue-500 rounded-lg text-blue-300 hover:text-white transition"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={() => item._id && onDelete(item._id)}
          className="p-2 bg-red-500/20 hover:bg-red-500 rounded-lg text-red-300 hover:text-white transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}