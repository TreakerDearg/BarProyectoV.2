"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, DollarSign, User, X, Download, Filter } from "lucide-react";

interface Payment {
  _id: string;
  amount: number;
  method: "cash" | "transfer";
  status: string;
  createdAt: string;
  processedBy: {
    name: string;
    role: string;
  };
  receipt?: {
    receiptNumber: string;
  };
}

interface Props {
  tableId: string;
  payments: Payment[];
  onClose: () => void;
  onReceiptClick?: (paymentId: string) => void;
}

export default function PaymentHistory({ tableId, payments, onClose, onReceiptClick }: Props) {
  const [filter, setFilter] = useState<"all" | "cash" | "transfer">("all");

  const filteredPayments = payments.filter(p => {
    if (filter === "all") return true;
    return p.method === filter;
  });

  const totalAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-8 border-b border-white/10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={16} className="text-gold" />
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Historial de Pagos</p>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Mesa #{tableId}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-muted" />
          </button>
        </div>

        {/* FILTERS */}
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <Filter size={14} className="text-muted" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === "all"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "bg-white/5 text-muted hover:bg-white/10 border border-white/10"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter("cash")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === "cash"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-muted hover:bg-white/10 border border-white/10"
              }`}
            >
              Efectivo
            </button>
            <button
              onClick={() => setFilter("transfer")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === "transfer"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-muted hover:bg-white/10 border border-white/10"
              }`}
            >
              Transferencia
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="p-6 bg-gradient-to-r from-gold/5 to-transparent border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Filtrado</p>
              <p className="text-3xl font-black text-white">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Transacciones</p>
              <p className="text-lg font-black text-white/70">{filteredPayments.length}</p>
            </div>
          </div>
        </div>

        {/* PAYMENTS LIST */}
        <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard size={48} className="text-muted/30 mx-auto mb-4" />
                <p className="text-sm font-black text-muted/50 uppercase tracking-widest">No hay pagos</p>
              </div>
            ) : (
              filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        payment.method === "cash" ? "bg-green-500/20" : "bg-blue-500/20"
                      }`}>
                        {payment.method === "cash" ? (
                          <DollarSign size={18} className="text-green-400" />
                        ) : (
                          <CreditCard size={18} className="text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">${payment.amount.toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-muted uppercase">
                          {payment.method === "cash" ? "Efectivo" : "Transferencia"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                        {payment.receipt?.receiptNumber || "N/A"}
                      </p>
                      <p className="text-xs font-black text-white/50">
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-muted" />
                      <span className="text-[10px] font-bold text-muted">
                        {payment.processedBy?.name || "N/A"}
                      </span>
                      <span className="text-[9px] text-muted/50 uppercase">
                        {payment.processedBy?.role || ""}
                      </span>
                    </div>
                    <button
                      onClick={() => onReceiptClick?.(payment._id)}
                      className="text-[10px] font-black text-gold hover:text-gold/80 uppercase tracking-widest flex items-center gap-1"
                    >
                      <Download size={10} />
                      Recibo
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <p className="text-[10px] font-black text-muted/50 uppercase tracking-widest">
            {payments.length} pagos totales registrados
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gold/10 text-gold border border-gold/30 text-[10px] font-black uppercase tracking-widest hover:bg-gold/20 transition-all"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
