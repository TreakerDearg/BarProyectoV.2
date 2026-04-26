import TableNode from "./TableNode";
import type { Table } from "../types/table";

export default function FloorPlan({
  tables,
  loading,
  selectedTable,
  onSelect,
}: any) {
  return (
    <div className="flex-1 border border-obsidian rounded-xl p-6 relative">

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {tables.map((t: Table) => (
            <TableNode
              key={t._id}
              table={t}
              selected={selectedTable?._id === t._id}
              onClick={() => onSelect(t)}
            />
          ))}
        </div>
      )}

    </div>
  );
}