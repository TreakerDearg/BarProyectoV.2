"use client";

/**
 * TablesPage — Página principal del sistema de mesas.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Layout:
 *   Header: título + stats inline + acciones (+ Nueva mesa, refresh)
 *   Tabs de modo: Básico | Estándar | Avanzado  +  toggle vista (ícono)
 *   Filtros de ubicación: Todas | Interior | Terraza | Barra
 *   KPIs: solo en modo Advanced
 *   Zona principal: FloorPlan + Inspector lateral
 */
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, RefreshCcw, AlertCircle, X,
  LayoutGrid, Map, Users, DollarSign,
  CheckCircle2, Clock, Activity,
} from "lucide-react";

import {
  getTables, createTable, updateTable, deleteTable,
  openTable, closeTable, getTablePayments, generateReceipt,
  updateTableLayout, createSessionCheckout,
  type PaymentMethodId, type SessionCheckoutResult,
  PaymentServiceError, getPaymentErrorMessage,
} from "../services/tableService";

import type { Table } from "../types/table";
import { connectSalonSockets, getMainSocket } from "../../../services/socket";

import FloorPlan              from "../components/FloorPlan";
import TableInspector         from "../components/TableInspector";
import TableStats             from "../components/TableStats";
import TableForm              from "../components/TableForm";
import OrderForm              from "../../orders/components/OrderForm";
import PaymentHistory         from "../components/PaymentHistory";
import ReceiptModal           from "../components/ReceiptModal";
import TableAnalyticsDashboard from "../components/TableAnalyticsDashboard";
import PaymentMethodSelector  from "../components/PaymentMethodSelector";
import SalonNextStepBanner    from "../../salon/components/SalonNextStepBanner";
import SalonFlowTutorial      from "../../salon/components/SalonFlowTutorial";
import { useSalonTutorial }   from "../../salon/hooks/useSalonTutorial";
import { useTablesUiStore, type TablesMode } from "../../../store/tablesUiStore";
import { updateReservationStatus } from "../../reservations/services/reservationService";
import "../../../styles/nebula-theme.css";

type Receipt = Parameters<typeof ReceiptModal>[0]["receipt"];
type HistoryPayment = {
  _id:          string;
  amount:       number;
  method:       "cash" | "transfer" | "card" | "split" | "partial";
  status:       string;
  createdAt:    string;
  processedBy:  { name: string; role: string };
  receipt?:     { receiptNumber: string };
};

/* ── Configuración de tabs de modo ─────────────────────────── */
const MODE_TABS: { value: TablesMode; label: string; desc: string }[] = [
  { value: "basic",    label: "Básico",   desc: "Estado y acciones rápidas"   },
  { value: "standard", label: "Estándar", desc: "Totales, código y órdenes"   },
  { value: "advanced", label: "Avanzado", desc: "KPIs y analytics completos"  },
];

