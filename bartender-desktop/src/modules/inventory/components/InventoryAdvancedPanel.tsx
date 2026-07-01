"use client";

import { useMemo } from "react";
import {
  Package,
  DollarSign,
  AlertCircle,
  BarChart3,
  Warehouse,
  Activity,
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

    // Calculate low stock items (warning level)
    const lowStockItems = items
      .filter((item) => Number(item.stock) > Number(item.minStock) && Number(item.stock) <= Number(item.minStock) * 1.5)
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
    const totalMaxStock = items.reduce((sum, item) => sum + Number(item.maxStock), 0);
    const stockHealth = totalMinStock > 0 ? (totalStock / totalMinStock) * 100 : 0;
    const capacityUsage = totalMaxStock > 0 ? (totalStock / totalMaxStock) * 100 : 0;

    // Calculate total inventory value
    const totalValue = items.reduce((sum, item) => sum + Number(item.stock) * Number(item.cost), 0);

    return {
      categoryDistribution,
      sectorDistribution,
      criticalItems,
      lowStockItems,
      valueBySector,
      totalStock,
      totalMinStock,
      totalMaxStock,
      stockHealth,
      capacityUsage,
      totalValue,
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stock Health Indicator */}
      <div className="rounded-2xl p-6 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-500/30">
            <BarChart3 size={20} className="text-violet-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Salud del Inventario</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Stock Total</p>
            <p className="text-2xl font-black text-white">{analytics.totalStock}</p>
            <p className="text-xs text-white/40 mt-1">unidades</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Mínimo Requerido</p>
            <p className="text-2xl font-black text-white">{analytics.totalMinStock}</p>
            <p className="text-xs text-white/40 mt-1">unidades</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Capacidad Máxima</p>
            <p className="text-2xl font-black text-white">{analytics.totalMaxStock}</p>
            <p className="text-xs text-white/40 mt-1">unidades</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-2">Salud</p>
            <p className={`text-2xl font-black ${
              analytics.stockHealth >= 100 ? "text-emerald-400" :
              analytics.stockHealth >= 70 ? "text-gold" :
              "text-red-400"
            }`}>
              {analytics.stockHealth.toFixed(0)}%
            </p>
            <p className="text-xs text-white/40 mt-1">vs mínimo</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Uso de Capacidad</span>
            <span className="text-sm font-bold text-white">{analytics.capacityUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                analytics.capacityUsage >= 90 ? "bg-red-500" :
                analytics.capacityUsage >= 70 ? "bg-amber-500" :
                "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(analytics.capacityUsage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Value Overview */}
      <div className="rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border border-emerald-500/30">
            <DollarSign size={20} className="text-emerald-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Valor del Inventario</h3>
        </div>
        <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10 mb-4">
          <p className="text-xs text-white/50 mb-2">Valor Total</p>
          <p className="text-3xl font-black text-gold">${analytics.totalValue.toFixed(2)}</p>
          <p className="text-xs text-white/40 mt-1">en inventario</p>
        </div>
        <div className="space-y-3">
          <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-3">Valor por Sector</p>
          {Object.entries(analytics.valueBySector).map(([sector, value]) => (
            <div key={sector} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                <Warehouse size={16} className="text-emerald-400" />
                <span className="text-sm font-semibold text-white capitalize">{sector}</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">${value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Items */}
      {analytics.criticalItems.length > 0 && (
        <div className="rounded-2xl p-6 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/20 border border-red-500/30">
              <AlertCircle size={20} className="text-red-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Items Críticos</h3>
              <p className="text-xs text-red-400">Reposición Urgente</p>
            </div>
          </div>
          <div className="space-y-2">
            {analytics.criticalItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-red/20 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <Package size={16} />
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
                  <p className="text-xs text-white/50">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Warning */}
      {analytics.lowStockItems.length > 0 && (
        <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/30">
              <Activity size={20} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Stock Bajo</h3>
              <p className="text-xs text-amber-400">Considerar Reposición</p>
            </div>
          </div>
          <div className="space-y-2">
            {analytics.lowStockItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-amber/20 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-white/50">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-400">
                    {item.stock} / {item.minStock}
                  </p>
                  <p className="text-xs text-white/50">{item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      <div className="rounded-2xl p-6 border border-gold/20 bg-gradient-to-br from-gold/10 to-amber-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gold/30 to-amber-500/20 border border-gold/30">
            <Package size={20} className="text-gold" />
          </div>
          <h3 className="text-lg font-bold text-white">Distribución por Categoría</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(analytics.categoryDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([category, count]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{count}</span>
                    <span className="text-xs text-white/40">
                      ({((count / items.length) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold/60 rounded-full transition-all"
                    style={{
                      width: `${(count / items.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Sector Distribution */}
      <div className="rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/30">
            <Warehouse size={20} className="text-cyan-300" />
          </div>
          <h3 className="text-lg font-bold text-white">Distribución por Sector</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(analytics.sectorDistribution).map(([sector, count]) => (
            <div key={sector} className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-center mb-2">
                <Warehouse size={24} className="text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white">{count}</p>
              <p className="text-xs text-white/50 capitalize mt-1">{sector}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}