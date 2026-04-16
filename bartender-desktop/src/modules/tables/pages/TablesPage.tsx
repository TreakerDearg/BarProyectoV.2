import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import TableCard from "../components/TableCard";
import TableForm from "../components/TableForm";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from "../services/tableService";
import type { Table } from "../types/table";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTables = async () => {
    const data = await getTables();
    setTables(data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSave = async (table: Table) => {
    if (table._id) {
      await updateTable(table._id, table);
    } else {
      await createTable(table);
    }
    setIsModalOpen(false);
    setSelectedTable(null);
    fetchTables();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar mesa?")) {
      await deleteTable(id);
      fetchTables();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mesas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg"
        >
          <Plus size={18} /> Nueva Mesa
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {tables.map((table) => (
          <TableCard
            key={table._id}
            table={table}
            onEdit={(t) => {
              setSelectedTable(t);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isModalOpen && (
        <TableForm
          table={selectedTable}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}