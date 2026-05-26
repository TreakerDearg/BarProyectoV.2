"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCcw,
  AlertCircle,
  X,
  Sparkles,
  Lock,
  Unlock,
  HelpCircle,
} from "lucide-react";

import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  openTable,
  closeTable,
  getTablePayments,
  generateReceipt,
  createSplitPayment,
  createPartialPayment,
  createCardPayment,
  createStandardPayment,
  updateTableLayout,
} from "../services/tableService";

import type { Table } from "../types/table";
import { connectSalonSockets, getMainSocket } from "../../../services/socket";

import FloorPlan from "../components/FloorPlan";
import TableInspector from "../components/TableInspector";
import TableStats from "../components/TableStats";
import TableForm from "../components/TableForm";
import OrderForm from "../../orders/components/OrderForm";
import PaymentHistory from "../components/PaymentHistory";
import ReceiptModal from "../components/ReceiptModal";
import TableAnalyticsDashboard from "../components/TableAnalyticsDashboard";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import SalonNextStepBanner from "../../salon/components/SalonNextStepBanner";
import SalonFlowTutorial from "../../salon/components/SalonFlowTutorial";
import { useSalonTutorial } from "../../salon/hooks/useSalonTutorial";
import { useSalonUiStore } from "../../../store/salonUiStore";
import { updateReservationStatus } from "../../reservations/services/reservationService";
import "../../../styles/nebula-theme.css";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isPaymentSelectorOpen, setIsPaymentSelectorOpen] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [currentOrderTotal, setCurrentOrderTotal] = useState(0);
  const [selectedOrderIdForPayment, setSelectedOrderIdForPayment] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "spatial">("spatial");
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salonMode = useSalonUiStore((s) => s.mode);
  const setSalonMode = useSalonUiStore((s) => s.setMode);
  const {
    isOpen: salonTutorialOpen,
    openTutorial: openSalonTutorial,
    closeTutorial: closeSalonTutorial,
    completeTutorial: completeSalonTutorial,
  } = useSalonTutorial(true);

  const handleTableLayoutChange = async (id: string, x: number, y: number) => {
    try {
      // Actualizar localmente de forma optimista para fluidez total
      setTables((prev) =>
        prev.map((t) => (t._id === id ? { ...t, x, y } : t))
      );
      if (selectedTable?._id === id) {
        setSelectedTable((prev) => prev ? { ...prev, x, y } : null);
      }
      
      // Guardar coordenadas de plano en backend
      await updateTableLayout(id, { x, y });
    } catch (err) {
      setError("Error al guardar la posición de la mesa");
      console.error("Error updating table layout:", err);
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTables();
      setTables(data || []);
    } catch (err: any) {
      setError("Fallo en la sincronización de activos");
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    
    // Detectar tamaño de pantalla para responsividad
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || undefined;
    connectSalonSockets(token);
    const socket = getMainSocket();
    if (!socket) return;

    const handleUpdate = (updated: Table) => {
      setTables((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      if (selectedTable?._id === updated._id) setSelectedTable(updated);
    };

    const handleCreated = (t: Table) =>
      setTables((prev) => [...prev, t]);

    const handleDeleted = (payload: string | { tableId?: string; _id?: string }) => {
      const id =
        typeof payload === "string"
          ? payload
          : payload?.tableId ?? payload?._id;
      if (!id) return;
      setTables((prev) => prev.filter((t) => t._id !== id));
      if (selectedTable?._id === id) setSelectedTable(null);
    };

    socket.on("table:update", handleUpdate);
    socket.on("table:created", handleCreated);
    socket.on("table:deleted", handleDeleted);

    return () => {
      socket.off("table:update", handleUpdate);
      socket.off("table:created", handleCreated);
      socket.off("table:deleted", handleDeleted);
    };
  }, [selectedTable]);

  // Actualizar el total de la orden cuando cambia la mesa seleccionada
  useEffect(() => {
    if (selectedTable) {
      const total = selectedTable.orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
      setCurrentOrderTotal(total);
      
      // En móvil, cerrar el inspector cuando se selecciona una mesa
      if (isMobile) {
        setIsInspectorOpen(true);
      }
    }
  }, [selectedTable, isMobile]);

  const handleOpen = async (id: string) => {
    // Foolproof validation
    const table = tables.find(t => t._id === id);
    if (!table) {
      setError("Mesa no encontrada. Por favor selecciona una mesa válida.");
      return;
    }

    if (table.status === "occupied") {
      setError("Esta mesa ya está abierta. No puedes abrir una mesa ocupada.");
      return;
    }

    if (table.status === "maintenance") {
      setError("Esta mesa está en mantenimiento. No puedes abrirla.");
      return;
    }

    if (table.status === "reserved") {
      await seatTableReservation(table);
      return;
    }

    try {
      const updated = await openTable(id);
      setSelectedTable(updated);
      setTables((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );
      setIsOrderOpen(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al abrir la mesa";
      setError(msg);
    }
  };

  const seatTableReservation = async (table: Table) => {
    if (!table.currentReservation) {
      setError("Esta mesa no tiene una reserva vinculada.");
      return;
    }
    try {
      setError(null);
      await updateReservationStatus(String(table.currentReservation), "seated");
      const list = await getTables();
      setTables(list);
      const updated = list.find((t) => t._id === table._id);
      if (updated) {
        setSelectedTable(updated);
        setIsOrderOpen(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo sentar la reserva";
      setError(msg);
    }
  };

  const handleSeatFromInspector = () => {
    if (selectedTable) seatTableReservation(selectedTable);
  };

  const handleViewReservation = () => {
    if (!selectedTable?.currentReservation) return;
    navigate(`/reservations?highlight=${selectedTable.currentReservation}`);
  };

  const handleBannerAction = () => {
    if (!selectedTable) return;
    if (selectedTable.status === "available") handleOpen(selectedTable._id!);
    else if (selectedTable.status === "reserved") handleSeatFromInspector();
    else if (selectedTable.status === "occupied") setIsOrderOpen(true);
  };

  const handleClose = async (id: string) => {
    // Foolproof validation
    const table = tables.find(t => t._id === id);
    if (!table) {
      setError("Mesa no encontrada. Por favor selecciona una mesa válida.");
      return;
    }

    if (table.status !== "occupied") {
      setError("Solo puedes cerrar mesas que estén ocupadas. Esta mesa no tiene una sesión activa.");
      return;
    }

    const totalAmount = table.orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
    const totalPaid = table.totalPayments || 0;

    if (totalAmount > 0 && totalPaid < totalAmount) {
      if (!confirm(`La cuenta tiene un saldo pendiente de $${(totalAmount - totalPaid).toFixed(2)}. ¿Estás seguro de que quieres cerrar la mesa sin cobrar el saldo completo?`)) {
        return;
      }
    }

    try {
      await closeTable(id);
    } catch (err) {
      setError("Error al finalizar sesión");
      console.error("Error closing table:", err);
    }
  };

  const handleSave = async (tableData: Table) => {
    // Foolproof validation
    if (!tableData.number || tableData.number <= 0) {
      setError("El número de mesa es requerido y debe ser mayor a 0.");
      return;
    }

    if (!tableData.capacity || tableData.capacity <= 0) {
      setError("La capacidad es requerida y debe ser mayor a 0.");
      return;
    }

    if (!tableData.location) {
      setError("La ubicación de la mesa es requerida.");
      return;
    }

    // Check for duplicate table numbers when creating new
    if (!tableData._id) {
      const existingTable = tables.find(t => t.number === tableData.number);
      if (existingTable) {
        setError(`Ya existe una mesa con el número ${tableData.number}. Por favor usa un número diferente.`);
        return;
      }
    }

    try {
      if (tableData._id) {
        await updateTable(tableData._id, tableData);
      } else {
        await createTable(tableData);
      }
      setIsFormOpen(false);
      fetchTables();
    } catch (err) {
      setError("Error al persistir cambios");
      console.error("Error saving table:", err);
    }
  };

  const handleDelete = async (id: string) => {
    // Foolproof validation
    const table = tables.find(t => t._id === id);
    if (!table) {
      setError("Mesa no encontrada. Por favor selecciona una mesa válida.");
      return;
    }

    if (table.status === "occupied") {
      setError("No puedes eliminar una mesa que está ocupada. Por favor cierra la mesa primero.");
      return;
    }

    if (table.status === "reserved") {
      setError("No puedes eliminar una mesa que está reservada. Por favor cancela la reserva primero.");
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar la mesa #${table.number}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteTable(id);
      setSelectedTable(null);
    } catch (err) {
      setError("No se pudo eliminar el activo");
      console.error("Error deleting table:", err);
    }
  };

  const handleViewPaymentHistory = async () => {
    if (!selectedTable) return;
    try {
      const data = await getTablePayments(selectedTable._id!, selectedTable.currentSessionId || undefined);
      setPayments(data || []);
      setIsPaymentHistoryOpen(true);
    } catch (err) {
      setError("Error al cargar historial de pagos");
      console.error("Error fetching payment history:", err);
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const receipt = await generateReceipt(paymentId);
      setSelectedReceipt(receipt);
      setIsReceiptModalOpen(true);
    } catch (err) {
      setError("Error al generar recibo");
      console.error("Error generating receipt:", err);
    }
  };

  const handleViewAnalytics = () => {
    if (!selectedTable) return;
    setIsAnalyticsOpen(true);
  };

  const handlePaymentSelector = () => {
    if (!selectedTable) return;

    const openOrder = selectedTable.orders?.find((o) => o.sessionStatus === "open");
    if (!openOrder?._id) {
      setError("No hay una orden activa para cobrar en esta mesa.");
      return;
    }

    // Calcular total solo de órdenes abiertas
    const total =
      selectedTable.orders
        ?.filter((o) => o.sessionStatus === "open")
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;

    setCurrentOrderTotal(total);
    setSelectedOrderIdForPayment(openOrder._id);
    setIsPaymentSelectorOpen(true);
  };

  const [activeLocation, setActiveLocation] = useState<string>("all");

  const filteredTables = activeLocation === "all" 
    ? tables 
    : tables.filter(t => t.location === activeLocation);

  useEffect(() => {
    const tableId = searchParams.get("table");
    if (!tableId || tables.length === 0) return;
    const t = tables.find((x) => x._id === tableId);
    if (t) {
      setSelectedTable(t);
      if (searchParams.get("order") === "1") setIsOrderOpen(true);
    }
  }, [searchParams, tables]);

  return (
    <div className="nebula-salon-root flex flex-col h-screen bg-bg p-4 md:p-6 gap-4 overflow-hidden relative">
      <div className="absolute inset-0 nebula-aurora pointer-events-none -z-10 opacity-50" />
      <SalonFlowTutorial
        isOpen={salonTutorialOpen}
        onClose={closeSalonTutorial}
        onComplete={completeSalonTutorial}
      />
      
      {/* TOP COMMAND BAR - RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-200">
              <Sparkles size={16} />
            </div>
            <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">
              Nebula · Salón
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
            Mesas y plano
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Desktop-only stats */}
          {salonMode === "advanced" && (
            <div className="hidden lg:block">
              <TableStats tables={tables} />
            </div>
          )}

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

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Vista Humano */}
            <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-0.5">
              <button
                onClick={() => {
                  setViewType("spatial");
                  setIsEditMode(false);
                }}
                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  viewType === "spatial" ? "bg-gold text-black shadow-gold-glow" : "text-muted hover:text-white"
                }`}
              >
                Plano
              </button>
              <button
                onClick={() => {
                  setViewType("grid");
                  setIsEditMode(false);
                }}
                className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  viewType === "grid" ? "bg-gold text-black shadow-gold-glow" : "text-muted hover:text-white"
                }`}
              >
                Lista
              </button>
            </div>

            {/* Diseño / Modo Diseñador */}
            {salonMode === "advanced" && viewType === "spatial" && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`btn !p-3 rounded-xl border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                  isEditMode 
                    ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" 
                    : "bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:text-white"
                }`}
                title={isEditMode ? "Bloquear plano de salón" : "Editar plano de salón"}
              >
                {isEditMode ? <Lock size={15} /> : <Unlock size={15} />}
                <span className="hidden sm:inline">{isEditMode ? "Bloquear" : "Editar Plano"}</span>
              </button>
            )}

            <button
              onClick={fetchTables}
              className="btn btn-ghost !p-3 rounded-xl hover:bg-white/5 border border-white/5"
              title="Sincronizar"
            >
              <RefreshCcw size={18} className={loading ? "animate-spin" : "opacity-50"} />
            </button>

            <button
              type="button"
              onClick={openSalonTutorial}
              className="btn btn-ghost !p-3 rounded-xl hover:bg-white/5 border border-white/5 flex items-center gap-1.5 text-xs"
              title="Tutorial"
            >
              <HelpCircle size={16} />
              <span className="hidden sm:inline">Tutorial</span>
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-gold px-6 py-3 rounded-xl shadow-gold-glow flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Registrar Mesa</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER BAR */}
      <div className="flex gap-2 p-2 bg-white/5 border border-white/5 rounded-xl self-start md:hidden overflow-x-auto">
        {["all", "indoor", "outdoor", "bar"].map((loc) => (
          <button
            key={loc}
            onClick={() => setActiveLocation(loc)}
            className={`
              px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeLocation === loc 
                ? "bg-gold text-black shadow-gold-glow" 
                : "text-muted hover:text-white hover:bg-white/5"
              }
            `}
          >
            {loc === "all" ? "Todos" : loc === "indoor" ? "Interior" : loc === "outdoor" ? "Terraza" : "Barra"}
          </button>
        ))}
      </div>

      {/* DESKTOP FILTER BAR */}
      <div className="hidden md:flex gap-2 p-2 bg-white/5 border border-white/5 rounded-xl self-start">
        {["all", "indoor", "outdoor", "bar"].map((loc) => (
          <button
            key={loc}
            onClick={() => setActiveLocation(loc)}
            className={`
              px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${activeLocation === loc 
                ? "bg-gold text-black shadow-gold-glow" 
                : "text-muted hover:text-white hover:bg-white/5"
              }
            `}
          >
            {loc === "all" ? "Todos" : loc === "indoor" ? "Interior" : loc === "outdoor" ? "Terraza" : "Barra"}
          </button>
        ))}
      </div>

      {/* ERROR FEEDBACK */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-red p-4 rounded-2xl flex items-center justify-between border border-red-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" size={18} />
                <p className="text-xs font-bold text-red-200/80 uppercase tracking-widest">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SalonNextStepBanner table={selectedTable} onAction={handleBannerAction} />

      {/* MAIN OPERATIONS CENTER - RESPONSIVE */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
        
        <div className="flex-1 flex flex-col min-h-0 relative">
          <FloorPlan
            tables={filteredTables}
            loading={loading}
            selectedTable={selectedTable}
            onSelect={(table) => {
              setSelectedTable(table);
              if (isMobile) setIsInspectorOpen(true);
            }}
            viewType={viewType}
            isEditMode={isEditMode}
            onTableLayoutChange={handleTableLayoutChange}
          />
        </div>

        {/* INSPECTOR SIDEBAR - RESPONSIVE */}
        <AnimatePresence mode="wait">
          {(isInspectorOpen || (!isMobile && selectedTable)) && (
            <>
              {/* Desktop: Always show when table selected */}
              {(!isMobile && selectedTable) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="hidden md:flex flex-col min-w-[380px] max-w-[420px] min-h-0"
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
                    onViewAnalytics={handleViewAnalytics}
                    onPaymentSelector={handlePaymentSelector}
                  />
                </motion.div>
              )}

              {/* Mobile: Slide-in panel */}
              {isMobile && (
                <motion.div
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                  className="md:hidden fixed inset-y-0 right-0 w-80 bg-surface-2 border-l border-white/10 z-50 overflow-y-auto custom-scrollbar"
                >
                  <div className="sticky top-0 bg-surface-2/95 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-sm font-black text-white">Detalles Mesa</h3>
                    <button onClick={() => setIsInspectorOpen(false)} className="p-2 rounded-lg bg-white/5">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4">
                    <TableInspector
                      table={selectedTable}
                      tables={tables}
                      onOpen={handleOpen}
                      onClose={handleClose}
                      onSave={handleSave}
                      onDelete={handleDelete}
                      onOrder={() => {
                        setIsInspectorOpen(false);
                        setIsOrderOpen(true);
                      }}
                      onViewPaymentHistory={() => {
                        setIsInspectorOpen(false);
                        handleViewPaymentHistory();
                      }}
                      onViewAnalytics={() => {
                        setIsInspectorOpen(false);
                        handleViewAnalytics();
                      }}
                      onPaymentSelector={() => {
                        setIsInspectorOpen(false);
                        handlePaymentSelector();
                      }}
                      onSeatReservation={handleSeatFromInspector}
                      onViewReservation={handleViewReservation}
                    />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE TABLE SELECTOR (when no inspector) */}
      {isMobile && !isInspectorOpen && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-2 border-t border-white/10 p-4 z-40"
        >
          <button
            onClick={() => selectedTable && setIsInspectorOpen(true)}
            disabled={!selectedTable}
            className="w-full btn btn-gold py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50"
          >
            {selectedTable ? `Ver Mesa #${selectedTable.number}` : "Selecciona una mesa"}
          </button>
        </motion.div>
      )}

      {/* OVERLAYS & MODALS */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar"
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
          <ReceiptModal
            receipt={selectedReceipt}
            onClose={() => setIsReceiptModalOpen(false)}
          />
        )}

        {isAnalyticsOpen && selectedTable && (
          <TableAnalyticsDashboard
            tableId={selectedTable._id!}
            onClose={() => setIsAnalyticsOpen(false)}
          />
        )}

        {isPaymentSelectorOpen && selectedTable && selectedOrderIdForPayment && (
          <PaymentMethodSelector
            tableId={selectedTable._id!}
            orderId={selectedOrderIdForPayment}
            totalAmount={currentOrderTotal > 0 ? currentOrderTotal : 100}
            onSelect={async (method, data) => {
              try {
                setError(null);
                setLoading(true);
                let response;
                if (method === "card") {
                  response = await createCardPayment({
                    tableId: selectedTable._id!,
                    orderId: selectedOrderIdForPayment,
                    cardDetails: data.cardDetails,
                    amount: currentOrderTotal
                  });
                } else if (method === "split") {
                  response = await createSplitPayment({
                    tableId: selectedTable._id!,
                    orderId: selectedOrderIdForPayment,
                    totalSplits: data.totalSplits,
                    method: data.method,
                    amounts: data.amounts
                  });
                } else if (method === "partial") {
                  response = await createPartialPayment({
                    tableId: selectedTable._id!,
                    orderId: selectedOrderIdForPayment,
                    amount: data.amount,
                    method: data.method,
                    amountPaid: data.amountPaid
                  });
                } else if (method === "cash" || method === "transfer") {
                  response = await createStandardPayment({
                    tableId: selectedTable._id!,
                    orderId: selectedOrderIdForPayment,
                    method: method,
                    amountPaid: data?.amountPaid || currentOrderTotal
                  });
                } else {
                  throw new Error("Método de pago no soportado");
                }
                
                await fetchTables();
                console.log("Pago registrado con éxito:", response);
              } catch (err: any) {
                setError(err.message || "Error al procesar el pago");
                console.error("Error processing payment:", err);
              } finally {
                setLoading(false);
                setIsPaymentSelectorOpen(false);
                setSelectedOrderIdForPayment(null);
              }
            }}
            onClose={() => {
              setIsPaymentSelectorOpen(false);
              setSelectedOrderIdForPayment(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
