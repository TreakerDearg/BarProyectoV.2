"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Wrench,
  Pencil,
  Trash2,
  ClipboardList,
  Users,
  MapPin,
  Info,
  Calendar,
  X,
  DollarSign,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import TableForm from "./TableForm";
import type { Table } from "../types/table";

interface Props {
  table: Table | null;
  tables: Table[];
  onOpen: (id: string) => void;
  onClose: (id: string) => void;
  onSave: (table: Table) => void;
  onDelete: (id: string) => void;
  onOrder: () => void;
}

const statusConfig: any = {
  available: { label: "LIBRE", color: "text-gold", bg: "bg-gold/10", border: "border-gold/20", glow: "shadow-gold-glow/20" },
  occupied: { label: "OCUPADA", color: "text-orange", bg: "bg-orange/10", border: "border-orange/20", glow: "shadow-orange-glow/20" },
  reserved: { label: "RESERVADA", color: "text-blue", bg: "bg-blue/10", border: "border-blue/20", glow: "shadow-blue-glow/20" },
  maintenance: { label: "MANTENIMIENTO", color: "text-red", bg: "bg-red/10", border: "border-red/20", glow: "shadow-red-glow/20" },
};

export default function TableInspector({
  table,
  tables,
  onOpen,
  onClose,
  onSave,
  onDelete,
  onOrder,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (!table) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 glass rounded-[2.5rem] border-white/5 opacity-40">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Info size={32} className="text-muted" />
        </div>
        <h3 className="text-lg font-black text-white/50 uppercase tracking-widest">Panel de Control</h3>
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-2">Selecciona un activo del plano</p>
      </div>
    );
  }

  if (editing) {
    return (
      <TableForm
        table={table}
        existingTables={tables}
        onSave={(t) => {
          onSave(t);
          setEditing(false);
        }}
        onClose={() => setEditing(false)}
      />
    );
  }

  const config = statusConfig[table.status] || statusConfig.maintenance;
  const totalAmount = table.orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col glass rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl relative"
    >
      {/* HEADER DECOR */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 pointer-events-none ${config.bg}`} />

      {/* HEADER */}
      <div className="p-8 pb-4 relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-gold shadow-gold-glow" />
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Asset Inspector</p>
            </div>
            <h2 className="text-4xl font-black text-grad-gold tracking-tighter">MESA {table.number}</h2>
          </div>
          <div className={`px-4 py-1.5 rounded-full border ${config.bg} ${config.border} ${config.glow} backdrop-blur-md`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Capacidad</p>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gold" />
              <span className="text-lg font-black text-white/80">{table.capacity} <span className="text-[10px] opacity-40 uppercase">Pax</span></span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Cuenta Actual</p>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-lg font-black text-white/80">${totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 p-8 pt-4 space-y-8 overflow-y-auto custom-scrollbar">
        {/* DETAILS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Info size={12} className="text-gold opacity-50" />
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Especificaciones</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-muted uppercase">Ubicación</span>
              <span className="text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-gold" />
                {table.location}
              </span>
            </div>
            
            <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-muted uppercase">Último Cierre</span>
              <span className="text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} className="text-gold" />
                {table.closedAt ? new Date(table.closedAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* NOTES & TAGS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={12} className="text-gold opacity-50" />
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notas de Servicio</h4>
          </div>

          <div className="p-4 rounded-2xl bg-black/20 border border-white/5 min-h-[80px]">
            {table.notes ? (
              <p className="text-xs text-dim italic leading-relaxed">"{table.notes}"</p>
            ) : (
              <p className="text-[10px] text-muted/30 italic">No hay notas de servicio registradas para este activo.</p>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-8 bg-surface-2 border-t border-white/5 space-y-4">
        {table.status === "available" ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(table._id!)}
            className="btn btn-gold w-full py-4 rounded-2xl shadow-gold-glow flex items-center justify-center gap-3 text-sm font-black"
          >
            <Play size={18} fill="currentColor" />
            ABRIR MESA
          </motion.button>
        ) : table.status === "occupied" ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOrder}
            className="btn btn-gold w-full py-4 rounded-2xl shadow-gold-glow flex items-center justify-center gap-3 text-sm font-black"
          >
            <ClipboardList size={18} />
            GESTIONAR PEDIDOS
          </motion.button>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setEditing(true)}
            className="btn btn-ghost py-3 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5"
          >
            <Pencil size={14} />
            Configurar
          </button>
          <button
            onClick={() => onClose(table._id!)}
            className="btn btn-ghost py-3 rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5"
          >
            <Wrench size={14} />
            Servicio
          </button>
        </div>

        <button
          onClick={() => {
            if(window.confirm("¿Estás seguro de eliminar este activo?")) {
              onDelete(table._id!);
            }
          }}
          className="w-full py-3 text-[9px] font-black uppercase tracking-[0.3em] text-red-500/30 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={12} />
          Decomisionar Mesa
        </button>
      </div>
    </motion.div>
  );
}