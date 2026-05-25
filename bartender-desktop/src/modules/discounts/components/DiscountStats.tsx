"use client";

import type { DiscountStatsData } from "../types/discounts";
import { TrendingUp, Activity, PiggyBank } from "lucide-react";

interface Props {
  data: DiscountStatsData;
  loading?: boolean;
}

export default function NebulaDiscountStats({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* TOTAL DEL DÍA */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-green-500 relative overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
           <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Ahorro total hoy
              </p>
              <p className="text-xs text-gray-400 mt-1">Descuentos aplicados</p>
           </div>
           <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp size={24} className="text-green-600" />
           </div>
        </div>
        <p className="text-4xl font-bold text-gray-800">
          {loading ? (
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            `$${data.todayTotal.toLocaleString()}`
          )}
        </p>
      </div>

      {/* CANTIDAD APLICADA */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-amber-500 relative overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
           <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Descuentos aplicados
              </p>
              <p className="text-xs text-gray-400 mt-1">Cantidad total</p>
           </div>
           <div className="p-3 bg-amber-100 rounded-xl">
              <Activity size={24} className="text-amber-600" />
           </div>
        </div>
        <p className="text-4xl font-bold text-gray-800">
          {loading ? (
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            data.appliedCount
          )}
        </p>
      </div>

      {/* PROMEDIO DE DESCUENTO */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border-l-4 border-blue-500 relative overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
           <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Promedio de descuento
              </p>
              <p className="text-xs text-gray-400 mt-1">Porcentaje típico</p>
           </div>
           <div className="p-3 bg-blue-100 rounded-xl">
              <PiggyBank size={24} className="text-blue-600" />
           </div>
        </div>
        <p className="text-4xl font-bold text-gray-800">
          {loading ? (
            <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-lg" />
          ) : (
            `${data.averagePercent.toFixed(1)}%`
          )}
        </p>
      </div>

    </div>
  );
}