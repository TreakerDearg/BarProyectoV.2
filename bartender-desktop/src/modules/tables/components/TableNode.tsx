import type { Table } from "../types/table";

const statusStyles = {
  available: "border-green-400 text-green-400",
  occupied: "border-red-400 text-red-400",
  reserved: "border-yellow-400 text-yellow-400",
  maintenance: "border-gray-500 text-gray-500",
};

export default function TableNode({
  table,
  selected,
  onClick,
}: {
  table: Table;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`w-24 h-24 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition
        ${statusStyles[table.status]}
        ${selected ? "ring-2 ring-white" : ""}
      `}
    >
      <span className="font-bold">T-{table.number}</span>
      <span className="text-xs">{table.capacity} pax</span>
    </div>
  );
}