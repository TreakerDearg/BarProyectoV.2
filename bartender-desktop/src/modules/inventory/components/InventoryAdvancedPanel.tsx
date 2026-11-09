"use client";

import { useMemo } from "react";
import {
  Package,
  DollarSign,
  AlertCircle,
  BarChart3,
  Warehouse,
  Activity,
  ArrowRight,
  TrendingUp,
  Layers,
  GlassWater,
  Flame,
} from "lucide-react";
import type { InventoryItem } from "../types/inventory";
import { useInventoryUiStore } from "../store/inventoryUiStore";

interface Props {
  items: InventoryItem[];
}

function fmtMoney(n: number) {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export default function InventoryAdvancedPanel({ items }: Props) {
  const { openDrawer } = useInventoryUiStore();

  const analytics = useMemo(() => {
    // Distribución por categoría
    const categoryDistribution = items.reduce((acc, item) => {
      const category = item.category || "General";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Distribución por sector
    const sectorDistribution = items.reduce((acc, item) => {
      const sector = item.sector || "general";
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Ítems críticos (stock <= mínimo)
    const criticalItems = items
      .filter((item) => Number(item.stock) <= Number(item.minStock))
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5);

    // Ítems con stock bajo (advertencia)
    const lowStockItems = items
      .filter((item) => Number(item.stock) > Number(item.minStock) && Number(item.stock) <= Number(item.minStock) * 1.5)
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5);

    // Valor por sector
    const valueBySector = items.reduce((acc, item) => {
      const sector = item.sector || "general";
      acc[sector] = (acc[sector] || 0) + Number(item.stock) * Number(item.cost);
      return acc;
    }, {} as Record<string, number>);

    // Totales y ratios
    const totalStock = items.reduce((sum, item) => sum + Number(item.stock), 0);
    const totalMinStock = items.reduce((sum, item) => sum + Number(item.minStock), 0);
    const totalMaxStock = items.reduce((sum, item) => sum + Number(item.maxStock), 0);

    // Cobertura vs stock de seguridad
    const coverageRatio = totalMinStock > 0 ? (totalStock / totalMinStock) : 1;
    const capacityUsage = totalMaxStock > 0 ? (totalStock / totalMaxStock) * 100 : 0;
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
      coverageRatio,
      capacityUsage,
      totalValue,
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Salud y Capacidad Operativa */}
      <div className="rounded-2xl p-5 border border-[#30363D] bg-[#161B22] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(63,185,80,0.12)] text-[#3FB950] border border-[rgba(63,185,80,0.25)]">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
                Salud y Capacidad Operativa
              </h3>
              <p className="text-xs text-[#8B949E]">
                Métricas globales de volumen físico frente a mínimos
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[rgba(63,185,80,0.15)] text-[#3FB950] border border-[rgba(63,185,80,0.30)]">
            {analytics.coverageRatio >= 1.5 ? "Óptimo" : analytics.coverageRatio >= 1 ? "Atención" : "Crítico"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="text-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D]">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Stock Total</p>
            <p className="text-xl font-black text-[#E6EDF3]">{analytics.totalStock}</p>
            <p className="text-xs text-[#8B949E] mt-0.5">unidades/lotes</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D]">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Mín. Requerido</p>
            <p className="text-xl font-black text-[#E6EDF3]">{analytics.totalMinStock}</p>
            <p className="text-xs text-[#8B949E] mt-0.5">seguridad</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D]">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Cap. Máxima</p>
            <p className="text-xl font-black text-[#E6EDF3]">{analytics.totalMaxStock}</p>
            <p className="text-xs text-[#8B949E] mt-0.5">almacén</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-[#0D1117] border border-[#30363D]">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Cobertura</p>
            <p className={`text-xl font-black ${analytics.coverageRatio >= 1.5 ? "text-[#3FB950]" :
                analytics.coverageRatio >= 1 ? "text-[#F0B429]" :
                  "text-[#F85149]"
              }`}>
              {analytics.coverageRatio.toFixed(1)}x
            </p>
            <p className="text-xs text-[#8B949E] mt-0.5">vs mínimo</p>
          </div>
        </div>

        <div className="p-3 bg-[#0D1117] rounded-xl border border-[#30363D] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B949E] font-medium">Uso de Capacidad de Almacenamiento</span>
            <span className="font-bold text-[#E6EDF3]">{analytics.capacityUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-[#161B22] rounded-full overflow-hidden border border-[#30363D]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${analytics.capacityUsage >= 90 ? "bg-[#F85149]" :
                  analytics.capacityUsage >= 70 ? "bg-[#FF7B54]" :
                    "bg-[#3FB950]"
                }`}
              style={{ width: `${Math.min(analytics.capacityUsage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Valorización Económica */}
      <div className="rounded-2xl p-5 border border-[#30363D] bg-[#161B22] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)]">
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
                Valorización Económica
              </h3>
              <p className="text-xs text-[#8B949E]">
                Inversión en insumos activos valorizada al costo
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#F0B429] bg-[#21283A] px-2.5 py-1 rounded-full border border-[#30363D]">
            Capital en Stock
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] text-center">
          <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-1">Valor Total en Bóveda</p>
          <p className="text-3xl font-black text-[#F0B429] tracking-tight">{fmtMoney(analytics.totalValue)}</p>
          <p className="text-xs text-[#8B949E] mt-1">Calculado sobre insumos disponibles</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[#8B949E] font-semibold uppercase tracking-wider">Desglose por Sector</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "bar", label: "Barra", icon: <GlassWater size={13} />, val: analytics.valueBySector.bar || 0 },
              { id: "kitchen", label: "Cocina", icon: <Flame size={13} />, val: analytics.valueBySector.kitchen || 0 },
              { id: "general", label: "General", icon: <Warehouse size={13} />, val: analytics.valueBySector.general || 0 },
            ].map((sec) => (
              <div key={sec.id} className="p-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#8B949E]">
                  {sec.icon}
                  <span className="font-semibold text-[#E6EDF3]">{sec.label}</span>
                </div>
                <span className="text-xs font-bold text-[#F0B429]">{fmtMoney(sec.val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Insumos Críticos Accionables */}
      <div className="rounded-2xl p-5 border border-[#30363D] bg-[#161B22] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(248,81,73,0.12)] text-[#F85149] border border-[rgba(248,81,73,0.25)]">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
                Insumos en Estado Crítico ({analytics.criticalItems.length})
              </h3>
              <p className="text-xs text-[#F85149]">
                Requieren reposición urgente para no afectar el servicio
              </p>
            </div>
          </div>
        </div>

        {analytics.criticalItems.length > 0 ? (
          <div className="space-y-2">
            {analytics.criticalItems.map((item) => (
              <div
                key={item._id}
                onClick={() => openDrawer(item)}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-[#0D1117] border border-[#30363D] hover:border-[#F85149]/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(248,81,73,0.12)] text-[#F85149] border border-[rgba(248,81,73,0.25)] flex items-center justify-center shrink-0">
                    <Package size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#E6EDF3] capitalize truncate group-hover:text-[#F85149] transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#8B949E] truncate">
                      {item.category || "Insumo"} · {item.sector?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-black text-[#F85149]">
                      {item.stock} / {item.minStock} {item.unit}
                    </p>
                    <span className="text-xs text-[#8B949E]">stock / mín</span>
                  </div>
                  <div className="p-1 rounded-lg bg-[#21283A] text-[#8B949E] group-hover:text-[#E6EDF3]">
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#8B949E] text-xs">
            <span className="text-[#3FB950] font-bold">¡Excelente!</span> No hay insumos en nivel crítico.
          </div>
        )}
      </div>

      {/* 4. Distribución por Categorías */}
      <div className="rounded-2xl p-5 border border-[#30363D] bg-[#161B22] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[rgba(240,180,41,0.12)] text-[#F0B429] border border-[rgba(240,180,41,0.25)]">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">
                Distribución por Categorías
              </h3>
              <p className="text-xs text-[#8B949E]">
                Concentración de insumos por familia de productos
              </p>
            </div>
          </div>
          <span className="text-xs text-[#8B949E]">
            {Object.keys(analytics.categoryDistribution).length} categorías
          </span>
        </div>

        <div className="space-y-2.5">
          {Object.entries(analytics.categoryDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([category, count]) => {
              const pct = items.length > 0 ? (count / items.length) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#E6EDF3] capitalize">{category}</span>
                    <span className="text-[#8B949E]">
                      {count} insumo{count !== 1 ? "s" : ""} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
                    <div
                      className="h-full bg-[#F0B429] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
