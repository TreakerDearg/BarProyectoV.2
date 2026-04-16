"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} from "@/services/reservationService";
import { getTables } from "@/services/tableService";
import { Reservation, Table } from "@/types/reservation";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    date: "",
    guests: "",
    tableId: "",
  });

  const loadData = async () => {
    try {
      const [reservationsData, tablesData] = await Promise.all([
        getReservations(),
        getTables(),
      ]);

      setReservations(reservationsData);
      setTables(tablesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!form.customerName || !form.date || !form.tableId) return;

    try {
      await createReservation({
        ...form,
        guests: Number(form.guests),
      });

      setForm({
        customerName: "",
        customerPhone: "",
        date: "",
        guests: "",
        tableId: "",
      });

      loadData();
    } catch (error) {
      console.error("Error al crear la reservación:", error);
    }
  };

  const updateStatus = async (
    id: string,
    status: Reservation["status"]
  ) => {
    try {
      await updateReservationStatus(id, status);
      loadData();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const deleteReservationById = async (id: string) => {
    try {
      await deleteReservation(id);
      loadData();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl neon-text mb-6">RESERVACIONES</h1>

      {/* CREAR RESERVACIÓN */}
      <div className="card mb-6 flex flex-wrap gap-2">
        <input
          className="input"
          placeholder="Nombre"
          value={form.customerName}
          onChange={(e) =>
            setForm({ ...form, customerName: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Teléfono"
          value={form.customerPhone}
          onChange={(e) =>
            setForm({ ...form, customerPhone: e.target.value })
          }
        />

        <input
          className="input"
          type="datetime-local"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <input
          className="input"
          type="number"
          placeholder="Personas"
          value={form.guests}
          onChange={(e) =>
            setForm({ ...form, guests: e.target.value })
          }
        />

        <select
          className="input"
          value={form.tableId}
          onChange={(e) =>
            setForm({ ...form, tableId: e.target.value })
          }
        >
          <option value="">Seleccionar Mesa</option>
          {tables.map((t) => (
            <option key={t._id} value={t._id}>
              Mesa {t.number} ({t.capacity} personas)
            </option>
          ))}
        </select>

        <button
          onClick={handleCreate}
          className="bg-[var(--neon-purple)] px-4 py-2 rounded"
        >
          + Crear
        </button>
      </div>

      {/* LISTA DE RESERVACIONES */}
      <div className="flex flex-col gap-4">
        {reservations.map((r) => (
          <div key={r._id} className="card">
            <p className="neon-cyan font-bold">{r.customerName}</p>
            <p className="text-sm">{r.customerPhone}</p>
            <p className="text-sm">
              {new Date(r.date).toLocaleString()}
            </p>
            <p className="text-sm">
              Mesa: {r.tableId?.number ?? "No asignada"}
            </p>
            <p className="text-sm">Personas: {r.guests}</p>
            <p className="text-sm">Estado: {r.status}</p>

            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                onClick={() => updateStatus(r._id, "confirmed")}
                className="btn"
              >
                Confirmar
              </button>
              <button
                onClick={() => updateStatus(r._id, "cancelled")}
                className="btn"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteReservationById(r._id)}
                className="text-red-400"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}