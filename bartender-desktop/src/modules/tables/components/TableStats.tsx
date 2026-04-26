import type { Table } from "../types/table";

export default function TableStats({ tables }: { tables: Table[] }) {
  const total = tables.length;
  const occupied = tables.filter(t => t.status === "occupied").length;
  const capacity = tables.reduce((a, t) => a + t.capacity, 0);

  return (
    <div className="grid grid-cols-3 gap-4 border-t pt-4">

      <Stat label="Tables" value={total} />
      <Stat label="Occupied" value={occupied} />
      <Stat label="Capacity" value={capacity} />

    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}