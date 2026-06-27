"use client";

import type { Order } from "../types/discounts";
import { Store, Clock, ChevronRight, LayoutGrid } from "lucide-react";

interface Props {
  orders: Order[];
  selectedOrderId?: string;
  loading?: boolean;
  onSelectOrder: (order: Order) => void;
}

export default function NebulaOrderList({
  orders,
  selectedOrderId,
  loading,
  onSelectOrder,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* ENCABEZADO NEBULA */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 md:gap-3">
           <div className="p-2 bg-cyan/20 rounded-xl">
              <LayoutGrid size={16} className="md:size-20 text-cyan" />
           </div>
           <h3 className="text-sm md:text-lg font-bold text-white">Órdenes Activas</h3>
        </div>
        <span className="text-[10px] md:text-xs font-semibold text-cyan bg-cyan/10 px-2 md:px-3 py-1 rounded-full border border-cyan/20">
          {orders.length} disponibles
        </span>
      </div>

      {/* LISTA NEBULA */}
      <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 pr-1 md:pr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
             <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mb-4" />
             <p className="text-xs md:text-sm text-white/50 font-medium">Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
             <div className="p-3 md:p-4 bg-white/5 rounded-full mb-4 border border-white/10">
              <Store size={24} className="md:size-32 text-white/30" />
             </div>
             <p className="text-xs md:text-sm text-white/50 font-medium">No hay órdenes activas</p>
             <p className="text-[10px] md:text-xs text-white/30 mt-1">El local está tranquilo</p>
          </div>
        ) : (
          orders.map((orden) => (
            <button
              key={orden._id}
              onClick={() => onSelectOrder(orden)}
              className={`
                w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-200 group
                ${selectedOrderId === orden._id
                  ? "bg-cyan/10 border-cyan/30 shadow-lg"
                  : "bg-white/5 border-white/10 hover:border-cyan/20 hover:bg-white/10"}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className={`text-sm md:text-base font-bold ${selectedOrderId === orden._id ? "text-cyan" : "text-white"}`}>
                       Mesa {typeof orden.table === "object" ? (orden.table as any)?.number || (orden.table as any)?._id : orden.table}
                     </h4>
                     {selectedOrderId === orden._id && <ChevronRight size={14} className="md:size-16 text-cyan" />}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] md:text-xs">
                     <Clock size={10} className="md:size-12 text-white/30" />
                     <p className={`font-medium ${selectedOrderId === orden._id ? "text-cyan/80" : "text-white/50"}`}>
                       {orden.items.length} productos
                     </p>
                     {orden.status && (
                      <>
                        <span className="text-white/20">·</span>
                        <span className={`font-medium ${selectedOrderId === orden._id ? "text-cyan/80" : "text-white/50"}`}>
                          {orden.status === 'completed' ? 'Completada' : orden.status === 'in-progress' ? 'En curso' : orden.status}
                        </span>
                      </>
                     )}
                  </div>
                </div>
                <div className="text-right ml-3 md:ml-4">
                   <p className={`text-base md:text-xl font-bold ${selectedOrderId === orden._id ? "text-cyan" : "text-white"}`}>
                     ${Number(orden.total || 0).toLocaleString()}
                   </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}