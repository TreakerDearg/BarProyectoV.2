"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCcw, AlertCircle, X, LayoutGrid, Zap } from "lucide-react";

import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  openTable,
  closeTable,
} from "../services/tableService";

import type { Table } from "../types/table";
import socket from "../../../services/socket";

import FloorPlan from "../components/FloorPlan";
import TableInspector from "../components/TableInspector";
import TableStats from "../components/TableStats";
import TableForm from "../components/TableForm";
import OrderForm from "../../orders/components/OrderForm";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl self-start">
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
    </div>
  );
}