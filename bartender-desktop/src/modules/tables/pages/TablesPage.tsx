"use client";

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, RefreshCcw, AlertCircle, X, Sparkles, HelpCircle,
  LayoutGrid, Box, Layers, Map, Grid3X3,
  Users, Activity, DollarSign, CheckCircle2, Clock,
} from "lucide-react";

import {
  getTables, createTable, updateTable, deleteTable,
  openTable, closeTable, getTablePayments, generateReceipt,
  updateTableLayout, createSessionCheckout,
  PaymentServiceError, getPaymentErrorMessage,
  type SessionCheckoutResult,
} from "../services/tableService";

import type { Table } from "../types/table";
import { connectSalonSockets, getMainSocket } from "../../../services/socket";

import FloorPlan    from "../components/FloorPlan";
import TableInspector from "../components/TableInspector";
import TableStats   from "../components/TableStats";
import TableForm    from "../components/TableForm";
import OrderForm    from "../../orders/components/OrderForm";
import PaymentHistory from "../components/PaymentHistory";
import ReceiptModal from "../components/ReceiptModal";
import TableAnalyticsDashboard from "../components/TableAnalyticsDashboard";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import SalonNextStepBanner from "../../salon/components/SalonNextStepBanner";
import SalonFlowTutorial from "../../salon/components/SalonFlowTutorial";
import { useSalonTutorial } from "../../salon/hooks/useSalonTutorial";
import { useTablesUiStore, type TablesMode } from "../../../store/tablesUiStore";
import { updateReservationStatus } from "../../reservations/services/reservationService";
import "../../../styles/nebula-theme.css";

// ── Mode toggle ───────────────────────────────────────────────────

const MODE_OPTIONS: { value: TablesMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "basic",    label: "Básico",    icon: <Box     size={14} />, desc: "Estado y acciones rápidas" },
  { value: "standard", label: "Estándar",  icon: <Layers  size={14} />, desc: "Totales, código y órdenes"  },
  { value: "advanced", label: "Avanzado",  icon: <Activity size={14} />, desc: "KPIs y analytics completos" },
];

