import { useEffect, useState, useMemo } from "react";
import {
  RefreshCcw,
  Plus,
  LayoutGrid,
  Crown,
  Dices,
  Search,
  ChevronLeft,
  ChevronRight,

} from "lucide-react";

import ReservationForm from "../components/ReservationForm";
import ReservationCard from "../components/ReservationCard";

import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} from "../services/reservationService";

import type { Reservation } from "../types/reservation";
import socket from "../../../services/socket";

const normalizeReservations = (data: any): Reservation[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.reservations)) return data.reservations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

type ViewMode = "pending" | "confirmed" | "history";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* VIEW SYSTEM */
  const [activeView, setActiveView] = useState<ViewMode>("confirmed");
  const [searchQuery, setSearchQuery] = useState("");

  /* PAGINATION SYSTEM */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservations({ 
        page: activeView === "history" ? currentPage : 1, // Paginación solo real para historial? No, mejor todo por ahora
        limit: 100, // Traemos bastantes para el filtro local por ahora
        search: searchQuery 
      });
      
      const data = normalizeReservations(response);
      setReservations(data);
      if (response?.totalPages) setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || "Error al cargar reservaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
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
      setReservations((prev) => prev.filter((r) => r._id !== id));
    };

    socket.on("reservation:update", handleUpdate);
    socket.on("reservation:delete", handleDelete);

    return () => {
      socket.off("reservation:update", handleUpdate);
      socket.off("reservation:delete", handleDelete);
    };
  }, []);

  const handleSave = async (reservation: any) => {
    try {
      await createReservation(reservation);
      setIsModalOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (err: any) {
      setError(err.message || "Error al procesar reserva");
    }
  };

  const handleSeat = async (id: string) => {
    try {
      await updateReservationStatus(id, "seated");
    } catch {
      setError("Error al asignar mesa");
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm("¿Deseas anular esta apuesta / reservación?")) return;
    try {
      await deleteReservation(id);
    } catch (err) {
      setError("No se pudo eliminar la reserva");
    }
  };

  /* FILTERING LOGIC */
  const filteredReservations = useMemo(() => {
    let list = [...reservations];

    // Status Filter
    if (activeView === "pending") {
      list = list.filter(r => r.status === "pending");
    } else if (activeView === "confirmed") {
      list = list.filter(r => r.status === "confirmed" || r.status === "seated");
    } else if (activeView === "history") {
      list = list.filter(r => r.status === "completed" || r.status === "cancelled");
    }

    // Search Filter
    if (searchQuery) {
      list = list.filter(r =>
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerPhone.includes(searchQuery)
      );
    }

    // Sort by Date
    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [reservations, activeView, searchQuery]);

  /* PAGINATION LOGIC */
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on view/search change
  }, [activeView, searchQuery]);

  /* KPI STATS */
  const stats = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    active: reservations.filter(r => r.status === "confirmed" || r.status === "seated").length,
    history: reservations.filter(r => r.status === "completed" || r.status === "cancelled").length
  }), [reservations]);

  return (
    <div className="flex flex-col h-full animate-fade-in space-y-10 p-4 relative overflow-hidden">

      {/* CASINO ATMOSPHERE DECOR */}
      <div className="fixed -top-[10%] -right-[10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-brand/5 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />

      {/* ROYALE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-grad-gold rounded-3xl shadow-gold-glow animate-bounce-slow">
              <Crown className="text-bg" size={32} />
            </div>
            <div>
              <h1 className="text-7xl font-black tracking-tighter text-grad-gold uppercase leading-none drop-shadow-2xl">
                Bóveda
              </h1>
              <p className="text-[11px] font-black text-muted uppercase tracking-[0.6em] ml-1 mt-2 flex items-center gap-2">
                <Dices size={14} className="text-gold opacity-50" />
                Casino System · <span className="text-grad-gold">Royale v2.5</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* SEARCH BAR */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-muted group-focus-within:text-gold transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar apuesta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-3 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-ivory focus:border-gold/40 focus:ring-4 focus:ring-gold/5 outline-none transition-all w-64 md:w-80 group-hover:border-white/10"
            />
          </div>

          <button
            onClick={() => { setSelectedReservation(null); setIsModalOpen(true); }}
            className="btn btn-gold !px-12 !h-16 !rounded-[2rem] shadow-[0_20px_50px_rgba(212,163,64,0.3)] flex items-center gap-4 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={26} className="stroke-[4px] relative z-10" />
            <span className="font-black tracking-[0.2em] text-xs uppercase relative z-10">Realizar Apuesta</span>
          </button>
        </div>
      </div>

      {/* VIEW SYSTEM TABS */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-4">
          <ViewTab
            active={activeView === "pending"}
            onClick={() => setActiveView("pending")}
            label="Por Confirmar"
            count={stats.pending}
            color="ember"
          />
          <ViewTab
            active={activeView === "confirmed"}
            onClick={() => setActiveView("confirmed")}
            label="Confirmadas / En Mesa"
            count={stats.active}
            color="gold"
          />
          <ViewTab
            active={activeView === "history"}
            onClick={() => setActiveView("history")}
            label="Historial / Canceladas"
            count={stats.history}
            color="neutral"
          />
        </div>

        <button onClick={fetchReservations} className="p-3 hover:bg-white/5 rounded-xl transition-all group">
          <RefreshCcw size={20} className={`text-muted group-hover:text-gold ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 flex flex-col gap-10">

        {loading && reservations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
            <div className="spinner mb-8 w-16 h-16" />
            <p className="text-sm font-black tracking-[0.5em] uppercase">Sincronizando Bóveda Royale...</p>
          </div>
        ) : (
          <>
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedItems.map(r => (
                  <ReservationCard
                    key={r._id} r={r}
                    onSeat={handleSeat}
                    onDelete={handleDeleteReservation}
                    onClick={() => { setSelectedReservation(r); setIsModalOpen(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-32 border-2 border-dashed border-white/5 rounded-[4rem]">
                <LayoutGrid size={64} className="mb-6 text-muted" />
                <p className="text-xl font-black uppercase tracking-[0.3em]">Mesa Limpia</p>
                <p className="text-sm mt-2 uppercase tracking-widest">No se encontraron registros para esta vista</p>
              </div>
            )}

            {/* PAGINATION SYSTEM UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-10 border-t border-white/5 mt-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center hover:border-gold/40 hover:text-gold transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex items-center gap-3">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`
                        w-12 h-12 rounded-2xl font-black text-xs transition-all border
                        ${currentPage === i + 1
                          ? 'bg-grad-gold text-bg border-transparent shadow-gold-glow scale-110'
                          : 'bg-surface-3 text-muted border-white/5 hover:border-gold/20'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center hover:border-gold/40 hover:text-gold transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL SYSTEM */}
      {isModalOpen && (
        <ReservationForm
          reservation={selectedReservation}
          onSave={async (data) => { await handleSave(data); }}
          onClose={() => { setIsModalOpen(false); setSelectedReservation(null); }}
        />
      )}
    </div>
  );
}

function ViewTab({ active, onClick, label, count, color }: any) {
  const accentColor = color === 'neutral' ? 'bg-white/10' : `bg-${color}`;

  return (
    <button
      onClick={onClick}
      className={`
        relative px-8 py-5 rounded-3xl transition-all duration-500 group flex items-center gap-4
        ${active ? 'bg-surface-glow border-white/10 shadow-2xl' : 'hover:bg-white/5 border-transparent opacity-60 hover:opacity-100'}
        border
      `}
    >
      <div className={`w-2 h-2 rounded-full ${accentColor} ${active ? 'shadow-glow' : 'opacity-20'}`} />
      <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${active ? 'text-ivory' : 'text-muted'}`}>
        {label}
      </span>
      <span className={`
        px-3 py-1 rounded-lg text-[10px] font-black border border-white/5
        ${active ? 'bg-gold/10 text-gold' : 'bg-black/20 text-muted'}
      `}>
        {count}
      </span>
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-grad-gold rounded-full shadow-gold-glow" />
      )}
    </button>
  );
}