"use client";

import { useEffect, useState } from "react";
import { createReservation } from "@/services/reservationService";
import { getAvailableTables } from "@/services/tableService";
import { Table } from "@/types/reservation";
import ClientLayout from "@/components/layout/ClientLayout";

export default function ReservationsPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    date: "",
    guests: "",
    tableId: "",
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await getAvailableTables();
      setTables(data);
    } catch (error) {
      console.error("Error cargando mesas:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await createReservation({
        ...form,
        guests: Number(form.guests),
      });

      setSuccess("¡Reservación realizada con éxito!");
      setForm({
        customerName: "",
        customerPhone: "",
        date: "",
        guests: "",
        tableId: "",
      });

      loadTables();
    } catch (error) {
      console.error("Error al crear la reservación:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
        <ClientLayout>
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-zinc-900 border border-cyan-500 rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center neon-text mb-6">
          Reservar una Mesa
        </h1>

        {success && (
          <p className="text-green-400 text-center mb-4">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full p-2 bg-black border border-cyan-500 rounded"
            value={form.customerName}
            onChange={(e) =>
              setForm({ ...form, customerName: e.target.value })
            }
            required
          />

          <input
            type="tel"
            placeholder="Teléfono"
            className="w-full p-2 bg-black border border-cyan-500 rounded"
            value={form.customerPhone}
            onChange={(e) =>
              setForm({ ...form, customerPhone: e.target.value })
            }
            required
          />

          <input
            type="datetime-local"
            className="w-full p-2 bg-black border border-cyan-500 rounded"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Número de personas"
            className="w-full p-2 bg-black border border-cyan-500 rounded"
            value={form.guests}
            onChange={(e) =>
              setForm({ ...form, guests: e.target.value })
            }
            min={1}
            required
          />

          <select
            className="w-full p-2 bg-black border border-cyan-500 rounded"
            value={form.tableId}
            onChange={(e) =>
              setForm({ ...form, tableId: e.target.value })
            }
            required
          >
            <option value="">Seleccionar Mesa</option>
            {tables.map((table) => (
              <option key={table._id} value={table._id}>
                Mesa {table.number} - {table.capacity} personas ({table.location})
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--neon-purple)] py-2 rounded font-semibold hover:opacity-90 transition"
          >
            {loading ? "Reservando..." : "Confirmar Reserva"}
          </button>
        </form>
      </div>
    </div>
    </ClientLayout>
  );
}