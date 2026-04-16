import { Pencil, Trash2, AlertTriangle } from "lucide-react";
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
  const quantity = Number(item.quantity ?? 0);
  const minStock = Number(item.minStock ?? 0);
  const cost = Number(item.cost ?? 0);

  const lowStock = quantity <= minStock;

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-bold">
        {item.name || "Sin nombre"}
      </h3>

      <p className="text-sm text-gray-400">
        {quantity} {item.unit || ""}
      </p>

      <p className="text-xs text-gray-500">
        Mínimo: {minStock}
      </p>

      {lowStock && (
        <div className="flex items-center gap-2 text-yellow-400 text-xs mt-2">
          <AlertTriangle size={14} />
          Stock bajo
        </div>
      )}

      <p className="text-amber-400 mt-2">
        ${cost.toFixed(2)}
      </p>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onEdit(item)}
          className="p-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => item._id && onDelete(item._id)}
          className="p-2 bg-red-500 rounded hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}