import { useEffect, useState } from "react";
import {
  Play,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import ReservationForm from "../components/ReservationForm";

import {
  getReservations,
  createReservation,
  updateReservationStatus,
  getAvailableTables,
} from "../services/reservationService";

import type { Reservation } from "../types/reservation";
import socket from "../../../services/socket";

/* =========================
   NORMALIZER SAFE
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
  const [, setLoadingTables] = useState(false);

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
      setError(err.message || "Error Loading Reservations");
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
     SOCKETS
  ========================= */
  useEffect(() => {
    const handleList = (data: any) => {
      setReservations(normalizeReservations(data));
    };

    const handleUpdate = (updated: Reservation) => {
      setReservations((prev) => {
        const list = [...prev];
        const index = list.findIndex((r) => r._id === updated._id);

        if (index >= 0) list[index] = updated;
        else list.unshift(updated);

        return list;
      });
    };

    const handleDelete = (id: string) => {
      setReservations((prev) =>
        prev.filter((r) => r._id !== id)
      );
    };

    socket.on("reservation:list", handleList);
    socket.on("reservation:update", handleUpdate);
    socket.on("reservation:delete", handleDelete);

    return () => {
      socket.off("reservation:list", handleList);
      socket.off("reservation:update", handleUpdate);
      socket.off("reservation:delete", handleDelete);
    };
  }, []);

  /* =========================
     SAVE
  ========================= */
  const handleSave = async (reservation: any) => {
    try {
      await createReservation(reservation);
      setIsModalOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (err: any) {
      setError(err.message || "Error creating reservation");
    }
  };

  /* =========================
     STATUS UPDATE
  ========================= */
  const handleStatus = async (
    id: string,
    status: Reservation["status"]
  ) => {
    try {
      await updateReservationStatus(id, status);
      fetchReservations();
    } catch {
      setError("Error updating status");
    }
  };


  /* =========================
     SORT SAFE
  ========================= */
  const sortedReservations = [...reservations].sort(
    (a, b) =>
      new Date(a.startTime).getTime() -
      new Date(b.startTime).getTime()
  );

  /* =========================
     STATS SAFE
  ========================= */
  const totalBookings = sortedReservations.length;

  const seatedBookings = sortedReservations.filter(
    (r) => r.status === "seated"
  ).length;

  const pendingBookings = sortedReservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed"
  ).length;

  const occupancyRatio =
    totalBookings > 0 ? seatedBookings / totalBookings : 0;

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex flex-col h-full bg-void text-white font-mono space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-1">
            RESERVATIONS
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            CENTRAL COMMAND / NIGHT PHASE 04
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={fetchReservations}
            className="p-2 border border-obsidian rounded-lg"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 text-xs rounded">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* OCCUPATION */}
        <div className="p-6 border border-[#8B5CF6]/40 rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase mb-2">
            LIVE OCCUPATION
          </p>

          <div className="text-5xl font-black">
            {seatedBookings}/{totalBookings}
          </div>

          <div className="flex gap-1 mt-3 h-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-sm ${i < occupancyRatio * 6
                    ? "bg-[#8B5CF6]"
                    : "bg-obsidian"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* TOTAL */}
        <div className="p-6 border border-obsidian rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase mb-2">
            TOTAL BOOKINGS
          </p>
          <div className="text-5xl font-black">{totalBookings}</div>
        </div>

        {/* PENDING */}
        <div className="p-6 border border-obsidian rounded-xl">
          <p className="text-[10px] text-gray-400 uppercase mb-2">
            PENDING ARRIVALS
          </p>
          <div className="text-5xl font-black">{pendingBookings}</div>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : sortedReservations.length === 0 ? (
          <p className="text-gray-500 text-xs">NO RESERVATIONS</p>
        ) : (
          sortedReservations.map((r) => (
            <div key={r._id} className="border p-4 rounded">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{r.customerName}</p>
                  <p className="text-xs text-gray-400">
                    {r.guests} PAX
                  </p>
                </div>

                <button
                  onClick={() => handleStatus(r._id!, "seated")}
                >
                  <Play size={14} />
                </button>
              </div>
            </div>
          ))
        )}
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
    </div>
  );
}