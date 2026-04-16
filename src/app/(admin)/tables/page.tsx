"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getTables,
  createTable,
  deleteTable,
} from "@/services/tableService";
import { Table } from "@/types/table";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    number: "",
    capacity: "",
    location: "indoor",
  });

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
    } catch (error) {
      console.error("Error al cargar mesas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreate = async () => {
    if (!form.number || !form.capacity) return;

    try {
      await createTable({
        number: Number(form.number),
        capacity: Number(form.capacity),
        location: form.location as
          | "indoor"
          | "outdoor"
          | "bar",
      });

      setForm({
        number: "",
        capacity: "",
        location: "indoor",
      });

      loadTables();
    } catch (error) {
      console.error("Error al crear la mesa:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
      loadTables();
    } catch (error) {
      console.error("Error al eliminar la mesa:", error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl neon-text mb-6">MESAS</h1>

      {/* CREAR MESA */}
      <div className="card mb-6 flex flex-wrap gap-2">
        <input
          placeholder="Número"
          type="number"
          value={form.number}
          onChange={(e) =>
            setForm({ ...form, number: e.target.value })
          }
        />

        <input
          placeholder="Capacidad"
          type="number"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: e.target.value })
          }
        />

        <select
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        >
          <option value="indoor">Interior</option>
          <option value="outdoor">Exterior</option>
          <option value="bar">Barra</option>
        </select>

        <button
          onClick={handleCreate}
          className="bg-[var(--neon-purple)] px-4 py-2 rounded"
        >
          + Crear
        </button>
      </div>

      {/* LISTA DE MESAS */}
      {loading ? (
        <p className="text-zinc-400">Cargando mesas...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {tables.map((table) => (
            <div
              key={table._id}
              className="card flex justify-between items-center"
            >
              <div>
                <p className="font-semibold neon-cyan">
                  Mesa #{table.number}
                </p>
                <p className="text-sm text-zinc-400">
                  Capacidad: {table.capacity}
                </p>
                <p className="text-sm text-zinc-400">
                  Ubicación: {table.location}
                </p>
                {table.status && (
                  <p className="text-sm text-zinc-500">
                    Estado: {table.status}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDelete(table._id)}
                className="text-red-400"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}