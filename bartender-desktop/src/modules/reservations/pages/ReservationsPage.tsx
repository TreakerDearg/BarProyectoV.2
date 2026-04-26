import { useEffect, useState, useMemo } from "react";
import { RefreshCcw, Loader2, Plus } from "lucide-react";

import ReservationForm from "../components/ReservationForm";
import ReservationCard from "../components/ReservationCard";

import {
  getReservations,
  createReservation,
  updateReservationStatus,
} from "../services/reservationService";

import type { Reservation } from "../types/reservation";
import socket from "../../../services/socket";

/* =========================
   NORMALIZER
========================= */
const normalizeReservations = (data: any): Reservation[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.reservations)) return data.reservations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/* =========================
   PAGE
========================= */
export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     FETCH
  ========================= */
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getReservations();
      setReservations(normalizeReservations(data));
    } catch (err: any) {
      setError(err.message || "Error loading reservations");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    fetchReservations();
  }, []);

  /* =========================
     SOCKETS (REALTIME)
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
     ACTIONS
  ========================= */
  const handleSave = async (reservation: any) => {
    try {
      await createReservation(reservation);
      setIsModalOpen(false);
      setSelectedReservation(null);
    } catch (err: any) {
      setError(err.message || "Error creating reservation");
    }
  };

  const handleSeat = async (id: string) => {
    try {
      await updateReservationStatus(id, "seated");
    } catch {
      setError("Error seating reservation");
    }
  };

  /* =========================
     SORT + GROUP
  ========================= */
  const sortedReservations = useMemo(() => {
    return [...reservations].sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    );
  }, [reservations]);

  const grouped = useMemo(() => {
    return {
      arrivals: sortedReservations.filter(
        (r) =>
          r.status === "pending" ||
          r.status === "confirmed"
      ),
      seated: sortedReservations.filter(
        (r) => r.status === "seated"
      ),
      done: sortedReservations.filter(
        (r) =>
          r.status === "completed" ||
          r.status === "cancelled"
      ),
    };
  }, [sortedReservations]);

  /* =========================
     STATS
  ========================= */
  const total = sortedReservations.length;
  const seated = grouped.seated.length;
  const pending = grouped.arrivals.length;

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex flex-col h-full bg-void text-white space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black">
            RESERVATION BOARD
          </h1>
          <p className="text-xs text-gray-500">
            Real-time host control panel
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchReservations}
            className="p-2 border border-obsidian rounded-lg"
          >
            <RefreshCcw size={16} />
          </button>

          {/* 🔥 CREATE */}
          <button
            onClick={() => {
              setSelectedReservation(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-black font-bold rounded-lg text-xs tracking-widest"
          >
            <Plus size={14} />
            NEW BOOKING
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
      <div className="grid grid-cols-3 gap-4">
        <Stat label="TOTAL" value={total} />
        <Stat label="SEATED" value={seated} />
        <Stat label="ARRIVALS" value={pending} />
      </div>

      {/* BOARD */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">

          {/* ARRIVALS */}
          <Column title="ARRIVALS">
            {grouped.arrivals.map((r) => (
              <ReservationCard
                key={r._id}
                r={r}
                onSeat={handleSeat}
                onClick={() => {
                  setSelectedReservation(r);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </Column>

          {/* SEATED */}
          <Column title="SEATED">
            {grouped.seated.map((r) => (
              <ReservationCard
                key={r._id}
                r={r}
                onClick={() => {
                  setSelectedReservation(r);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </Column>

          {/* FINISHED */}
          <Column title="FINISHED">
            {grouped.done.map((r) => (
              <ReservationCard key={r._id} r={r} />
            ))}
          </Column>

        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <ReservationForm
          reservation={selectedReservation}
          onSave={async (data) => {
            await handleSave(data);
            fetchReservations(); // 🔥 refresh
          }}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}

/* =========================
   UI HELPERS
========================= */
function Column({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs text-gray-400 tracking-widest">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="p-4 border border-obsidian rounded-lg">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}