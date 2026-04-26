import { Trash2 } from "lucide-react";

export default function OrderActions({
  orderId,
  status,
  onDelete,
  onStatusChange,
}: any) {
  return (
    <div className="mt-auto pt-2 grid grid-cols-2 gap-2">

      {status !== "completed" && (
        <button
          onClick={() => onStatusChange(orderId, "completed")}
          className="col-span-2 w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-black font-black text-xs py-3 rounded"
        >
          MARK_READY
        </button>
      )}

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(orderId, e.target.value as any)
        }
        className="p-2 bg-obsidian rounded text-xs border border-obsidian/60"
      >
        <option value="pending">PENDING</option>
        <option value="in-progress">PROCESSING</option>
        <option value="completed">COMPLETED</option>
        <option value="cancelled">CANCELLED</option>
      </select>

      <button
        onClick={() => onDelete(orderId)}
        className="flex justify-center items-center gap-2 bg-bar-red/10 border border-bar-red/30 text-bar-red p-2 rounded"
      >
        <Trash2 size={14} /> DEL
      </button>
    </div>
  );
}