"use client";

import { useEffect, useState } from "react";
import { Plus, Play, Loader2, RefreshCcw } from "lucide-react";

import ReservationCard from "../components/ReservationCard";
import ReservationForm from "../components/ReservationForm";

import {
  getReservations,
  createReservation,
  deleteReservation,
  updateReservationStatus,
  getAvailableTables,
} from "../services/reservationService";

import type { Reservation } from "../types/reservation";
import socket from "../../../services/socket";

/* =========================
   NORMALIZER (CRITICAL FIX)
========================= */
const normalizeReservations = (data: any): Reservation[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.reservations)) return data.reservations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH RESERVATIONS
  ========================= */
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getReservations();
      setReservations(normalizeReservations(data));

    } catch (err: any) {
      setError(err.message || "Error cargando reservas");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH TABLES
  ========================= */
  const fetchTables = async (params?: {
    startTime?: string;
    endTime?: string;
    guests?: number;
  }) => {
    try {
      setLoadingTables(true);

      const data = await getAvailableTables(params || {});
      setTables(Array.isArray(data) ? data : []);

    } catch {
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    fetchReservations();
  }, []);

  /* =========================
     SOCKET (CLEAN SINGLE SOURCE)
  ========================= */
  useEffect(() => {
    const handleList = (data: any) => {
      setReservations(normalizeReservations(data));
    };

    const handleUpdate = (data: any) => {
      setReservations((prev) => {
        const list = normalizeReservations(prev);

        const index = list.findIndex(
          (r) => r._id === data._id
        );

        if (index >= 0) {
          list[index] = data;
          return [...list];
        }

        return [data, ...list];
      });
    };

    const handleDelete = (id: string) => {
      setReservations((prev) =>
        normalizeReservations(prev).filter(
          (r) => r._id !== id
        )
      );
    };

    socket.on("reservation:list", handleList);
   socket.on("reservation:update", (updated: Reservation) => {
  setReservations((prev) => {
    if (!Array.isArray(prev)) return [updated];

    return prev.map((r) =>
      r._id === updated._id ? updated : r
    );
  });
});
    socket.on("reservation:delete", handleDelete);

    return () => {
      socket.off("reservation:list", handleList);
      socket.off("reservation:update", handleUpdate);
      socket.off("reservation:delete", handleDelete);
    };
  }, []);

  /* =========================
     CREATE
  ========================= */
  const handleSave = async (reservation: any) => {
    try {
      await createReservation(reservation);
      setIsModalOpen(false);
      setSelectedReservation(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* =========================
     DELETE OPTIMISTIC SAFE
  ========================= */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar reserva?")) return;

    setReservations((prev) =>
      normalizeReservations(prev).filter(
        (r) => r._id !== id
      )
    );

    try {
      await deleteReservation(id);
    } catch {
      setError("Error eliminando reserva");
      fetchReservations();
    }
  };

  /* =========================
     STATUS FLOW
  ========================= */
  const handleStatus = async (
    id: string,
    status: Reservation["status"]
  ) => {
    try {
      await updateReservationStatus(id, status);
    } catch {
      setError("Error actualizando estado");
    }
  };

  /* =========================
     MODAL
  ========================= */
  const openNewReservation = () => {
    setSelectedReservation(null);
    setTables([]);
    setIsModalOpen(true);
  };

  const openEditReservation = (res: Reservation) => {
    setSelectedReservation(res);

    fetchTables({
      startTime: res.startTime,
      endTime: res.endTime,
      guests: res.guests,
    });

    setIsModalOpen(true);
  };

  /* =========================
     SAFE SORT
  ========================= */
  const sortedReservations = Array.isArray(reservations)
    ? [...reservations].sort(
        (a, b) =>
          new Date(b.startTime).getTime() -
          new Date(a.startTime).getTime()
      )
    : [];

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Sistema de Reservas
          </h1>
          <p className="text-gray-400 text-sm">
            Tiempo real + control de mesas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchReservations}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            onClick={openNewReservation}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-semibold"
          >
            <Plus size={18} /> Nueva Reserva
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-amber-500" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && sortedReservations.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No hay reservas aún
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedReservations.map((r) => (
          <div
            key={r._id}
            className="bg-gray-900 rounded-xl p-2"
          >
            <ReservationCard
              reservation={r}
              onEdit={openEditReservation}
              onDelete={handleDelete}
            />

            <div className="flex gap-2 mt-2">

              {r.status === "pending" && (
                <button
                  onClick={() =>
                    handleStatus(r._id!, "confirmed")
                  }
                  className="bg-blue-500 text-black px-2 py-1 rounded text-xs"
                >
                  Confirmar
                </button>
              )}

              {r.status === "confirmed" && (
                <button
                  onClick={() =>
                    handleStatus(r._id!, "seated")
                  }
                  className="bg-green-500 text-black px-2 py-1 rounded text-xs flex items-center gap-1"
                >
                  <Play size={12} />
                  Sentar
                </button>
              )}

              {r.status !== "cancelled" && (
                <button
                  onClick={() =>
                    handleStatus(r._id!, "cancelled")
                  }
                  className="bg-red-500 text-black px-2 py-1 rounded text-xs"
                >
                  Cancelar
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <ReservationForm
          reservation={selectedReservation}
          tables={tables}
          onFetchTables={fetchTables}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReservation(null);
          }}
        />
      )}

      {/* LOADING TABLES */}
      {loadingTables && isModalOpen && (
        <div className="fixed bottom-4 right-4 bg-gray-900 px-4 py-2 rounded-lg text-sm text-gray-300 flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          Buscando mesas...
        </div>
      )}
    </div>
  );
}