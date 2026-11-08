"use client";

/**
 * ReservationsPage — Página principal del sistema de reservas.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Layout:
 *   Header: título + acciones
 *   Barra de filtros: tabs + chips de fecha inline + búsqueda + VIP
 *   Radar de llegadas (solo advanced)
 *   Zona principal: grid de cards compactas + panel lateral de detalle
 */
import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw, Plus, Search, ChevronLeft, ChevronRight,
  Clock, Radar, Users, CheckCircle2, XCircle,
  Sparkles, MessageCircle, X, AlertCircle, ArrowRight,
  Calendar,
} from "lucide-react";

import ReservationForm          from "../components/ReservationForm";
import ReservationCard          from "../components/ReservationCard";
import ReservationDetailPanel   from "../components/ReservationDetailPanel";
import ReservationActionModal   from "../components/ReservationActionModal";
import WhatsappModal            from "../components/WhatsappModal";
import { ReservationDateChips } from "../components/MiniCalendarFilter";
import { isSameDay, format }    from "date-fns";
import { es }                   from "date-fns/locale";

import {
  getReservations, createReservation, updateReservation,
  updateReservationStatus, deleteReservation,
} from "../services/reservationService";

import type { Reservation }   from "../types/reservation";
import {
  connectSalonSockets, onReservationCreated,
  onReservationUpdated, onReservationDeleted,
} from "../../../services/socket";
import SalonFlowTutorial  from "../../salon/components/SalonFlowTutorial";
import { useSalonTutorial } from "../../salon/hooks/useSalonTutorial";
import { useSalonUiStore }  from "../../../store/salonUiStore";
import "../../../styles/nebula-theme.css";

type ReservationResponse = Reservation[] | { reservations?: Reservation[]; data?: Reservation[] };

const normalizeReservations = (data: ReservationResponse): Reservation[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).reservations)) return (data as any).reservations;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
};

type ViewMode = "pending" | "confirmed" | "history";

function resolveTableId(tableId: Reservation["tableId"]): string | null {
  if (!tableId) return null;
  if (typeof tableId === "string") return tableId;
  return tableId._id ?? null;
}

/* ── Color por estado para el tab ──────────────────────────── */
const TAB_COLORS: Record<string, string> = {
  pending:   "#FF7B54",
  confirmed: "#F0B429",
  history:   "#566270",
};

