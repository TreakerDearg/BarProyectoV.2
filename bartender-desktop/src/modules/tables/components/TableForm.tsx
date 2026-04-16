import { useEffect, useState } from "react";
import type { Table, TableStatus } from "../types/table";

interface Props {
  table?: Table | null;
  onSave: (table: Table) => void;
  onClose: () => void;
}

export default function TableForm({
  table,
  onSave,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<Table>({
    number: 0,
    capacity: 1,
    status: "available",
    location: "",
  });

  useEffect(() => {
    if (table) setFormData(table);
  }, [table]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      number: Number(formData.number),
      capacity: Number(formData.capacity),
      status: formData.status as TableStatus,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-xl w-[400px]"
      >
        <h2 className="text-xl font-bold mb-4">
          {table ? "Editar Mesa" : "Nueva Mesa"}
        </h2>

        <input
          type="number"
          name="number"
          placeholder="Número de Mesa"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.number}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacidad"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.capacity}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="location"
          placeholder="Ubicación"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.location}
          onChange={handleChange}
        />

        <select
          name="status"
          className="w-full p-2 mb-3 rounded bg-gray-800"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="available">Disponible</option>
          <option value="occupied">Ocupada</option>
          <option value="reserved">Reservada</option>
          <option value="maintenance">Mantenimiento</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-black rounded"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}