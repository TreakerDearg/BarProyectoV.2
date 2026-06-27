"use client";

import { useMemo } from "react";
import {
  Package,
  DollarSign,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import type { InventoryItem } from "../types/inventory";

interface Props {
  items: InventoryItem[];
}

export default function InventoryAdvancedPanel({ items }: Props) {
  const analytics = useMemo(() => {
    // Calculate category distribution
    const categoryDistribution = items.reduce((acc, item) => {
      const category = item.category || "Sin categoría";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate sector distribution
    const sectorDistribution = items.reduce((acc, item) => {
      const sector = item.sector || "general";
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate top critical items
    const criticalItems = items
      .filter((item) => Number(item.stock) <= Number(item.minStock))
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5);

    // Calculate value by sector
    const valueBySector = items.reduce((acc, item) => {
      const sector = item.sector || "general";
      acc[sector] = (acc[sector] || 0) + Number(item.stock) * Number(item.cost);
      return acc;
    }, {} as Record<string, number>);

    // Calculate stock trends (simplified)
    const totalStock = items.reduce((sum, item) => sum + Number(item.stock), 0);
    const totalMinStock = items.reduce((sum, item) => sum + Number(item.minStock), 0);
    const stockHealth = totalMinStock > 0 ? (totalStock / totalMinStock) * 100 : 0;

    return {
      categoryDistribution,
      sectorDistribution,
      criticalItems,
      valueBySector,
      totalStock,
      totalMinStock,
      stockHealth,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Stock Health Indicator */}
      <div className="rounded-2xl p-6 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-500/30">
            <BarChart3 size={20} className="text-violet-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Salud del Inventario</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Stock Total</p>
            <p className="text-2xl font-black text-white">{analytics.totalStock}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Mínimo Requerido</p>
            <p className="text-2xl font-black text-white">{analytics.totalMinStock}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Salud</p>
            <p className={`text-2xl font-black ${
              analytics.stockHealth >= 100 ? "text-emerald-400" :
              analytics.stockHealth >= 70 ? "text-gold" :
              "text-red-400"
            }`}>
              {analytics.stockHealth.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Critical Items */}
      {analytics.criticalItems.length > 0 && (
        <div className="rounded-2xl p-6 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/20 border border-red-500/30">
              <AlertCircle size={20} className="text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Items Críticos - Reposición Urgente</h3>
          </div>
          <div className="space-y-3">
            {analytics.criticalItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-white/50">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-400">
                    {item.stock} / {item.minStock}
                  </p>
                  <p className="text-xs text-white/50">Unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      <div className="rounded-2xl p-6 border border-gold/20 bg-gradient-to-br from-gold/10 to-amber-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gold/30 to-amber-500/20 border border-gold/30">
            <Package size={20} className="text-gold" />
          </div>
          <h3 className="text-lg font-bold text-white">Distribución por Categoría</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(analytics.categoryDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => (
              <div key={category} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-white/70">{category}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-gold/60 rounded-full"
                      style={{
                        width: `${(count / items.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Value by Sector */}
      <div className="rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border border-emerald-500/30">
            <DollarSign size={20} className="text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Valor por Sector</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(analytics.valueBySector).map(([sector, value]) => (
            <div key={sector} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-1 capitalize">{sector}</p>
              <p className="text-lg font-black text-emerald-400">
                ${value.toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}