/* ── KPI Card para modo Advanced ────────────────────────────── */
function KPICard({
  label, value, icon, color, pulse,
}: {
  label:  string;
  value:  string | number;
  icon:   React.ReactNode;
  color:  string;  // hex
  pulse?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        background: `${color}0D`,
        border:     `1px solid ${color}35`,
      }}
    >
      <div
        className={`p-2.5 rounded-lg flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}
        style={{ background: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#566270" }}>
          {label}
        </p>
        <p className="text-xl font-black" style={{ color: "#E6EDF3" }}>{value}</p>
      </div>
    </div>
  );
}

/* ── TablesPage ─────────────────────────────────────────────── */
export default function TablesPage() {
  const [tables,          setTables]          = useState<Table[]>([]);
  const [selectedTable,   setSelectedTable]   = useState<Table | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [isOrderOpen,     setIsOrderOpen]     = useState(false);
  const [isFormOpen,      setIsFormOpen]      = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [isPaymentHistoryOpen,  setIsPaymentHistoryOpen]  = useState(false);
  const [isReceiptModalOpen,    setIsReceiptModalOpen]    = useState(false);
  const [isAnalyticsOpen,       setIsAnalyticsOpen]       = useState(false);
  const [isPaymentSelectorOpen, setIsPaymentSelectorOpen] = useState(false);
  const [payments,        setPayments]        = useState<HistoryPayment[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [sessionBalanceDue, setSessionBalanceDue] = useState(0);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [isMobile,        setIsMobile]        = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeLocation,  setActiveLocation]  = useState<string>("all");
  const [isEditMode,      setIsEditMode]      = useState(false);

  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode, setMode, view, setView } = useTablesUiStore();
  const {
    isOpen: salonTutorialOpen,
    openTutorial: openSalonTutorial,
    closeTutorial: closeSalonTutorial,
    completeTutorial: completeSalonTutorial,
  } = useSalonTutorial(true);

  /* ── Resize ────────────────────────────────────────────────── */
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 1024);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTables();
      setTables(data || []);
    } catch {
      setError("Error al sincronizar mesas");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTables(); }, []);

  /* ── Socket.IO ─────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token") || undefined;
    connectSalonSockets(token);
    const socket = getMainSocket();
    if (!socket) return;

    const handleUpdate = (payload: Table | { table?: Table }) => {
      const updated  = (payload as { table?: Table }).table ?? payload as Table;
      const tableId  = updated._id ?? (updated as Table & { id?: string }).id;
      if (!tableId) return;
      const normalized = { ...updated, _id: tableId };
      setTables((prev) => prev.map((t) => t._id === tableId ? normalized : t));
      if (selectedTable?._id === tableId) setSelectedTable(normalized);
    };
    const handleCreated = (t: Table) => setTables((prev) => [...prev, t]);
    const handleDeleted = (payload: string | { tableId?: string; _id?: string }) => {
      const id = typeof payload === "string" ? payload : payload?.tableId ?? payload?._id;
      if (!id) return;
      setTables((prev) => prev.filter((t) => t._id !== id));
      if (selectedTable?._id === id) setSelectedTable(null);
    };

    socket.on("table:update",       handleUpdate);
    socket.on("table:created",      handleCreated);
    socket.on("table:deleted",      handleDeleted);
    socket.on("table:closed",       fetchTables);
    socket.on("payment:completed",  fetchTables);

    return () => {
      socket.off("table:update",      handleUpdate);
      socket.off("table:created",     handleCreated);
      socket.off("table:deleted",     handleDeleted);
      socket.off("table:closed",      fetchTables);
      socket.off("payment:completed", fetchTables);
    };
  }, [selectedTable]);

  /* ── Abrir inspector en mobile ─────────────────────────────── */
  useEffect(() => {
    if (selectedTable && isMobile) setIsInspectorOpen(true);
  }, [selectedTable, isMobile]);

  /* ── Deep-link ─────────────────────────────────────────────── */
  useEffect(() => {
    const tableId = searchParams.get("table");
    if (!tableId || tables.length === 0) return;
    const t = tables.find((x) => x._id === tableId);
    if (t) {
      setSelectedTable(t);
      if (searchParams.get("order") === "1") setIsOrderOpen(true);
    }
  }, [searchParams, tables]);

  /* ── CRUD handlers (lógica sin cambios) ────────────────────── */
  const handleOpen = async (id: string) => {
    const table = tables.find((t) => t._id === id);
    if (!table)                         return setError("Mesa no encontrada");
    if (table.status === "occupied")    return setError("Esta mesa ya está abierta");
    if (table.status === "maintenance") return setError("Mesa en mantenimiento");
    if (table.status === "reserved")    return seatTableReservation(table);
    try {
      const updated = await openTable(id);
      setSelectedTable(updated);
      setTables((prev) => prev.map((t) => t._id === id ? updated : t));
      setIsOrderOpen(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al abrir la mesa");
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
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo sentar la reserva");
    }
  };

  const handleClose = async (id: string) => {
    const table = tables.find((t) => t._id === id);
    if (!table)                      return setError("Mesa no encontrada");
    if (table.status !== "occupied") return setError("Solo puedes cerrar mesas ocupadas");
    const totalAmount = table.orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;
    const totalPaid   = table.totalPayments || 0;
    if (totalAmount > 0 && totalPaid < totalAmount) {
      if (!confirm(`Saldo pendiente $${(totalAmount - totalPaid).toFixed(2)}. ¿Cerrar igual?`)) return;
    }
    try { await closeTable(id); } catch { setError("Error al cerrar mesa"); }
  };

  const handleSave = async (tableData: Table) => {
    if (!tableData.number || tableData.number <= 0) return setError("Número de mesa requerido");
    if (!tableData.capacity || tableData.capacity <= 0) return setError("Capacidad requerida");
    if (!tableData.location) return setError("Ubicación requerida");
    if (!tableData._id && tables.some((t) => t.number === tableData.number))
      return setError(`Mesa #${tableData.number} ya existe`);
    try {
      if (tableData._id) await updateTable(tableData._id, tableData);
      else               await createTable(tableData);
      setIsFormOpen(false);
      fetchTables();
    } catch { setError("Error al guardar la mesa"); }
  };

  const handleDelete = async (id: string) => {
    const table = tables.find((t) => t._id === id);
    if (!table) return setError("Mesa no encontrada");
    if (table.status === "occupied") return setError("Cierra la mesa antes de eliminarla");
    if (table.status === "reserved") return setError("Cancela la reserva antes de eliminarla");
    if (!confirm(`¿Eliminar Mesa #${table.number}? Esta acción no se puede deshacer.`)) return;
    try { await deleteTable(id); setSelectedTable(null); }
    catch { setError("Error al eliminar la mesa"); }
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
      const historyPayments: HistoryPayment[] = (data || []).map((payment) => ({
        _id:          payment._id,
        amount:       payment.amount,
        method:       payment.method,
        status:       payment.status,
        createdAt:    String(payment.createdAt),
        processedBy:  { name: "Sistema", role: "staff" },
        receipt:      payment.receipt?.receiptNumber ? { receiptNumber: payment.receipt.receiptNumber } : undefined,
      }));
      setPayments(historyPayments);
      setIsPaymentHistoryOpen(true);
    } catch { setError("Error al cargar historial de pagos"); }
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const receipt = await generateReceipt(paymentId);
      if (!receipt || typeof receipt !== "object") throw new Error("Recibo inválido");
      setSelectedReceipt(receipt as Receipt);
      setIsReceiptModalOpen(true);
    } catch { setError("Error al generar recibo"); }
  };

  const handlePaymentSelector = () => {
    if (!selectedTable) return;
    if (!selectedTable.currentSessionId)     return setError("Sin sesión activa");
    const openOrders = selectedTable.orders?.filter((o) => o.sessionStatus === "open") || [];
    if (!openOrders.length)                  return setError("No hay órdenes abiertas");
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

  const buildReceiptFromCheckout = (result: SessionCheckoutResult, tableNumber: number): Receipt => {
    const summary  = result.receiptSummary;
    const allItems = result.payments?.flatMap((p) => p.receipt?.items || []) || result.payment?.receipt?.items || [];
    return {
      receiptNumber: summary.receiptNumber || result.payment?.receipt?.receiptNumber || "N/A",
      issuedAt:      summary.issuedAt || new Date().toISOString(),
      table:         { number: tableNumber, location: result.table?.location || "indoor" },
      items: allItems.length
        ? allItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, subtotal: i.price * i.quantity }))
        : [{ name: "Cuenta de mesa", quantity: 1, price: summary.total, subtotal: summary.total }],
      subtotal:     summary.subtotal,
      discountTotal: summary.discountTotal,
      total:        summary.total,
      method:       summary.method as PaymentMethodId,
      change:       summary.change,
      processedBy:  { name: "Caja", role: "staff" },
      maintenanceUntil: summary.maintenanceUntil,
    };
  };

  /* ── Stats ─────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total        = tables.length;
    const available    = tables.filter((t) => t.status === "available").length;
    const occupied     = tables.filter((t) => t.status === "occupied").length;
    const reserved     = tables.filter((t) => t.status === "reserved").length;
    const maintenance  = tables.filter((t) => t.status === "maintenance").length;
    const totalRevenue = tables.reduce((s, t) => s + (t.totalAmount ?? 0), 0);
    return { total, available, occupied, reserved, maintenance, totalRevenue };
  }, [tables]);

  /* ── Filtrado ───────────────────────────────────────────────── */
  const filteredTables = activeLocation === "all"
    ? tables
    : tables.filter((t) => t.location === activeLocation);

  const LOCATIONS = [
    { value: "all",     label: "Todas"    },
    { value: "indoor",  label: "Interior" },
    { value: "outdoor", label: "Terraza"  },
    { value: "bar",     label: "Barra"    },
  ];

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div
      className="flex flex-col h-full min-h-0 overflow-hidden relative"
      style={{ background: "#0D1117", color: "#E6EDF3" }}
    >

      {/* Tutorial */}
      <SalonFlowTutorial
        isOpen={salonTutorialOpen}
        onClose={closeSalonTutorial}
        onComplete={completeSalonTutorial}
      />

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 pt-5 pb-4 flex items-center justify-between gap-4"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#E6EDF3" }}>Mesas</h1>
          <p className="text-xs mt-0.5" style={{ color: "#566270" }}>
            {stats.total} mesas · {stats.occupied} ocupadas · {stats.available} disponibles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTables}
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
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: "#F0B429", color: "#0D1117", boxShadow: "0 0 20px rgba(240,180,41,0.25)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5C842"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0B429"; }}
          >
            <Plus size={15} /> Nueva mesa
          </button>
        </div>
      </div>

      {/* ── TABS DE MODO + TOGGLE DE VISTA ─────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center px-6"
        style={{ borderBottom: "1px solid #30363D" }}
      >
        {/* Tabs de modo */}
        {MODE_TABS.map((tab) => {
          const isActive = mode === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMode(tab.value)}
              title={tab.desc}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative"
              style={{
                color:        isActive ? "#F0B429" : "#566270",
                borderBottom: isActive ? "3px solid #F0B429" : "3px solid transparent",
                marginBottom: "-1px",
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Toggle vista — a la derecha */}
        <div className="ml-auto flex items-center gap-1 py-2">
          <button
            type="button"
            onClick={() => { setView("grid"); setIsEditMode(false); }}
            title="Vista cuadrícula"
            className="p-2 rounded-lg transition-all"
            style={{
              background:  view === "grid" ? "rgba(240,180,41,0.15)" : "transparent",
              color:       view === "grid" ? "#F0B429" : "#566270",
              border:      view === "grid" ? "1px solid rgba(240,180,41,0.30)" : "1px solid transparent",
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setView("spatial")}
            title="Vista de plano espacial"
            className="p-2 rounded-lg transition-all"
            style={{
              background:  view === "spatial" ? "rgba(240,180,41,0.15)" : "transparent",
              color:       view === "spatial" ? "#F0B429" : "#566270",
              border:      view === "spatial" ? "1px solid rgba(240,180,41,0.30)" : "1px solid transparent",
            }}
          >
            <Map size={16} />
          </button>
        </div>
      </div>

      {/* ── KPIs (solo modo advanced) ───────────────────────────── */}
      {mode === "advanced" && (
        <div
          className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-3"
          style={{ borderBottom: "1px solid #30363D" }}
        >
          <KPICard label="Total"        value={stats.total}      icon={<LayoutGrid   size={15} />} color="#F0B429" />
          <KPICard label="Ocupadas"     value={stats.occupied}   icon={<Users        size={15} />} color="#FF7B54" pulse={stats.occupied > 0} />
          <KPICard label="Disponibles"  value={stats.available}  icon={<CheckCircle2 size={15} />} color="#3FB950" />
          <KPICard label="Facturado"    value={`$${stats.totalRevenue.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`}
                                                                  icon={<DollarSign   size={15} />} color="#388BFD" />
        </div>
      )}

      {/* Stats secundarios solo advanced */}
      {mode === "advanced" && (
        <div className="flex-shrink-0 px-6 py-2" style={{ borderBottom: "1px solid #30363D" }}>
          <TableStats tables={tables} />
        </div>
      )}

      {/* ── FILTROS DE UBICACIÓN ─────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3">
        {LOCATIONS.map((loc) => {
          const isActive = activeLocation === loc.value;
          const count    = loc.value === "all"
            ? tables.length
            : tables.filter((t) => t.location === loc.value).length;
          return (
            <button
              key={loc.value}
              type="button"
              onClick={() => setActiveLocation(loc.value)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background:  isActive ? "rgba(240,180,41,0.15)" : "#1C2333",
                border:      `1px solid ${isActive ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                color:       isActive ? "#F0B429" : "#8B949E",
              }}
            >
              {loc.label}
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? "rgba(240,180,41,0.20)" : "#21283A",
                  color:      isActive ? "#F0B429" : "#566270",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Estadísticas básicas en standard (discreta) ───────── */}
      {mode === "standard" && (
        <div className="flex-shrink-0 flex items-center gap-4 px-6 pb-2">
          {[
            { label: "Reservadas",    value: stats.reserved,    color: "#388BFD" },
            { label: "Mantenimiento", value: stats.maintenance, color: "#F85149" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }}
              />
              <span className="text-xs font-medium" style={{ color: "#566270" }}>
                {s.label}: <span style={{ color: "#8B949E", fontWeight: 700 }}>{s.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden mx-6"
          >
            <div
              className="flex items-center justify-between gap-3 p-3 rounded-xl text-xs mb-2"
              style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.30)", color: "#FF6B63" }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
              <button type="button" onClick={() => setError(null)}>
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner siguiente paso */}
      <SalonNextStepBanner
        table={selectedTable}
        onAction={() => {
          if (!selectedTable) return;
          if (selectedTable.status === "available") handleOpen(selectedTable._id!);
          else if (selectedTable.status === "reserved") seatTableReservation(selectedTable);
          else if (selectedTable.status === "occupied") setIsOrderOpen(true);
        }}
      />

      {/* ── ZONA PRINCIPAL ─────────────────────────────────────── */}
      <div className="flex-1 flex gap-0 min-h-0 overflow-hidden">

        {/* FloorPlan */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <FloorPlan
            tables={filteredTables}
            loading={loading}
            selectedTable={selectedTable}
            onSelect={(table) => {
              setSelectedTable(table);
              if (isMobile) setIsInspectorOpen(true);
            }}
            viewType={view === "spatial" ? "spatial" : "grid"}
            isEditMode={view === "spatial" && isEditMode}
            onToggleEditMode={() => setIsEditMode((prev) => !prev)}
            onTableLayoutChange={handleTableLayoutChange}
            onCreateTable={() => setIsFormOpen(true)}
            onRetry={fetchTables}
          />
        </div>

        {/* Inspector sidebar (desktop) */}
        <AnimatePresence mode="wait">
          {!isMobile && selectedTable && (
            <motion.div
              key={selectedTable._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex flex-col min-h-0 flex-shrink-0"
              style={{ width: 340, borderLeft: "1px solid #30363D" }}
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsInspectorOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 right-0 w-80 z-50 flex flex-col md:hidden"
              style={{ background: "#161B22", borderLeft: "1px solid #30363D" }}
            >
              <div
                className="flex items-center justify-between p-4 flex-shrink-0"
                style={{ borderBottom: "1px solid #30363D" }}
              >
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>
                  Mesa #{selectedTable.number}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(false)}
                  className="p-2 rounded-lg"
                  style={{ background: "#21283A", color: "#8B949E" }}
                >
                  <X size={16} />
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

      {/* Botón mobile */}
      {isMobile && !isInspectorOpen && (
        <motion.div
          initial={{ y: 80 }} animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 p-4 z-30"
          style={{ background: "rgba(22,27,34,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #30363D" }}
        >
          <button
            type="button"
            disabled={!selectedTable}
            onClick={() => selectedTable && setIsInspectorOpen(true)}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            style={{ background: selectedTable ? "#F0B429" : "#21283A", color: selectedTable ? "#0D1117" : "#566270" }}
          >
            {selectedTable ? `Ver Mesa #${selectedTable.number}` : "Seleccioná una mesa"}
          </button>
        </motion.div>
      )}

      {/* ── MODALES ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="w-full max-w-2xl"
            >
              <TableForm existingTables={tables} onSave={handleSave} onClose={() => setIsFormOpen(false)} />
            </motion.div>
          </motion.div>
        )}

        {isOrderOpen && selectedTable && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          >
            <div className="w-full max-w-5xl">
              <OrderForm
                tableId={selectedTable._id!}
                tableNumber={selectedTable.number}
                sessionId={selectedTable.currentSessionId || ""}
                onClose={() => setIsOrderOpen(false)}
                onSuccess={fetchTables}
              />
            </div>
          </motion.div>
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

        {isPaymentSelectorOpen && selectedTable?.currentSessionId && (
          <PaymentMethodSelector
            tableId={selectedTable._id!}
            sessionId={selectedTable.currentSessionId}
            balanceDue={sessionBalanceDue}
            tableNumber={selectedTable.number}
            onSelect={async (method, data) => {
              try {
                setError(null);
                setLoading(true);
                const response = await createSessionCheckout({
                  tableId:    selectedTable._id!,
                  sessionId:  selectedTable.currentSessionId!,
                  method:     method as PaymentMethodId,
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
              } catch (error) {
                setError(error instanceof PaymentServiceError
                  ? getPaymentErrorMessage(error)
                  : error instanceof Error ? error.message : "Error al procesar el pago");
              } finally {
                setLoading(false);
              }
            }}
            onClose={() => setIsPaymentSelectorOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast de éxito */}
      {paymentSuccessMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-bold shadow-xl"
          style={{
            background: "rgba(63,185,80,0.15)",
            border:     "1px solid rgba(63,185,80,0.40)",
            color:      "#3FB950",
          }}
        >
          {paymentSuccessMessage}
        </div>
      )}
    </div>
  );
}
