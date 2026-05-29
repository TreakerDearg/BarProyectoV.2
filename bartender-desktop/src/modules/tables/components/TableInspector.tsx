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
  DollarSign,
  Clock,
  ShieldCheck,
  CreditCard,
  Receipt,
  Calendar,
  TrendingUp,
  Wallet,
  Maximize
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
  onViewPaymentHistory?: () => void;
  onViewAnalytics?: () => void;
  onPaymentSelector?: () => void;
  onSeatReservation?: () => void;
  onViewReservation?: () => void;
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
  onViewPaymentHistory,
  onViewAnalytics,
  onPaymentSelector,
  onSeatReservation,
  onViewReservation,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (!table) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 glass rounded-2xl md:rounded-[2.5rem] border-white/5 opacity-40">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 md:mb-6">
          <Info size={32} className="w-6 h-6 md:w-8 md:h-8 text-muted" />
        </div>
        <h3 className="text-sm md:text-lg font-black text-white/50 uppercase tracking-widest">Panel de Control</h3>
        <p className="text-[9px] md:text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-2">Selecciona un activo del plano</p>
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
  const totalAmount = table.totalAmount || (table.orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col glass rounded-2xl md:rounded-[2.5rem] border-white/5 overflow-hidden shadow-2xl relative"
    >
      {/* HEADER DECOR */}
      <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 blur-[60px] md:blur-[80px] opacity-20 pointer-events-none ${config.bg}`} />

      {/* HEADER - RESPONSIVE */}
      <div className="p-4 md:p-8 pb-3 md:pb-4 relative">
        <div className="flex justify-between items-start mb-4 md:mb-6 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-gold shadow-gold-glow" />
              <p className="text-[8px] md:text-[10px] font-black text-muted uppercase tracking-[0.3em]">Asset Inspector</p>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-grad-gold tracking-tighter leading-tight">
              MESA <span className="text-white">{table.number}</span>
            </h2>
          </div>
          <div className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full border flex-shrink-0 ${config.bg} ${config.border} ${config.glow} backdrop-blur-md`}>
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* QUICK STATS - RESPONSIVE GRID */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5">
            <p className="text-[8px] md:text-[9px] font-black text-muted uppercase tracking-widest mb-1">Capacidad</p>
            <div className="flex items-center gap-2">
              <Users size={16} className="w-4 h-4 md:w-5 md:h-5 text-gold" />
              <span className="text-base md:text-lg font-black text-white/80">{table.capacity} <span className="text-[9px] md:text-[10px] opacity-40 uppercase">Pax</span></span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5">
            <p className="text-[8px] md:text-[9px] font-black text-muted uppercase tracking-widest mb-1">Cuenta Actual</p>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              <span className="text-base md:text-lg font-black text-white/80">${totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY - SCROLLABLE */}
      <div className="flex-1 p-4 md:p-8 pt-3 md:pt-4 space-y-4 md:space-y-8 overflow-y-auto custom-scrollbar">
        {/* DETAILS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Info size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold opacity-50" />
            <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Especificaciones</h4>
          </div>
          
          <div className="space-y-2 md:space-y-4">
            <div className="flex justify-between items-center px-3 md:px-4 py-2 md:py-3 bg-white/5 rounded-lg md:rounded-xl border border-white/5">
              <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Ubicación</span>
              <span className="text-[10px] md:text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                <MapPin size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                {table.location}
              </span>
            </div>
            
            <div className="flex justify-between items-center px-3 md:px-4 py-2 md:py-3 bg-white/5 rounded-lg md:rounded-xl border border-white/5">
              <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Último Cierre</span>
              <span className="text-[10px] md:text-xs font-black text-white/70 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                <Clock size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold" />
                {table.closedAt ? new Date(table.closedAt).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* NOTES & TAGS */}
        <section>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <ShieldCheck size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold opacity-50" />
            <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notas de Servicio</h4>
          </div>

          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 min-h-[60px] md:min-h-[80px]">
            {table.notes ? (
              <p className="text-[10px] md:text-xs text-dim italic leading-relaxed">"{table.notes}"</p>
            ) : (
              <p className="text-[9px] md:text-[10px] text-muted/30 italic">No hay notas de servicio registradas para este activo.</p>
            )}
          </div>
        </section>

        {/* DIMENSIONES RÁPIDAS DE PLANO (Ajuste Humano) */}
        <section className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Maximize size={12} className="text-gold opacity-50" />
            <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Dimensiones de Salón</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-muted uppercase tracking-wider">Ancho ({table.width || 120}px)</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onSave({ ...table, width: Math.max(60, (table.width || 120) - 10) })}
                  className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[10px] font-black text-white transition-all"
                >
                  -10px
                </button>
                <button
                  type="button"
                  onClick={() => onSave({ ...table, width: Math.min(250, (table.width || 120) + 10) })}
                  className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[10px] font-black text-white transition-all"
                >
                  +10px
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 p-3 bg-black/20 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-muted uppercase tracking-wider">Alto ({table.height || 120}px)</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onSave({ ...table, height: Math.max(60, (table.height || 120) - 10) })}
                  className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[10px] font-black text-white transition-all"
                >
                  -10px
                </button>
                <button
                  type="button"
                  onClick={() => onSave({ ...table, height: Math.min(250, (table.height || 120) + 10) })}
                  className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[10px] font-black text-white transition-all"
                >
                  +10px
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RESERVATION SECTION */}
        {table.status === "reserved" && table.currentReservation && (
          <section>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Calendar size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold opacity-50" />
              <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Reserva Actual</h4>
            </div>

            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-blue/10 border border-blue/20 space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Estado</span>
                <span className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest">Confirmada</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">ID Reserva</span>
                <span className="text-[10px] md:text-xs font-black text-white/70 uppercase tracking-widest">
                  {table.currentReservation.toString().slice(-8)}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {onViewReservation && (
                  <button
                    type="button"
                    onClick={onViewReservation}
                    className="w-full py-2 rounded-lg text-[10px] font-semibold text-violet-300 border border-violet-400/25 hover:bg-violet-500/10"
                  >
                    Ver en Reservas
                  </button>
                )}
                {onSeatReservation && (
                  <button
                    type="button"
                    onClick={onSeatReservation}
                    className="w-full py-2.5 rounded-lg nebula-btn-primary text-[10px] font-semibold uppercase tracking-wide"
                  >
                    Sentar clientes
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ORDERS SUMMARY SECTION */}
        {table.status === "occupied" && (
          <section>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <ClipboardList size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold opacity-50" />
              <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Resumen de Pedidos</h4>
            </div>

            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 space-y-2 md:space-y-3">
              {table.totalAmount && table.totalAmount > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Total de Pedidos</span>
                    <span className="text-base md:text-lg font-black text-green-400">${table.totalAmount.toFixed(2)}</span>
                  </div>

                  {table.totalItems && table.totalItems > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Total de Items</span>
                      <span className="text-base md:text-lg font-black text-blue-400">{table.totalItems}</span>
                    </div>
                  )}

                  {table.itemCounts && Object.keys(table.itemCounts).length > 0 && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase block mb-2">Items por Producto</span>
                      <div className="space-y-1">
                        {Object.entries(table.itemCounts).map(([name, count]) => (
                          <div key={name} className="flex justify-between items-center text-[10px] md:text-xs">
                            <span className="text-white/70">{name}</span>
                            <span className="font-black text-white">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <span className="text-[9px] md:text-[10px] font-bold text-muted/50 uppercase">Sin pedidos registrados</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PAYMENTS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <CreditCard size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold opacity-50" />
            <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Pagos de Sesión</h4>
          </div>

          <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-black/20 border border-white/5 space-y-2 md:space-y-3">
            {table.totalPayments && table.totalPayments > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Total Pagado</span>
                  <span className="text-base md:text-lg font-black text-blue-400">${table.totalPayments.toFixed(2)}</span>
                </div>

                {table.lastPaymentAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] md:text-[10px] font-bold text-muted uppercase">Último Pago</span>
                    <span className="text-[10px] md:text-xs font-black text-white/70">
                      {new Date(table.lastPaymentAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-2">
                <span className="text-[9px] md:text-[10px] font-bold text-muted/50 uppercase">Sin pagos registrados</span>
              </div>
            )}

            <button
              onClick={onViewPaymentHistory}
              className="w-full py-2 rounded-lg md:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1 md:gap-2"
            >
              <Receipt size={12} className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Ver Historial de Pagos</span>
              <span className="sm:hidden">Historial Pagos</span>
            </button>
          </div>
        </section>

        {/* ANALYTICS SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <TrendingUp size={12} className="w-3 h-3 md:w-4 md:h-4 text-gold opacity-50" />
            <h4 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Analytics de Rendimiento</h4>
          </div>

          <button
            onClick={onViewAnalytics}
            className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl bg-gold/10 border border-gold/20 text-gold text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-gold/20 transition-all flex items-center justify-center gap-1 md:gap-2"
          >
            <TrendingUp size={16} className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Ver Analytics de Mesa</span>
            <span className="sm:hidden">Analytics</span>
          </button>
        </section>
      </div>

      {/* FOOTER ACTIONS - RESPONSIVE */}
      <div className="p-4 md:p-8 bg-surface-2 border-t border-white/5 space-y-3 md:space-y-4">
        {table.status === "available" ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpen(table._id!)}
            className="w-full btn btn-gold !py-3 md:!py-4 !rounded-xl md:!rounded-2xl flex items-center justify-center gap-2 md:gap-3"
          >
            <Play size={18} className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">Abrir Mesa</span>
          </motion.button>
        ) : table.status === "occupied" ? (
          <div className="space-y-2 md:space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOrder}
              className="w-full btn btn-ghost !py-2 md:!py-3 !rounded-lg md:!rounded-xl flex items-center justify-center gap-1 md:gap-2 border border-white/10"
            >
              <ClipboardList size={16} className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">Nueva Orden</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPaymentSelector}
              className="w-full btn btn-gold !py-2 md:!py-3 !rounded-lg md:!rounded-xl flex items-center justify-center gap-1 md:gap-2 shadow-gold-glow"
            >
              <Wallet size={16} className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">Procesar Pago</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClose(table._id!)}
              className="w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-1 md:gap-2"
            >
              <Wrench size={16} className="w-4 h-4 md:w-5 md:h-5" />
              Cerrar Mesa
            </motion.button>
          </div>
        ) : table.status === "reserved" ? (
          onSeatReservation ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSeatReservation}
              className="w-full nebula-btn-primary !py-3 md:!py-4 !rounded-xl flex items-center justify-center gap-2"
            >
              <Users size={18} />
              <span className="font-semibold uppercase tracking-wide text-[10px] md:text-xs">
                Sentar clientes
              </span>
            </motion.button>
          ) : null
        ) : (
          <div className="text-center py-3 md:py-4">
            <p className="text-[9px] md:text-[10px] text-muted/50 uppercase tracking-widest">
              En mantenimiento
            </p>
          </div>
        )}

        {/* ADMIN ACTIONS */}
        <div className="pt-3 md:pt-4 border-t border-white/10 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditing(true)}
            className="flex-1 p-2 md:p-3 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-1 md:gap-2"
          >
            <Pencil size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted" />
            <span className="hidden md:inline text-[10px] font-black text-muted uppercase">Editar</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(table._id!)}
            className="flex-1 p-2 md:p-3 rounded-lg md:rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1 md:gap-2"
          >
            <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500/50" />
            <span className="hidden md:inline text-[10px] font-black text-red-500/50 uppercase">Eliminar</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
