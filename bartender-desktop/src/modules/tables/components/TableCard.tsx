import { Pencil, Trash2, Users } from "lucide-react";
import type { Table } from "../types/table";

interface Props {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
}

const statusStyles = {
  available: "bg-green-500",
  occupied: "bg-red-500",
  reserved: "bg-yellow-500",
  maintenance: "bg-gray-500",
};

const statusLabels = {
  available: "Disponible",
  occupied: "Ocupada",
  reserved: "Reservada",
  maintenance: "Mantenimiento",
};

export default function TableCard({
  table,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-gray-900 p-5 rounded-xl shadow-md text-center">
      <h3 className="text-xl font-bold">Mesa {table.number}</h3>

      <div className="flex justify-center items-center gap-2 mt-2 text-gray-300">
        <Users size={16} />
        <span>{table.capacity} personas</span>
      </div>

      <span
        className={`inline-block mt-3 px-3 py-1 text-sm rounded text-white ${
          statusStyles[table.status]
        }`}
      >
        {statusLabels[table.status]}
      </span>

      {table.location && (
        <p className="text-xs text-gray-400 mt-2">
          📍 {table.location}
        </p>
      )}

      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => onEdit(table)}
          className="p-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => onDelete(table._id!)}
          className="p-2 bg-red-500 rounded hover:bg-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}