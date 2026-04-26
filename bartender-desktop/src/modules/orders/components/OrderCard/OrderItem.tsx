interface Props {
  item: any;
  index: number;
  status: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function OrderItem({
  item,
  index,
  status,
  onClick,
  selected,
}: Props) {
  const product =
    typeof item.product === "object" ? item.product : null;

  const name = product?.name || item.name || "Producto";

  const isCompleted = status === "completed";

  return (
    <div
      onClick={onClick}
      className={`bg-obsidian/30 border rounded p-3 flex items-center gap-4 cursor-pointer transition
        ${
          selected
            ? "border-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.2)]"
            : "border-obsidian hover:border-gray-500"
        }
      `}
    >
      {/* Index */}
      <span
        className={`font-bold text-sm flex-shrink-0 ${
          isCompleted ? "text-bar-green" : "text-[#8B5CF6]"
        }`}
      >
        {(index + 1).toString().padStart(2, "0")}
      </span>

      {/* Name */}
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-wider text-gray-300">
          {name.toUpperCase().replace(/\s+/g, "_")}
        </span>

        {/* Observaciones */}
        {item.notes && (
          <span className="text-[10px] text-yellow-400 italic">
            {item.notes}
          </span>
        )}
      </div>

      {/* Quantity */}
      <span className="ml-auto text-xs text-gray-500">
        x{item.quantity}
      </span>
    </div>
  );
}