function ModeToggle({ mode, onChange }: { mode: TablesMode; onChange: (m: TablesMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-1">
      {MODE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
            mode === opt.value
              ? "bg-gold/20 text-gold border border-gold/30"
              : "text-muted hover:text-ivory"
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── KPI box ───────────────────────────────────────────────────────

function KPIBox({
  label, value, icon, colorCls, pulse,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  colorCls: string; pulse?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border bg-surface-3/50 flex items-center gap-3 ${colorCls}`}>
      <div className={`p-2 rounded-xl ${colorCls} ${pulse ? "animate-pulse" : ""}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted uppercase tracking-widest truncate">{label}</p>
        <p className="text-xl font-bold text-ivory leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────

export default function TablesPage() {
  const [tables,         setTables]         = useState<Table[]>([]);
  const [selectedTable,  setSelectedTable]  = useState<Table | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [isOrderOpen,    setIsOrderOpen]    = useState(false);
  const [isFormOpen,     setIsFormOpen]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isReceiptModalOpen,   setIsReceiptModalOpen]   = useState(false);
  const [isAnalyticsOpen,      setIsAnalyticsOpen]      = useState(false);
  const [isPaymentSelectorOpen,setIsPaymentSelectorOpen]= useState(false);
  const [payments,       setPayments]       = useState<any[]>([]);
  const [selectedReceipt,setSelectedReceipt]= useState<any>(null);
  const [sessionBalanceDue, setSessionBalanceDue] = useState(0);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [isMobile,       setIsMobile]       = useState(false);
  const [isInspectorOpen,setIsInspectorOpen]= useState(false);
  const [activeLocation, setActiveLocation] = useState<string>("all");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { mode, setMode, view, setView, toggleView } = useTablesUiStore();
  const {
    isOpen: salonTutorialOpen,
    openTutorial: openSalonTutorial,
    closeTutorial: closeSalonTutorial,
    completeTutorial: completeSalonTutorial,
  } = useSalonTutorial(true);

  // ── Resize ────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 1024);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTables();
      setTables(data || []);
    } catch (err: any) {
      setError("Error al sincronizar mesas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  // ── Socket.IO ─────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token") || undefined;
    connectSalonSockets(token);
    const socket = getMainSocket();
    if (!socket) return;

    const handleUpdate = (updated: Table) => {
      setTables((prev) => prev.map((t) => t._id === updated._id ? updated : t));
      if (selectedTable?._id === updated._id) setSelectedTable(updated);
    };
    const handleCreated = (t: Table) => setTables((prev) => [...prev, t]);
    const handleDeleted = (payload: string | { tableId?: string; _id?: string }) => {
      const id = typeof payload === "string" ? payload : payload?.tableId ?? payload?._id;
      if (!id) return;
      setTables((prev) => prev.filter((t) => t._id !== id));
      if (selectedTable?._id === id) setSelectedTable(null);
    };

    socket.on("table:update",  handleUpdate);
    socket.on("table:created", handleCreated);
    socket.on("table:deleted", handleDeleted);
    socket.on("table:closed",  fetchTables);
    socket.on("payment:completed", fetchTables);

    return () => {
      socket.off("table:update",  handleUpdate);
      socket.off("table:created", handleCreated);
      socket.off("table:deleted", handleDeleted);
      socket.off("table:closed",  fetchTables);
      socket.off("payment:completed", fetchTables);
    };
  }, [selectedTable]);

  // Abrir inspector en mobile cuando se selecciona mesa
  useEffect(() => {
    if (selectedTable && isMobile) setIsInspectorOpen(true);
    if (selectedTable) {
      // Actualizar total corriente
    }
  }, [selectedTable, isMobile]);

  // Deep-link desde searchParams
  useEffect(() => {
    const tableId = searchParams.get("table");
    if (!tableId || tables.length === 0) return;
    const t = tables.find((x) => x._id === tableId);
    if (t) {
      setSelectedTable(t);
      if (searchParams.get("order") === "1") setIsOrderOpen(true);
    }
  }, [searchParams, tables]);

  // ── CRUD ──────────────────────────────────────────────────────
  const handleOpen = async (id: string) => {
    const table = tables.find((t) => t._id === id);
    if (!table)                          return setError("Mesa no encontrada");
    if (table.status === "occupied")     return setError("Esta mesa ya está abierta");
    if (table.status === "maintenance")  return setError("Mesa en mantenimiento");
    if (table.status === "reserved")     return seatTableReservation(table);

    try {
      // openTable ahora devuelve la tabla con tableCode y currentSessionId ya adjuntos
      const updated = await openTable(id);
      setSelectedTable(updated);
      setTables((prev) => prev.map((t) => t._id === id ? updated : t));
      setIsOrderOpen(true);
    } catch (err: any) {
      setError(err?.message ?? "Error al abrir la mesa");
    }
  };

  const seatTableReservation = async (table: Table) => {
    if (!table.currentReservation) return setError("Sin reserva vinculada");
    try {
      setError(null);
      await updateReservationStatus(String(table.currentReservation), "seated");
      const list = await getTables();
      setTables(list);
      const updated = list.find((t) => t._id === table._id);
      if (updated) { setSelectedTable(updated); setIsOrderOpen(true); }
    } catch (err: any) {
      setError(err?.message ?? "No se pudo sentar la reserva");
    }
  };

  const handleClose = async (id: string) => {
    const table = tables.find((t) => t._id === id);
    if (!table)                       return setError("Mesa no encontrada");
    if (table.status !== "occupied")  return setError("Solo puedes cerrar mesas ocupadas");

    const totalAmount = table.orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;
    const totalPaid   = table.totalPayments || 0;
    if (totalAmount > 0 && totalPaid < totalAmount) {
      if (!confirm(`Saldo pendiente $${(totalAmount - totalPaid).toFixed(2)}. ¿Cerrar igual?`)) return;
    }
    try { await closeTable(id); } catch (err: any) { setError("Error al cerrar mesa"); }
  };

  const handleSave = async (tableData: Table) => {
    if (!tableData.number || tableData.number <= 0) return setError("Número de mesa requerido");
    if (!tableData.capacity || tableData.capacity <= 0) return setError("Capacidad requerida");
    if (!tableData.location) return setError("Ubicación requerida");
    if (!tableData._id && tables.some((t) => t.number === tableData.number)) {
      return setError(`Mesa #${tableData.number} ya existe`);
    }
    try {
      if (tableData._id) await updateTable(tableData._id, tableData);
      else               await createTable(tableData);
      setIsFormOpen(false);
      fetchTables();
    } catch (err: any) { setError("Error al guardar la mesa"); }
  };

  const handleDelete = async (id: string) => {
    const table = tables.find((t) => t._id === id);
    if (!table) return setError("Mesa no encontrada");
    if (table.status === "occupied")  return setError("Cierra la mesa antes de eliminarla");
    if (table.status === "reserved")  return setError("Cancela la reserva antes de eliminarla");
    if (!confirm(`¿Eliminar Mesa #${table.number}? Esta acción no se puede deshacer.`)) return;
    try { await deleteTable(id); setSelectedTable(null); }
    catch (err: any) { setError("Error al eliminar la mesa"); }
  };

  const handleTableLayoutChange = async (id: string, x: number, y: number) => {
    setTables((prev) => prev.map((t) => t._id === id ? { ...t, x, y } : t));
    if (selectedTable?._id === id) setSelectedTable((p) => p ? { ...p, x, y } : null);
    try { await updateTableLayout(id, { x, y }); }
    catch { setError("Error al guardar posición"); }
  };

  const handleViewPaymentHistory = async () => {
    if (!selectedTable) return;
    try {
      const data = await getTablePayments(selectedTable._id!, selectedTable.currentSessionId || undefined);
      setPayments(data || []);
      setIsPaymentHistoryOpen(true);
    } catch { setError("Error al cargar historial de pagos"); }
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const receipt = await generateReceipt(paymentId);
      setSelectedReceipt(receipt);
      setIsReceiptModalOpen(true);
    } catch { setError("Error al generar recibo"); }
  };

  const handlePaymentSelector = () => {
    if (!selectedTable) return;
    if (!selectedTable.currentSessionId) return setError("Sin sesión activa");
    const openOrders = selectedTable.orders?.filter((o) => o.sessionStatus === "open") || [];
    if (!openOrders.length) return setError("No hay órdenes abiertas");
    if (openOrders.some((o) => o.status === "pending" || o.status === "in-progress"))
      return setError("Hay pedidos en preparación. Esperá antes de cobrar.");
    const totalAmount = selectedTable.totalAmount ?? openOrders.reduce((s, o) => s + (o.total || 0), 0);
    const balanceDue  = selectedTable.balanceDue !== undefined
      ? selectedTable.balanceDue
      : Math.max(0, totalAmount - (selectedTable.totalPaid || 0));
    if (balanceDue <= 0) return setError("No hay saldo pendiente");
    setSessionBalanceDue(balanceDue);
    setIsPaymentSelectorOpen(true);
  };

  const buildReceiptFromCheckout = (result: SessionCheckoutResult, tableNumber: number) => {
    const summary = result.receiptSummary;
    const allItems = result.payments?.flatMap((p) => p.receipt?.items || []) || result.payment?.receipt?.items || [];
    return {
      receiptNumber: summary.receiptNumber || result.payment?.receipt?.receiptNumber || "N/A",
      issuedAt: summary.issuedAt || new Date().toISOString(),
      table: { number: tableNumber, location: result.table?.location || "indoor" },
      items: allItems.length ? allItems : [{ name: "Cuenta de mesa", quantity: 1, price: summary.total, subtotal: summary.total }],
      subtotal: summary.subtotal, discountTotal: summary.discountTotal, total: summary.total,
      method: summary.method as any, change: summary.change,
      processedBy: { name: "Caja", role: "staff" },
      maintenanceUntil: summary.maintenanceUntil,
    };
  };

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = tables.length;
    const available  = tables.filter((t) => t.status === "available").length;
    const occupied   = tables.filter((t) => t.status === "occupied").length;
    const reserved   = tables.filter((t) => t.status === "reserved").length;
    const maintenance= tables.filter((t) => t.status === "maintenance").length;
    const totalRevenue = tables.reduce((s, t) => s + (t.totalAmount ?? 0), 0);
    return { total, available, occupied, reserved, maintenance, totalRevenue };
  }, [tables]);

  // ── Filtrado ──────────────────────────────────────────────────
  const filteredTables = activeLocation === "all"
    ? tables
    : tables.filter((t) => t.location === activeLocation);

  const LOCATIONS = [
    { value: "all",     label: "Todas"    },
    { value: "indoor",  label: "Interior" },
    { value: "outdoor", label: "Terraza"  },
    { value: "bar",     label: "Barra"    },
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="nebula-salon-root flex flex-col h-full min-h-0 bg-bg gap-4 overflow-hidden relative">
      <div className="absolute inset-0 nebula-aurora pointer-events-none -z-10 opacity-50" />

      <SalonFlowTutorial
        isOpen={salonTutorialOpen}
        onClose={closeSalonTutorial}
        onComplete={completeSalonTutorial}
      />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-gold/30 to-amber-500/20 border border-gold/20 shadow-[0_0_20px_rgba(212,163,64,0.15)]">
            <Sparkles className="text-gold" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ivory">Mesas</h1>
            <p className="text-xs text-muted mt-0.5">
              {stats.total} mesas · {stats.occupied} ocupadas · {stats.available} disponibles
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ModeToggle mode={mode} onChange={setMode} />

          {/* Toggle vista grid/espacial */}
          <button
            type="button"
            onClick={toggleView}
            title={view === "grid" ? "Cambiar a vista espacial" : "Cambiar a vista grid"}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            {view === "grid" ? <Map size={15} /> : <Grid3X3 size={15} />}
            <span className="hidden sm:inline">{view === "grid" ? "Espacial" : "Cuadrícula"}</span>
          </button>

          <button
            type="button"
            onClick={fetchTables}
            title="Sincronizar"
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            type="button"
            onClick={openSalonTutorial}
            title="Tutorial"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-violet-300 hover:border-violet/20 transition-colors"
          >
            <HelpCircle size={15} />
            <span className="hidden sm:inline">Tutorial</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="nebula-btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Nueva mesa</span>
          </button>
        </div>
      </header>

      {/* ── KPIs adaptativos por modo ───────────────────────────── */}
      {mode !== "basic" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
          <KPIBox
            label="Total"
            value={stats.total}
            icon={<LayoutGrid size={17} />}
            colorCls="from-violet-500/15 border-violet-500/25 bg-gradient-to-br"
          />
          <KPIBox
            label="Ocupadas"
            value={stats.occupied}
            icon={<Users size={17} />}
            colorCls="from-amber-500/15 border-amber-500/25 bg-gradient-to-br"
            pulse={stats.occupied > 0}
          />
          {mode === "advanced" && (
            <>
              <KPIBox
                label="Disponibles"
                value={stats.available}
                icon={<CheckCircle2 size={17} />}
                colorCls="from-emerald-500/15 border-emerald-500/25 bg-gradient-to-br"
              />
              <KPIBox
                label="Facturado"
                value={`$${stats.totalRevenue.toFixed(0)}`}
                icon={<DollarSign size={17} />}
                colorCls="from-gold/15 border-gold/25 bg-gradient-to-br"
              />
            </>
          )}
          {mode === "standard" && (
            <>
              <KPIBox
                label="Reservadas"
                value={stats.reserved}
                icon={<Clock size={17} />}
                colorCls="from-blue-500/15 border-blue-500/25 bg-gradient-to-br"
              />
              <KPIBox
                label="Mantenimiento"
                value={stats.maintenance}
                icon={<Activity size={17} />}
                colorCls="from-red-500/15 border-red-500/25 bg-gradient-to-br"
              />
            </>
          )}
        </div>
      )}

      {/* ── Stats avanzados (solo modo advanced) ─────────────────── */}
      {mode === "advanced" && (
        <div className="flex-shrink-0">
          <TableStats tables={tables} />
        </div>
      )}

      {/* ── Filtro de ubicaciones ────────────────────────────────── */}
      <div className="flex gap-1.5 flex-shrink-0">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.value}
            type="button"
            onClick={() => setActiveLocation(loc.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeLocation === loc.value
                ? "bg-gold/20 border-gold/40 text-gold"
                : "bg-white/4 border-white/8 text-muted hover:border-white/18 hover:text-ivory"
            }`}
          >
            {loc.label}
            <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${
              activeLocation === loc.value ? "bg-gold/20 text-gold" : "bg-white/5 text-muted/60"
            }`}>
              {loc.value === "all"
                ? tables.length
                : tables.filter((t) => t.location === loc.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError(null)}>
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SalonNextStepBanner
        table={selectedTable}
        onAction={() => {
          if (!selectedTable) return;
          if (selectedTable.status === "available") handleOpen(selectedTable._id!);
          else if (selectedTable.status === "reserved") seatTableReservation(selectedTable);
          else if (selectedTable.status === "occupied") setIsOrderOpen(true);
        }}
      />

      {/* ── ZONA PRINCIPAL ──────────────────────────────────────── */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">

        {/* FloorPlan — FIX: el contenedor necesita h-0 para que flex-1 funcione */}
        <div className="flex-1 flex flex-col min-w-0 h-0 min-h-0 flex-shrink-0" style={{ flexBasis: 0, flexGrow: 1 }}>
          <FloorPlan
            tables={filteredTables}
            loading={loading}
            selectedTable={selectedTable}
            onSelect={(table) => {
              setSelectedTable(table);
              if (isMobile) setIsInspectorOpen(true);
            }}
            viewType={view === "spatial" ? "spatial" : "grid"}
            isEditMode={false}
            onTableLayoutChange={handleTableLayoutChange}
          />
        </div>

        {/* Inspector sidebar */}
        <AnimatePresence mode="wait">
          {!isMobile && selectedTable && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden md:flex flex-col w-[380px] xl:w-[420px] min-h-0 flex-shrink-0"
            >
              <TableInspector
                table={selectedTable}
                tables={tables}
                onOpen={handleOpen}
                onClose={handleClose}
                onSave={handleSave}
                onDelete={handleDelete}
                onOrder={() => setIsOrderOpen(true)}
                onViewPaymentHistory={handleViewPaymentHistory}
                onViewAnalytics={() => setIsAnalyticsOpen(true)}
                onPaymentSelector={handlePaymentSelector}
                onSeatReservation={() => seatTableReservation(selectedTable)}
                onViewReservation={() => {
                  if (selectedTable.currentReservation)
                    navigate(`/reservations?highlight=${selectedTable.currentReservation}`);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inspector mobile slide-in */}
      <AnimatePresence>
        {isMobile && isInspectorOpen && selectedTable && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsInspectorOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 right-0 w-80 bg-surface-2 border-l border-white/10 z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <h3 className="text-sm font-black text-ivory">Mesa #{selectedTable.number}</h3>
                <button type="button" onClick={() => setIsInspectorOpen(false)} className="p-2 rounded-lg bg-white/5">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <TableInspector
                  table={selectedTable}
                  tables={tables}
                  onOpen={handleOpen}
                  onClose={handleClose}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onOrder={() => { setIsInspectorOpen(false); setIsOrderOpen(true); }}
                  onViewPaymentHistory={() => { setIsInspectorOpen(false); handleViewPaymentHistory(); }}
                  onViewAnalytics={() => { setIsInspectorOpen(false); setIsAnalyticsOpen(true); }}
                  onPaymentSelector={() => { setIsInspectorOpen(false); handlePaymentSelector(); }}
                  onSeatReservation={() => seatTableReservation(selectedTable)}
                  onViewReservation={() => {
                    if (selectedTable.currentReservation)
                      navigate(`/reservations?highlight=${selectedTable.currentReservation}`);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom button */}
      {isMobile && !isInspectorOpen && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface-2/95 backdrop-blur-md border-t border-white/10 z-30"
        >
          <button
            type="button"
            disabled={!selectedTable}
            onClick={() => selectedTable && setIsInspectorOpen(true)}
            className="w-full nebula-btn-primary py-3 rounded-xl font-bold text-sm disabled:opacity-40"
          >
            {selectedTable ? `Ver Mesa #${selectedTable.number}` : "Seleccioná una mesa"}
          </button>
        </motion.div>
      )}

      {/* ── Modales ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* TableForm */}
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="w-full max-w-2xl"
            >
              <TableForm
                existingTables={tables}
                onSave={handleSave}
                onClose={() => setIsFormOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}

        {isOrderOpen && selectedTable && (
          <OrderForm
            tableId={selectedTable._id!}
            tableNumber={selectedTable.number}
            sessionId={selectedTable.currentSessionId || ""}
            onClose={() => setIsOrderOpen(false)}
            onSuccess={fetchTables}
          />
        )}

        {isPaymentHistoryOpen && selectedTable && (
          <PaymentHistory
            tableId={selectedTable._id!}
            payments={payments}
            onClose={() => setIsPaymentHistoryOpen(false)}
            onReceiptClick={handleViewReceipt}
          />
        )}

        {isReceiptModalOpen && selectedReceipt && (
          <ReceiptModal receipt={selectedReceipt} onClose={() => setIsReceiptModalOpen(false)} />
        )}

        {isAnalyticsOpen && selectedTable && (
          <TableAnalyticsDashboard tableId={selectedTable._id!} onClose={() => setIsAnalyticsOpen(false)} />
        )}

        {paymentSuccessMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold shadow-lg">
            {paymentSuccessMessage}
          </div>
        )}

        {isPaymentSelectorOpen && selectedTable?.currentSessionId && (
          <PaymentMethodSelector
            tableId={selectedTable._id!}
            sessionId={selectedTable.currentSessionId}
            balanceDue={sessionBalanceDue}
            onSelect={async (method, data) => {
              try {
                setError(null);
                setLoading(true);
                const response = await createSessionCheckout({
                  tableId:   selectedTable._id!,
                  sessionId: selectedTable.currentSessionId!,
                  method:    method as any,
                  paymentDetails: {
                    amountPaid:  data?.amountPaid  ?? sessionBalanceDue,
                    notes:       data?.notes,
                    totalSplits: data?.totalSplits,
                    cardDetails: data?.cardDetails,
                  },
                });
                await fetchTables();
                setSelectedReceipt(buildReceiptFromCheckout(response, selectedTable.number));
                setIsReceiptModalOpen(true);
                const mins = response.receiptSummary?.maintenanceUntil
                  ? Math.max(1, Math.round((new Date(response.receiptSummary.maintenanceUntil).getTime() - Date.now()) / 60000))
                  : 5;
                setPaymentSuccessMessage(`Cuenta cerrada. Mesa en mantenimiento ~${mins} min.`);
                setTimeout(() => setPaymentSuccessMessage(null), 6000);
                setIsPaymentSelectorOpen(false);
              } catch (err: any) {
                setError(err instanceof PaymentServiceError
                  ? getPaymentErrorMessage(err)
                  : err?.message || "Error al procesar el pago");
              } finally {
                setLoading(false);
              }
            }}
            onClose={() => setIsPaymentSelectorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
