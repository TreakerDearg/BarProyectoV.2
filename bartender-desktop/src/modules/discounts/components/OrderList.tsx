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
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-100 rounded-xl">
              <LayoutGrid size={20} className="text-blue-600" />
           </div>
           <h3 className="text-lg font-bold text-gray-800">Órdenes Activas</h3>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {orders.length} disponibles
        </span>
      </div>

      {/* LISTA NEBULA */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
             <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
             <p className="text-sm text-gray-500 font-medium">Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
             <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Store size={32} className="text-gray-400" />
             </div>
             <p className="text-sm text-gray-500 font-medium">No hay órdenes activas</p>
             <p className="text-xs text-gray-400 mt-1">El local está tranquilo</p>
          </div>
        ) : (
          orders.map((orden) => (
            <button
              key={orden._id}
              onClick={() => onSelectOrder(orden)}
              className={`
                w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 group
                ${selectedOrderId === orden._id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className={`text-base font-bold ${selectedOrderId === orden._id ? "text-blue-700" : "text-gray-800"}`}>
                       Mesa {typeof orden.table === "object" ? (orden.table as any)?.number || (orden.table as any)?._id : orden.table}
                     </h4>
                     {selectedOrderId === orden._id && <ChevronRight size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                     <Clock size={12} className="text-gray-400" />
                     <p className={`font-medium ${selectedOrderId === orden._id ? "text-blue-600" : "text-gray-500"}`}>
                       {orden.items.length} productos
                     </p>
                     {orden.status && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className={`font-medium ${selectedOrderId === orden._id ? "text-blue-600" : "text-gray-500"}`}>
                          {orden.status === 'completed' ? 'Completada' : orden.status === 'in-progress' ? 'En curso' : orden.status}
                        </span>
                      </>
                     )}
                  </div>
                </div>
                <div className="text-right ml-4">
                   <p className={`text-xl font-bold ${selectedOrderId === orden._id ? "text-blue-700" : "text-gray-800"}`}>
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