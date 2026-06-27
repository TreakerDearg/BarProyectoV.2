"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  PieChart
} from "lucide-react";
import type { InventoryItem } from "../types/inventory";

interface Props {
  items: InventoryItem[];
  onExport?: (format: "json" | "csv") => void;
}

export default function ReportsPanel({ items, onExport }: Props) {
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [selectedReport, setSelectedReport] = useState<"rotation" | "cost" | "loss" | "efficiency">("rotation");

  const reports = useMemo(() => {
    // Rotation Report
    const rotationReport = {
      fastMoving: items.filter((i) => Number(i.stock) < Number(i.minStock) * 2).length,
      slowMoving: items.filter((i) => Number(i.stock) > Number(i.maxStock) * 0.8).length,
      optimal: items.filter((i) => {
        const stock = Number(i.stock);
        const min = Number(i.minStock);
        const max = Number(i.maxStock);
        return stock >= min * 2 && stock <= max * 0.8;
      }).length,
    };

    // Cost Report
    const costReport = {
      totalValue: items.reduce((sum, i) => sum + Number(i.stock) * Number(i.cost), 0),
      averageCost: items.length > 0 ? items.reduce((sum, i) => sum + Number(i.cost), 0) / items.length : 0,
      highCostItems: items.filter((i) => Number(i.cost) > (costReport?.averageCost || 0) * 1.5).length,
      costVariance: items.length > 0 ? Math.sqrt(
        items.reduce((sum, i) => sum + Math.pow(Number(i.cost) - (costReport?.averageCost || 0), 2), 0) / items.length
      ) : 0,
    };

    // Loss Report (simulated based on critical items)
    const lossReport = {
      criticalItems: items.filter((i) => Number(i.stock) <= Number(i.minStock)).length,
      potentialLoss: items
        .filter((i) => Number(i.stock) <= Number(i.minStock))
        .reduce((sum, i) => sum + (Number(i.minStock) - Number(i.stock)) * Number(i.cost), 0),
      expiredValue: 0, // Would come from lot data
    };

    // Efficiency Report
    const efficiencyReport = {
      stockHealth: items.length > 0 
        ? (items.filter((i) => Number(i.stock) >= Number(i.minStock)).length / items.length) * 100 
        : 0,
      categoryDiversity: new Set(items.map((i) => i.category)).size,
      locationUtilization: {
        bar: items.filter((i) => i.location === "bar").length,
        kitchen: items.filter((i) => i.location === "kitchen").length,
        storage: items.filter((i) => i.location === "storage").length,
      },
    };

    return { rotationReport, costReport, lossReport, efficiencyReport };
  }, [items]);

  const reportConfig = {
    rotation: {
      title: "Reporte de Rotación",
      icon: <TrendingUp size={20} className="text-cyan" />,
      color: "cyan",
    },
    cost: {
      title: "Reporte de Costos",
      icon: <DollarSign size={20} className="text-gold" />,
      color: "gold",
    },
    loss: {
      title: "Reporte de Pérdidas",
      icon: <AlertTriangle size={20} className="text-red" />,
      color: "red",
    },
    efficiency: {
      title: "Reporte de Eficiencia",
      icon: <BarChart3 size={20} className="text-emerald" />,
      color: "emerald",
    },
  };

  const currentConfig = reportConfig[selectedReport];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
            <PieChart size={20} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Análisis y Reportes</h3>
            <p className="text-xs text-white/50">{items.length} insumo(s) analizado(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["json", "csv"] as const).map((format) => (
            <button
              key={format}
              onClick={() => onExport?.(format)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet/20 border border-violet/30 text-violet hover:bg-violet/30 transition-colors"
            >
              <Download size={14} />
              <span className="text-xs font-bold uppercase">{format}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2">
        {Object.entries(reportConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedReport(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              selectedReport === key
                ? `bg-${config.color}/20 border-${config.color}/30 text-${config.color}`
                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
            }`}
          >
            {config.icon}
            <span className="text-xs font-bold">{config.title}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-xl bg-${currentConfig.color}/20 border-${currentConfig.color}/30`}>
            {currentConfig.icon}
          </div>
          <h4 className="text-lg font-bold text-white">{currentConfig.title}</h4>
        </div>

        {selectedReport === "rotation" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald/30">
                <p className="text-xs text-white/50 mb-1">Rotación Rápida</p>
                <p className="text-2xl font-bold text-emerald-400">{reports.rotationReport.fastMoving}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber/30">
                <p className="text-xs text-white/50 mb-1">Rotación Lenta</p>
                <p className="text-2xl font-bold text-amber-400">{reports.rotationReport.slowMoving}</p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan/30">
                <p className="text-xs text-white/50 mb-1">Óptimo</p>
                <p className="text-2xl font-bold text-cyan-400">{reports.rotationReport.optimal}</p>
              </div>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500"
                style={{ width: `${(reports.rotationReport.optimal / items.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {selectedReport === "cost" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/30">
                <p className="text-xs text-white/50 mb-1">Valor Total del Inventario</p>
                <p className="text-2xl font-bold text-gold">${reports.costReport.totalValue.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet/30">
                <p className="text-xs text-white/50 mb-1">Costo Promedio</p>
                <p className="text-2xl font-bold text-violet-400">${reports.costReport.averageCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red/30">
                <p className="text-xs text-white/50 mb-1">Items de Alto Costo</p>
                <p className="text-2xl font-bold text-red-400">{reports.costReport.highCostItems}</p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan/30">
                <p className="text-xs text-white/50 mb-1">Varianza de Costo</p>
                <p className="text-2xl font-bold text-cyan-400">${reports.costReport.costVariance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {selectedReport === "loss" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red/30">
                <p className="text-xs text-white/50 mb-1">Items Críticos</p>
                <p className="text-2xl font-bold text-red-400">{reports.lossReport.criticalItems}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber/30">
                <p className="text-xs text-white/50 mb-1">Pérdida Potencial</p>
                <p className="text-2xl font-bold text-amber-400">${reports.lossReport.potentialLoss.toFixed(2)}</p>
              </div>
            </div>
            {reports.lossReport.criticalItems > 0 && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <p className="text-sm font-bold text-red-400">Acción Recomendada</p>
                </div>
                <p className="text-xs text-white/70">
                  Se recomienda reponer urgentemente los {reports.lossReport.criticalItems} items críticos para evitar pérdidas de ${reports.lossReport.potentialLoss.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {selectedReport === "efficiency" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/50">Salud del Inventario</p>
                <p className="text-2xl font-bold text-emerald-400">{reports.efficiencyReport.stockHealth.toFixed(0)}%</p>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${reports.efficiencyReport.stockHealth}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet/30">
                <p className="text-xs text-white/50 mb-1">Diversidad de Categorías</p>
                <p className="text-2xl font-bold text-violet-400">{reports.efficiencyReport.categoryDiversity}</p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan/30">
                <p className="text-xs text-white/50 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-cyan-400">{items.length}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-3">Utilización por Ubicación</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Barra</span>
                  <span className="text-sm font-bold text-white">{reports.efficiencyReport.locationUtilization.bar}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Cocina</span>
                  <span className="text-sm font-bold text-white">{reports.efficiencyReport.locationUtilization.kitchen}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Bodega</span>
                  <span className="text-sm font-bold text-white">{reports.efficiencyReport.locationUtilization.storage}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3">
        <Calendar size={16} className="text-white/30" />
        <div className="flex gap-2">
          {(["week", "month", "quarter", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                dateRange === range
                  ? "bg-cyan text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {range === "week" ? "Semana" : range === "month" ? "Mes" : range === "quarter" ? "Trimestre" : "Año"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
