import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  RefreshCcw,
  Plus,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Radar,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import ReservationForm from "../components/ReservationForm";
import ReservationCard from "../components/ReservationCard";
import ReservationActionModal from "../components/ReservationActionModal";
import WhatsappModal from "../components/WhatsappModal";
import MiniCalendarFilter from "../components/MiniCalendarFilter";
import { isSameDay } from "date-fns";

import {
  getReservations,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
} from "../services/reservationService";

import type { Reservation } from "../types/reservation";
import { connectSalonSockets, getMainSocket } from "../../../services/socket";
import SalonFlowTutorial from "../../salon/components/SalonFlowTutorial";
import { useSalonTutorial } from "../../salon/hooks/useSalonTutorial";
import { useSalonUiStore } from "../../../store/salonUiStore";
import "../../../styles/nebula-theme.css";

const normalizeReservations = (data: any): Reservation[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.reservations)) return data.reservations;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

type ViewMode = "pending" | "confirmed" | "history";

function resolveTableId(
  tableId: Reservation["tableId"]
): string | null {
  if (!tableId) return null;
  if (typeof tableId === "string") return tableId;
  return tableId._id ?? null;
}

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salonMode = useSalonUiStore((s) => s.mode);
  const setSalonMode = useSalonUiStore((s) => s.setMode);
  const {
    isOpen: salonTutorialOpen,
    openTutorial: openSalonTutorial,
    closeTutorial: closeSalonTutorial,
    completeTutorial: completeSalonTutorial,
  } = useSalonTutorial(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [postSeatTableId, setPostSeatTableId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [whatsappReservation, setWhatsappReservation] = useState<Reservation | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);

  /* VIEW SYSTEM */
  const [activeView, setActiveView] = useState<ViewMode>("confirmed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterDate, setSelectedFilterDate] = useState<Date | null>(null);
  const [showVIPOnly, setShowVIPOnly] = useState(false);

  /* PAGINATION SYSTEM */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  /* LIVE CLOCK for radar countdowns */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservations({ 
        page: 1,
        limit: 100,
        search: searchQuery 
      });
      
      const data = normalizeReservations(response);
      setReservations(data);
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
    const token = localStorage.getItem("token") || undefined;
    connectSalonSockets(token);
    const socket = getMainSocket();
    if (!socket) return;

    const handleUpdate = (updated: Reservation) => {
      setReservations((prev) => {
        const list = [...prev];
        const index = list.findIndex((r) => r._id === updated._id);
        if (index >= 0) list[index] = updated;
        else list.unshift(updated);
        return list;
      });
    };

    const handleCreated = (created: Reservation) => {
      if (!created?._id) return;
      setReservations((prev) => {
        if (prev.some((r) => r._id === created._id)) return prev;
        return [created, ...prev];
      });
    };

    const handleDelete = (id: string) => {
      setReservations((prev) => prev.filter((r) => r._id !== id));
    };

    socket.on("reservation:update", handleUpdate);
    socket.on("reservation:created", handleCreated);
    socket.on("reservation:delete", handleDelete);

    return () => {
      socket.off("reservation:update", handleUpdate);
      socket.off("reservation:created", handleCreated);
      socket.off("reservation:delete", handleDelete);
    };
  }, []);

  /* =========================
     SAVE HANDLER (CREATE or EDIT)
  ========================= */
  const handleSave = async (data: any) => {
    try {
      if (data._id) {
        // EDIT MODE: Use PUT
        await updateReservation(data._id, data);
      } else {
        // CREATE MODE: Use POST
        await createReservation(data);
      }
      setIsFormOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (err: any) {
      setError(err.message || "Error al procesar reserva");
      throw err; // Re-throw so the form can display the error
    }
  };

  /* =========================
     ACTION MODAL HANDLERS
  ========================= */
  const handleStatusChange = async (id: string, status: Reservation["status"]) => {
    try {
      const before = reservations.find((r) => r._id === id);
      await updateReservationStatus(id, status);
      setIsActionModalOpen(false);
      setSelectedReservation(null);
      await fetchReservations();
      if (status === "seated") {
        const tid = resolveTableId(before?.tableId);
        if (tid) setPostSeatTableId(tid);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al cambiar estado";
      setError(msg);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta reservación permanentemente?")) return;
    try {
      await deleteReservation(id);
      setIsActionModalOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (err) {
      setError("No se pudo eliminar la reserva");
    }
  };

  const handleEditFromModal = () => {
    // Close action modal, open form in edit mode
    setIsActionModalOpen(false);
    setIsFormOpen(true);
  };

  const handleOpenWhatsapp = (reservation: Reservation) => {
    setWhatsappReservation(reservation);
    setIsWhatsappOpen(true);
  };

  const handleCardClick = (r: Reservation) => {
    setSelectedReservation(r);
    setIsActionModalOpen(true);
  };

  /* =========================
     TIMELINE RADAR DATA
  ========================= */
  useEffect(() => {
    const h = searchParams.get("highlight");
    if (h) {
      setHighlightId(h);
      const t = setTimeout(() => setHighlightId(null), 8000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const radarReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return reservations
      .filter(r => {
        if (r.status !== "pending" && r.status !== "confirmed") return false;
        const start = new Date(r.startTime);
        return start >= today && start < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 8); // Show max 8 entries
  }, [reservations]);

  /* =========================
     FILTERING LOGIC
  ========================= */
  const filteredReservations = useMemo(() => {
    let list = [...reservations];

    // Status Filter
    if (activeView === "pending") {
      list = list.filter(r => r.status === "pending");
    } else if (activeView === "confirmed") {
      list = list.filter(r => r.status === "confirmed" || r.status === "seated");
    } else if (activeView === "history") {
      list = list.filter(r => r.status === "completed" || r.status === "cancelled" || r.status === "no-show");
    }

    // VIP Filter
    if (showVIPOnly) {
      list = list.filter(r => r.isVIP);
    }

    // Search Filter
    if (searchQuery) {
      list = list.filter(r =>
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerPhone.includes(searchQuery)
      );
    }

    // MiniCalendar Date Filter
    if (selectedFilterDate) {
      list = list.filter(r => isSameDay(new Date(r.startTime), selectedFilterDate));
    }

    // Sort by Date
    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [reservations, activeView, searchQuery, selectedFilterDate, showVIPOnly]);

  /* PAGINATION LOGIC */
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on view/search/date change
  }, [activeView, searchQuery, selectedFilterDate]);

  /* KPI STATS */
  const stats = useMemo(() => ({
    total: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    active: reservations.filter(r => r.status === "confirmed" || r.status === "seated").length,
    history: reservations.filter(r => r.status === "completed" || r.status === "cancelled" || r.status === "no-show").length
  }), [reservations]);

  return (
    <div className="nebula-salon-root flex flex-col h-full space-y-6 p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 nebula-aurora pointer-events-none -z-10 opacity-40" />
      <SalonFlowTutorial
        isOpen={salonTutorialOpen}
        onClose={closeSalonTutorial}
        onComplete={completeSalonTutorial}
      />

      {postSeatTableId && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
          <p className="text-sm font-medium">
            Clientes sentados. La mesa ya tiene sesión activa para tomar pedidos.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                navigate(`/tables?table=${postSeatTableId}&order=1`);
                setPostSeatTableId(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold"
            >
              Ir a mesa
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPostSeatTableId(null)}
              className="px-3 py-1.5 text-xs text-muted hover:text-ivory"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-200">
              <Sparkles size={16} />
            </div>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">
              Nebula · Reservas
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ivory tracking-tight">
            Gestión de Reservas
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="nebula-mode-toggle">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg ${salonMode === "simple" ? "active" : "text-muted"}`}
              onClick={() => setSalonMode("simple")}
            >
              Simple
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs rounded-lg ${salonMode === "advanced" ? "active" : "text-muted"}`}
              onClick={() => setSalonMode("advanced")}
            >
              Avanzado
            </button>
          </div>

          <button
            type="button"
            onClick={openSalonTutorial}
            className="btn btn-ghost !px-3 !py-2 rounded-xl border border-white/10 text-xs flex items-center gap-1"
          >
            <HelpCircle size={16} />
            Tutorial
          </button>
          {/* SEARCH BAR */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-muted group-focus-within:text-gold transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-3 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-ivory focus:border-gold/40 focus:ring-4 focus:ring-gold/5 outline-none transition-all w-64 md:w-80 group-hover:border-white/10"
            />
          </div>

          {/* VIP FILTER */}
          <button
            type="button"
            onClick={() => setShowVIPOnly(!showVIPOnly)}
            className={`px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              showVIPOnly
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30 shadow-violet-500/20'
                : 'bg-white/5 text-muted border-white/5 hover:border-white/10'
            }`}
          >
            <Sparkles size={16} className={showVIPOnly ? 'text-violet-300' : 'text-muted'} />
            VIP
          </button>

          <button
            onClick={() => { setSelectedReservation(null); setIsFormOpen(true); }}
            className="btn btn-gold !px-10 !h-14 !rounded-[2rem] shadow-[0_15px_40px_rgba(212,163,64,0.25)] flex items-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={22} className="stroke-[4px] relative z-10" />
            <span className="font-black tracking-[0.2em] text-xs uppercase relative z-10">Nueva Reserva</span>
          </button>
        </div>
      </div>

      {/* ===========================
         📅 AGENDA SEMANAL HORIZONTAL (MINI-CALENDAR)
      =========================== */}
      <MiniCalendarFilter
        reservations={reservations}
        selectedDate={selectedFilterDate}
        onSelectDate={setSelectedFilterDate}
      />

      {/* ===========================
         TIMELINE RADAR — "Radar de Llegadas"
      =========================== */}
      {salonMode === "advanced" && radarReservations.length > 0 && (
        <div className="bg-surface-3/50 border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gold/10 rounded-xl border border-gold/20">
                <Radar size={18} className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-black text-gold uppercase tracking-[0.3em]">Radar de Llegadas · Hoy</p>
                <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
                  Próximas {radarReservations.length} reservas en camino
                </p>
              </div>
            </div>
            <div className="text-[9px] text-muted font-black uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              En vivo
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {radarReservations.slice(0, 6).map((r) => {
              const startTime = new Date(r.startTime);
              const diffMs = startTime.getTime() - now.getTime();
              const diffMin = Math.floor(diffMs / (60 * 1000));
              const isLate = diffMin < -15;
              const isOverdue = diffMin < 0 && diffMin >= -15;
              const isImminent = diffMin >= 0 && diffMin <= 15;

              const timeLabel = diffMin > 60
                ? `Llega en ${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
                : diffMin > 0
                ? `Llega en ${diffMin} min`
                : diffMin === 0
                ? "¡LLEGANDO AHORA!"
                : diffMin >= -15
                ? `Esperando ${Math.abs(diffMin)} min`
                : `⚠️ ${Math.abs(diffMin)} MIN ATRASADO`;

              const timeFormatted = startTime.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

              return (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => handleCardClick(r)}
                  className={`
                    p-5 rounded-2xl border transition-all text-left group/radar cursor-pointer
                    ${isLate
                      ? 'bg-red-500/10 border-red-500/20 hover:border-red-500/40 animate-pulse'
                      : isOverdue
                      ? 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'
                      : isImminent
                      ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-surface-4/50 border-white/5 hover:border-white/15'
                    }
                  `}
                >
                  {/* Name & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black text-ivory uppercase tracking-wider truncate max-w-[140px]">
                      {r.customerName}
                    </p>
                    {r.isVIP && (
                      <Sparkles size={14} className="text-violet-300 shrink-0" />
                    )}
                  </div>

                  {/* Arrival Badge */}
                  <div className={`
                    text-xs font-black uppercase tracking-wider mb-3
                    ${isLate ? 'text-red-400' : isOverdue ? 'text-amber-400' : isImminent ? 'text-emerald-400' : 'text-muted'}
                  `}>
                    {timeLabel}
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted font-bold uppercase tracking-widest">
                      <Clock size={12} className="text-gold/50" />
                      {timeFormatted}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted font-bold">
                      <Users size={12} className="text-gold/50" />
                      {r.guests}
                    </div>
                  </div>

                  {/* Quick Action Strip */}
                  <div className="flex gap-2 mt-4 opacity-0 group-hover/radar:opacity-100 transition-opacity">
                    {(r.status === "pending" || r.status === "confirmed") && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(r._id!, "seated");
                          }}
                          className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-colors"
                          title="Sentar al cliente"
                        >
                          <CheckCircle2 size={12} className="inline mr-1" />
                          Sentar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(r._id!, "no-show");
                          }}
                          className="flex-1 py-2 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-500/20 transition-colors"
                          title="Marcar como no asistió"
                        >
                          <XCircle size={12} className="inline mr-1" />
                          No-Show
                        </button>
                      </>
                    )}
                    {/* WhatsApp button */}
                    {(r.status === "pending" || r.status === "confirmed") && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenWhatsapp(r);
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-500/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20 active:scale-90 shadow-md"
                        title="Enviar confirmación por WhatsApp"
                      >
                        <MessageCircle size={18} className="fill-current text-emerald-500 hover:text-emerald-400" />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          {salonMode === "advanced" && (
            <ViewTab
              active={activeView === "history"}
              onClick={() => setActiveView("history")}
              label="Historial"
              count={stats.history}
              color="neutral"
            />
          )}
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
            <p className="text-sm font-semibold text-muted">Cargando reservas…</p>
          </div>
        ) : (
          <>
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedItems.map(r => (
                  <ReservationCard
                    key={r._id}
                    r={r}
                    highlighted={highlightId === r._id}
                    onSeat={(id) => handleStatusChange(id, "seated")}
                    onDelete={handleDeleteReservation}
                    onWhatsapp={handleOpenWhatsapp}
                    onClick={() => handleCardClick(r)}
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
                  className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center hover:border-gold/40 hover:text-gold transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-3">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`
                        w-10 h-10 rounded-xl font-black text-xs transition-all border
                        ${currentPage === i + 1
                          ? 'bg-grad-gold text-bg border-transparent shadow-gold-glow scale-105'
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
                  className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center hover:border-gold/40 hover:text-gold transition-all disabled:opacity-20 disabled:pointer-events-none"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===========================
         MODAL: RESERVATION ACTION MODAL (click on card)
      =========================== */}
      {isActionModalOpen && selectedReservation && (
        <ReservationActionModal
          reservation={selectedReservation}
          onClose={() => { setIsActionModalOpen(false); setSelectedReservation(null); }}
          onStatusChange={(status) => handleStatusChange(selectedReservation._id!, status)}
          onEdit={handleEditFromModal}
          onDelete={() => handleDeleteReservation(selectedReservation._id!)}
        />
      )}

      {/* ===========================
         MODAL: RESERVATION FORM (new or edit)
      =========================== */}
        {isFormOpen && (
          <ReservationForm
            reservation={selectedReservation}
            onSave={async (data) => { await handleSave(data); }}
            onClose={() => { setIsFormOpen(false); setSelectedReservation(null); }}
          />
        )}
        {isWhatsappOpen && whatsappReservation && (
          <WhatsappModal
            reservation={whatsappReservation}
            onClose={() => {
              setIsWhatsappOpen(false);
              setWhatsappReservation(null);
            }}
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
        relative px-6 py-4 rounded-2xl transition-all duration-300 group flex items-center gap-3
        ${active ? 'bg-surface-glow border-white/10 shadow-xl' : 'hover:bg-white/5 border-transparent opacity-60 hover:opacity-100'}
        border
      `}
    >
      <div className={`w-2 h-2 rounded-full ${accentColor} ${active ? 'shadow-glow' : 'opacity-20'}`} />
      <span className={`text-xs font-black uppercase tracking-[0.2em] ${active ? 'text-ivory' : 'text-muted'}`}>
        {label}
      </span>
      <span className={`
        px-2.5 py-1 rounded-lg text-[10px] font-black border border-white/5
        ${active ? 'bg-gold/10 text-gold' : 'bg-black/20 text-muted'}
      `}>
        {count}
      </span>
      {active && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-grad-gold rounded-full shadow-gold-glow" />
      )}
    </button>
  );
}