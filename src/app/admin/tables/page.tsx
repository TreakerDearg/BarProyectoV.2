"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCcw, AlertCircle, X, LayoutGrid, Zap, BookOpen } from "lucide-react";

import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  openTable,
  closeTable,
} from "./services/tableService";

import type { Table } from "./types/table";
import socket from "@/lib/api/socket";

import FloorPlan from "./components/FloorPlan";
import TableInspector from "./components/TableInspector";
import TableStats from "./components/TableStats";
import TableForm from "./components/TableForm";
import OrderForm from "../../admin/orders/components/OrderForm";
import MiniCalendar from "./components/MiniCalendar";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [filterDate, setFilterDate] = useState<string>("" );
  const [activeLocation, setActiveLocation] = useState<string>("all");

  const fetchTables = async (date?: string) => {
    try {
      setLoading(true);
      const data = await getTables(date);
      setTables(data || []);
    } catch (err: any) {
      setError("Fallo en la sincronización de activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // existing useEffect for sockets unchanged ...
export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data || []);
    } catch (err: any) {
      setError("Fallo en la sincronización de activos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    const handleUpdate = (updated: Table) => {
      setTables((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      if (selectedTable?._id === updated._id) setSelectedTable(updated);
    };

    const handleCreated = (t: Table) =>
      setTables((prev) => [...prev, t]);

    const handleDeleted = (id: string) => {
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

  const handleOpen = async (id: string) => {
    try {
      const updated = await openTable(id);
      setSelectedTable(updated);
      setIsOrderOpen(true);
    } catch (err) {
      setError("Error al inicializar sesión de mesa");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeTable(id);
    } catch (err) {
      setError("Error al finalizar sesión");
    }
  };

  const handleSave = async (tableData: Table) => {
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
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
      setSelectedTable(null);
    } catch (err) {
      setError("No se pudo eliminar el activo");
    }
  };

  const [activeLocation, setActiveLocation] = useState<string>("all");

  const filteredTables = activeLocation === "all" 
    ? tables 
    : tables.filter(t => t.location === activeLocation);

  return (
    <div className="flex flex-col h-screen overflow-hidden p-6 space-y-6">
      
      {/* TOP COMMAND BAR */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-gold/20 text-gold shadow-gold-glow/20">
              <Zap size={14} fill="currentColor" />
            </div>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em]">
              Central Command · Hospitality Ops
            </p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-grad-gold leading-none">
            CONTROL DE <span className="text-white">SALÓN</span>
          </h1>
        </div>

        <div className="flex gap-4">
          <div className="hidden lg:block">
             <TableStats tables={tables} />
          </div>

          <div className="flex gap-2 self-end">
            <button
              onClick={fetchTables}
              className="btn btn-ghost !p-3 rounded-2xl hover:bg-white/5 border border-white/5"
              title="Sincronizar"
            >
              <RefreshCcw size={18} className={loading ? "animate-spin" : "opacity-50"} />
            </button>

            <button
              onClick={() => setShowTutorial(true)}
              className="btn btn-ghost !p-3 rounded-2xl hover:bg-white/5 border border-white/5"
              title="Tutorial"
            >
              <BookOpen size={18} />
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-gold px-8 py-3 rounded-2xl shadow-gold-glow flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <Plus size={18} />
              Registrar Mesa
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-2 p-1.5 glass-royale rounded-2xl self-start shadow-lg">
        {["all", "indoor", "outdoor", "bar"].map((loc) => (
          <button
            key={loc}
            onClick={() => setActiveLocation(loc)}
            className={`
              px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${activeLocation === loc 
                ? "bg-gold text-black shadow-gold-glow" 
                : "text-muted hover:text-white hover:bg-white/5"}
            `}
          >
            {loc === "all" ? "Todos" : loc === "indoor" ? "Interior" : loc === "outdoor" ? "Terraza" : "Barra"}
          </button>
        ))}
      </div>

      {/* ERROR FEEDBACK */}
      {error && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
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

      {/* MAIN OPERATIONS CENTER */}
      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* INTERACTIVE FLOOR PLAN AREA */}
        <div className="flex-[3] flex flex-col min-h-0">
          <FloorPlan
            tables={filteredTables}
            loading={loading}
            selectedTable={selectedTable}
            onSelect={setSelectedTable}
          />
        </div>

        {/* ASSET INSPECTOR SIDEBAR */}
        <div className="flex-1 min-w-[380px] max-w-[420px] flex flex-col min-h-0">
          <TableInspector
            table={selectedTable}
            tables={tables}
            onOpen={handleOpen}
            onClose={handleClose}
            onSave={handleSave}
            onDelete={handleDelete}
            onOrder={() => setIsOrderOpen(true)}
          />
        </div>

      </div>

      {/* OVERLAYS & MODALS */}
      {isFormOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-8"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-xl"
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

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-zinc-900 border border-gold/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gold/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Tutorial del Sistema de Mesas
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Guía rápida para gestionar el salón
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTutorial(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                  <LayoutGrid size={16} />
                  Conceptos Básicos
                </h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• <strong>Estados de Mesa:</strong> Disponible, Reservada, Mantenimiento, Abierta, Consumiendo, Pago Parcial, Pagada</li>
                  <li>• <strong>Vistas:</strong> Plano (espacial) y Lista (cuadrícula)</li>
                  <li>• <strong>Modo Edición:</strong> Permite arrastrar mesas para reorganizar el plano</li>
                  <li>• <strong>Filtros:</strong> Interior, Terraza, Barra, Todos</li>
                </ul>
              </div>

              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gold mb-2 flex items-center gap-2">
                  <Zap size={16} />
                  Flujo de Trabajo
                </h3>
                <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
                  <li>Selecciona una mesa disponible para ver detalles</li>
                  <li>Abre la mesa para iniciar una sesión de clientes</li>
                  <li>Agrega pedidos desde el inspector o formulario de órdenes</li>
                  <li>Procesa pagos con diferentes métodos</li>
                  <li>Cierra la mesa cuando los clientes se van</li>
                </ol>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Consejos de Administración
                </h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>• Usa el modo edición para organizar el plano según flujo operativo</li>
                  <li>• Los estados de pago parcial se muestran en púrpura pulsante</li>
                  <li>• Las mesas pagadas muestran un check verde vibrante</li>
                  <li>• Revisa el historial de pagos para auditoría</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-zinc-800/50">
              <button
                onClick={() => setShowTutorial(false)}
                className="w-full px-6 py-3 bg-gold hover:bg-gold/90 text-black font-bold rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
