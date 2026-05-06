"use client";

import type { Order } from "../types/discounts";
import { Briefcase, Target, ChevronRight, LayoutGrid, Clock } from "lucide-react";

interface Props {
  orders: Order[];
  selectedOrderId?: string;
  loading?: boolean;
  onSelectOrder: (order: Order) => void;
}

export default function OrderList({
  orders,
  selectedOrderId,
  loading,
  onSelectOrder,
}: Props) {
  return (
    <div className="flex flex-col h-full glass-royale rounded-[3.5rem] border border-white/5 overflow-hidden shadow-royale">
      <div className="p-8 bg-surface-3/50 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="p-3 rounded-xl bg-gold/10 text-gold shadow-gold-glow">
              <LayoutGrid size={20} />
           </div>
           <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Comandas</h3>
        </div>
        <span className="text-[10px] font-black text-gold uppercase tracking-widest">{orders.length} ACTIVAS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
             <div className="spinner mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sincronizando...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
             <Target size={48} className="mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Salón Limpio</p>
          </div>
        ) : (
          orders.map((order) => (
            <button
              key={order._id}
              onClick={() => onSelectOrder(order)}
              className={`
                w-full p-6 rounded-[2rem] border text-left transition-all duration-500 group relative overflow-hidden
                ${selectedOrderId === order._id
                  ? "bg-grad-gold border-gold shadow-gold-glow"
                  : "bg-surface-3 border-white/5 hover:border-white/20 hover:bg-surface-4"}
              `}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                     <h4 className={`text-xl font-black uppercase tracking-tighter ${selectedOrderId === order._id ? "text-bg" : "text-ivory"}`}>
                       Mesa {order.table}
                     </h4>
                     {selectedOrderId === order._id && <ChevronRight size={18} className="text-bg animate-pulse" />}
                  </div>
                  <div className="flex items-center gap-3">
                     <p className={`text-[9px] font-black uppercase tracking-widest ${selectedOrderId === order._id ? "text-bg/60" : "text-muted"}`}>
                       {order.items.length} ITEMS · {order.status?.toUpperCase() || "ABIERTA"}
                     </p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-2xl font-black tracking-tighter ${selectedOrderId === order._id ? "text-bg" : "text-gold"}`}>
                     ${Number(order.total || 0).toLocaleString()}
                   </p>
                </div>
              </div>

              {/* ATMOSPHERIC ICON */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <Briefcase size={80} className={selectedOrderId === order._id ? "text-bg" : "text-gold"} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}