export default function ReservationsPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const salonMode      = useSalonUiStore((s) => s.mode);
  const setSalonMode   = useSalonUiStore((s) => s.setMode);
  const {
    isOpen: salonTutorialOpen,
    openTutorial: openSalonTutorial,
    closeTutorial: closeSalonTutorial,
    completeTutorial: completeSalonTutorial,
  } = useSalonTutorial(false);

  const [reservations,         setReservations]         = useState<Reservation[]>([]);
  const [postSeatTableId,      setPostSeatTableId]      = useState<string | null>(null);
  const [highlightId,          setHighlightId]          = useState<string | null>(null);
  const [selectedReservation,  setSelectedReservation]  = useState<Reservation | null>(null);
  const [isFormOpen,           setIsFormOpen]           = useState(false);
  const [isActionModalOpen,    setIsActionModalOpen]    = useState(false);
  const [loading,              setLoading]              = useState(false);
  const [error,                setError]                = useState<string | null>(null);
  const [whatsappReservation,  setWhatsappReservation]  = useState<Reservation | null>(null);
  const [isWhatsappOpen,       setIsWhatsappOpen]       = useState(false);
  const [isMobile,             setIsMobile]             = useState(false);

  const [activeView,           setActiveView]           = useState<ViewMode>("confirmed");
  const [searchQuery,          setSearchQuery]          = useState("");
  const [selectedFilterDate,   setSelectedFilterDate]   = useState<Date | null>(null);
  const [showVIPOnly,          setShowVIPOnly]          = useState(false);
  const [currentPage,          setCurrentPage]          = useState(1);
  const itemsPerPage = 12;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 1024);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* ── Fetch ────────────────────────────────────────────────── */
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getReservations({ page: 1, limit: 100, search: searchQuery });
      setReservations(normalizeReservations(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reservaciones");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  /* ── Sockets ──────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token") || undefined;
    connectSalonSockets(token);

    const getId = (r: Reservation & { id?: string }) => r._id ?? r.id;

    const handleUpdate = (updated: Reservation) => {
      const id = getId(updated);
      if (!id) return;
      setReservations((prev) => {
        const list  = [...prev];
        const index = list.findIndex((r) => getId(r) === id);
        const norm  = { ...updated, _id: id };
        if (index >= 0) list[index] = norm;
        else list.unshift(norm);
        return list;
      });
      setSelectedReservation((prev) => prev && getId(prev) === id ? { ...updated, _id: id } : prev);
    };

    const handleCreated = (created: Reservation) => {
      const id = getId(created);
      if (!id) return;
      setReservations((prev) => {
        if (prev.some((r) => getId(r) === id)) return prev;
        return [{ ...created, _id: id }, ...prev];
      });
    };

    const handleDelete = (payload: string | { id: string }) => {
      const id = typeof payload === "string" ? payload : payload.id;
      setReservations((prev) => prev.filter((r) => getId(r) !== id));
      setSelectedReservation((prev) => prev && getId(prev) === id ? null : prev);
    };

    const cleanups = [
      onReservationCreated((p) => handleCreated(p as unknown as Reservation)),
      onReservationUpdated((p) => handleUpdate(p as unknown as Reservation)),
      onReservationDeleted((p) => handleDelete(p)),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, []);

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleSave = async (data: Partial<Reservation> & { _id?: string }) => {
    try {
      if (data._id) await updateReservation(data._id, data);
      else          await createReservation(data);
      setIsFormOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al procesar reserva");
      throw error;
    }
  };

  const handleStatusChange = async (id: string, status: Reservation["status"]) => {
    try {
      const before = reservations.find((r) => r._id === id);
      await updateReservationStatus(id, status);
      setIsActionModalOpen(false);
      await fetchReservations();
      if (status === "seated") {
        const tid = resolveTableId(before?.tableId);
        if (tid) setPostSeatTableId(tid);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm("¿Eliminar esta reserva permanentemente?")) return;
    try {
      await deleteReservation(id);
      setIsActionModalOpen(false);
      setSelectedReservation(null);
      fetchReservations();
    } catch {
      setError("No se pudo eliminar la reserva");
    }
  };

  const handleEditFromModal = () => {
    setIsActionModalOpen(false);
    setIsFormOpen(true);
  };

  const handleCardClick = (r: Reservation) => {
    setSelectedReservation(r);
    if (isMobile) setIsActionModalOpen(true);
  };

  const handleOpenWhatsapp = (r: Reservation) => {
    setWhatsappReservation(r);
    setIsWhatsappOpen(true);
  };

  /* ── Deep-link highlight ──────────────────────────────────── */
  useEffect(() => {
    const h = searchParams.get("highlight");
    if (h) {
      setHighlightId(h);
      const t = setTimeout(() => setHighlightId(null), 8000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  /* ── Radar ────────────────────────────────────────────────── */
  const radarReservations = useMemo(() => {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return reservations
      .filter((r) => {
        if (r.status !== "pending" && r.status !== "confirmed") return false;
        const s = new Date(r.startTime);
        return s >= today && s < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 8);
  }, [reservations]);

  /* ── Filtrado ─────────────────────────────────────────────── */
  const filteredReservations = useMemo(() => {
    let list = [...reservations];
    if      (activeView === "pending")   list = list.filter((r) => r.status === "pending");
    else if (activeView === "confirmed") list = list.filter((r) => r.status === "confirmed" || r.status === "seated");
    else if (activeView === "history")   list = list.filter((r) => r.status === "completed" || r.status === "cancelled" || r.status === "no-show");
    if (showVIPOnly) list = list.filter((r) => r.isVIP);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.customerName.toLowerCase().includes(q) || r.customerPhone.includes(q));
    }
    if (selectedFilterDate) {
      list = list.filter((r) => isSameDay(new Date(r.startTime), selectedFilterDate));
    }
    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [reservations, activeView, searchQuery, selectedFilterDate, showVIPOnly]);

  const totalPages    = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [activeView, searchQuery, selectedFilterDate]);

  /* ── Stats ────────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total:     reservations.length,
    pending:   reservations.filter((r) => r.status === "pending").length,
    active:    reservations.filter((r) => r.status === "confirmed" || r.status === "seated").length,
    history:   reservations.filter((r) => r.status === "completed" || r.status === "cancelled" || r.status === "no-show").length,
  }), [reservations]);

  const TABS: { view: ViewMode; label: string; count: number }[] = [
    { view: "pending",   label: "Por Confirmar",        count: stats.pending },
    { view: "confirmed", label: "Confirmadas / En Mesa", count: stats.active  },
    ...(salonMode === "advanced" ? [{ view: "history" as ViewMode, label: "Historial", count: stats.history }] : []),
  ];

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: "#0D1117", color: "#E6EDF3" }}>

      <SalonFlowTutorial isOpen={salonTutorialOpen} onClose={closeSalonTutorial} onComplete={completeSalonTutorial} />

      {/* ── HEADER ────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 pt-5 pb-4 flex items-center justify-between gap-4"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: "rgba(163,113,247,0.12)", border: "1px solid rgba(163,113,247,0.25)", color: "#A371F7" }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#566270" }}>
              Bartender · Reservas
            </p>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: "#E6EDF3" }}>
              Gestión de Reservas
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle modo */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#1C2333", border: "1px solid #30363D" }}>
            {(["simple", "advanced"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSalonMode(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize"
                style={{
                  background:  salonMode === m ? "rgba(240,180,41,0.15)" : "transparent",
                  color:       salonMode === m ? "#F0B429"               : "#566270",
                  border:      salonMode === m ? "1px solid rgba(240,180,41,0.30)" : "1px solid transparent",
                }}
              >
                {m === "simple" ? "Simple" : "Avanzado"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchReservations}
            className="p-2.5 rounded-xl transition-colors"
            style={{ border: "1px solid #30363D", color: "#8B949E" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
            title="Sincronizar"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={() => { setSelectedReservation(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: "#F0B429", color: "#0D1117", boxShadow: "0 0 20px rgba(240,180,41,0.25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
          >
            <Plus size={15} /> Nueva reserva
          </button>
        </div>
      </div>

      {/* ── BARRA DE FILTROS ──────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-wrap items-center gap-0 px-6"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        {/* Tabs de estado */}
        {TABS.map((tab) => {
          const isActive = activeView === tab.view;
          const color    = TAB_COLORS[tab.view] ?? "#566270";
          return (
            <button
              key={tab.view}
              type="button"
              onClick={() => setActiveView(tab.view)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative"
              style={{
                color:        isActive ? color : "#566270",
                borderBottom: isActive ? `3px solid ${color}` : "3px solid transparent",
                marginBottom: "-1px",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                  style={{
                    background: isActive ? `${color}20` : "#21283A",
                    color:      isActive ? color         : "#566270",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Separador */}
        <div className="w-px h-5 mx-3 flex-shrink-0" style={{ background: "#30363D" }} />

        {/* Chips de fecha inline */}
        <ReservationDateChips
          reservations={reservations}
          selectedDate={selectedFilterDate}
          onSelectDate={setSelectedFilterDate}
        />

        {/* Controles a la derecha */}
        <div className="ml-auto flex items-center gap-2 py-2">
          {/* Búsqueda */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#566270" }} />
            <input
              type="text"
              placeholder="Buscar nombre o teléfono…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-colors"
              style={{ background: "#1C2333", border: "1px solid #30363D", color: "#E6EDF3", width: 200 }}
              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
              onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
            />
          </div>

          {/* VIP toggle */}
          <button
            type="button"
            onClick={() => setShowVIPOnly(!showVIPOnly)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background:  showVIPOnly ? "rgba(163,113,247,0.15)" : "#1C2333",
              border:      `1px solid ${showVIPOnly ? "rgba(163,113,247,0.35)" : "#30363D"}`,
              color:       showVIPOnly ? "#A371F7" : "#566270",
            }}
          >
            <Sparkles size={12} />
            VIP
          </button>
        </div>
      </div>

      {/* ── BANNERS ───────────────────────────────────────── */}
      {error && (
        <div
          className="flex-shrink-0 mx-6 mt-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.30)", color: "#FF6B63" }}
        >
          <span className="flex items-center gap-2"><AlertCircle size={14} /> {error}</span>
          <button type="button" onClick={() => setError(null)}><X size={13} /></button>
        </div>
      )}

      {postSeatTableId && (
        <div
          className="flex-shrink-0 mx-6 mt-3 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.25)", color: "#3FB950" }}
        >
          <p className="text-xs font-medium">Clientes sentados. Mesa con sesión activa para pedidos.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { navigate(`/tables?table=${postSeatTableId}&order=1`); setPostSeatTableId(null); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ background: "rgba(63,185,80,0.15)", color: "#3FB950" }}
            >
              Ir a mesa <ArrowRight size={12} />
            </button>
            <button type="button" onClick={() => setPostSeatTableId(null)} style={{ color: "#566270" }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── RADAR DE LLEGADAS (solo advanced) ─────────────── */}
      {salonMode === "advanced" && radarReservations.length > 0 && (
        <div
          className="flex-shrink-0 mx-6 mt-3 rounded-xl p-4"
          style={{ background: "#161B22", border: "1px solid #30363D" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(240,180,41,0.12)", color: "#F0B429" }}>
              <Radar size={13} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: "#F0B429" }}>
              Radar de llegadas · Hoy
            </p>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3FB950] animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#566270" }}>En vivo</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {radarReservations.slice(0, 4).map((r) => {
              const startTime = new Date(r.startTime);
              const diffMs    = startTime.getTime() - now.getTime();
              const diffMin   = Math.floor(diffMs / 60000);
              const isLate     = diffMin < -15;
              const isOverdue  = diffMin < 0 && diffMin >= -15;
              const isImminent = diffMin >= 0 && diffMin <= 15;
              const timeLabel  = diffMin > 60 ? `En ${Math.floor(diffMin / 60)}h ${diffMin % 60}m` : diffMin > 0 ? `En ${diffMin} min` : diffMin === 0 ? "¡Ahora!" : diffMin >= -15 ? `Esp. ${Math.abs(diffMin)} min` : `${Math.abs(diffMin)} min atrasado`;

              return (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => handleCardClick(r)}
                  className="text-left p-3 rounded-xl transition-all"
                  style={{
                    background:  isLate ? "rgba(248,81,73,0.10)" : isOverdue ? "rgba(255,123,84,0.10)" : isImminent ? "rgba(63,185,80,0.10)" : "#21283A",
                    border:      `1px solid ${isLate ? "rgba(248,81,73,0.25)" : isOverdue ? "rgba(255,123,84,0.25)" : isImminent ? "rgba(63,185,80,0.25)" : "#30363D"}`,
                  }}
                >
                  <p className="text-xs font-bold truncate" style={{ color: "#E6EDF3" }}>{r.customerName}</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: isLate ? "#F85149" : isOverdue ? "#FF7B54" : isImminent ? "#3FB950" : "#8B949E" }}>
                    {timeLabel}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px]" style={{ color: "#566270" }}>
                      {format(startTime, "HH:mm", { locale: es })} hs
                    </span>
                    <span className="text-[10px]" style={{ color: "#566270" }}>
                      {r.guests} inv.
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ZONA PRINCIPAL ────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Grid de cards */}
        <div
          className="flex-1 min-w-0 overflow-y-auto p-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
        >
          {loading && reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ opacity: 0.4 }}>
              <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(240,180,41,0.30)", borderTopColor: "#F0B429" }} />
              <p className="text-sm font-medium" style={{ color: "#566270" }}>Cargando reservas…</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ opacity: 0.35 }}>
              <Calendar size={40} style={{ color: "#566270" }} />
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
                Sin reservas en este filtro
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-4">
                {paginatedItems.map((r) => (
                  <ReservationCard
                    key={r._id}
                    r={r}
                    selected={selectedReservation?._id === r._id}
                    highlighted={highlightId === r._id}
                    onClick={() => handleCardClick(r)}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4" style={{ borderTop: "1px solid #30363D" }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ background: "#1C2333", border: "1px solid #30363D", color: "#8B949E" }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className="w-9 h-9 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background:  currentPage === page ? "#F0B429" : "#1C2333",
                        border:      `1px solid ${currentPage === page ? "transparent" : "#30363D"}`,
                        color:       currentPage === page ? "#0D1117"  : "#8B949E",
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                    style={{ background: "#1C2333", border: "1px solid #30363D", color: "#8B949E" }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Panel lateral de detalle (desktop) */}
        <AnimatePresence>
          {!isMobile && (
            <motion.div
              key="detail-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex flex-col flex-shrink-0"
              style={{ width: 340, borderLeft: "1px solid #30363D" }}
            >
              <ReservationDetailPanel
                reservation={selectedReservation}
                onClose={() => setSelectedReservation(null)}
                onStatusChange={handleStatusChange}
                onEdit={() => { setIsFormOpen(true); }}
                onDelete={handleDeleteReservation}
                onWhatsapp={handleOpenWhatsapp}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODALES ───────────────────────────────────────── */}
      {/* Modal de acción (mobile) */}
      {isActionModalOpen && selectedReservation && (
        <ReservationActionModal
          reservation={selectedReservation}
          onClose={() => { setIsActionModalOpen(false); setSelectedReservation(null); }}
          onStatusChange={(status) => handleStatusChange(selectedReservation._id!, status)}
          onEdit={handleEditFromModal}
          onDelete={() => handleDeleteReservation(selectedReservation._id!)}
          onWhatsapp={handleOpenWhatsapp}
        />
      )}

      {/* Formulario lateral */}
      {isFormOpen && (
        <ReservationForm
          reservation={selectedReservation}
          onSave={async (data) => { await handleSave(data); }}
          onClose={() => { setIsFormOpen(false); setSelectedReservation(null); }}
        />
      )}

      {/* WhatsApp */}
      {isWhatsappOpen && whatsappReservation && (
        <WhatsappModal
          reservation={whatsappReservation}
          onClose={() => { setIsWhatsappOpen(false); setWhatsappReservation(null); }}
        />
      )}
    </div>
  );
}
