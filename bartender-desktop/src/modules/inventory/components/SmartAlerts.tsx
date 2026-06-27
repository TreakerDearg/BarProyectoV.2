"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  Bell,
  Clock,
  X
} from "lucide-react";
import type { InventoryItem, StockForecast } from "../types/inventory";

interface Props {
  items: InventoryItem[];
  forecasts?: StockForecast[];
  onDismiss?: (alertId: string) => void;
}

type AlertType = "critical_stock" | "low_stock" | "expiring_soon" | "cost_increase" | "consumption_spike" | "consumption_drop";

interface SmartAlert {
  id: string;
  type: AlertType;
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  itemId?: string;
  itemName?: string;
  actionLabel?: string;
  onAction?: () => void;
  timestamp: string;
}

export default function SmartAlerts({ items, forecasts = [], onDismiss }: Props) {
  const alerts = useMemo(() => {
    const generatedAlerts: SmartAlert[] = [];
    const now = new Date().toISOString();

    // Critical stock alerts
    items.forEach((item) => {
      const stock = Number(item.stock ?? 0);
      const minStock = Number(item.minStock ?? 0);
      
      if (stock <= minStock) {
        generatedAlerts.push({
          id: `critical-${item._id}`,
          type: "critical_stock",
          severity: "high",
          title: "Stock Crítico",
          message: `${item.name} está por debajo del mínimo (${stock} / ${minStock})`,
          itemId: item._id,
          itemName: item.name,
          actionLabel: "Reponer",
          timestamp: now,
        });
      } else if (stock <= minStock * 1.5) {
        generatedAlerts.push({
          id: `low-${item._id}`,
          type: "low_stock",
          severity: "medium",
          title: "Stock Bajo",
          message: `${item.name} está cerca del mínimo (${stock} / ${minStock})`,
          itemId: item._id,
          itemName: item.name,
          actionLabel: "Verificar",
          timestamp: now,
        });
      }
    });

    // Forecast-based alerts
    forecasts.forEach((forecast) => {
      if (forecast.daysUntilEmpty <= 3 && forecast.daysUntilEmpty > 0) {
        generatedAlerts.push({
          id: `forecast-critical-${forecast.itemId}`,
          type: "critical_stock",
          severity: "high",
          title: "Agotamiento Inminente",
          message: `${forecast.itemName} se agotará en ${forecast.daysUntilEmpty} días`,
          itemId: forecast.itemId,
          itemName: forecast.itemName,
          actionLabel: "Reponer",
          timestamp: now,
        });
      } else if (forecast.daysUntilEmpty <= 7 && forecast.daysUntilEmpty > 3) {
        generatedAlerts.push({
          id: `forecast-warning-${forecast.itemId}`,
          type: "low_stock",
          severity: "medium",
          title: "Agotamiento Próximo",
          message: `${forecast.itemName} se agotará en ${forecast.daysUntilEmpty} días`,
          itemId: forecast.itemId,
          itemName: forecast.itemName,
          actionLabel: "Planificar",
          timestamp: now,
        });
      }

      // Consumption trend alerts
      if (forecast.trend === "increasing" && forecast.confidence > 70) {
        generatedAlerts.push({
          id: `trend-up-${forecast.itemId}`,
          type: "consumption_spike",
          severity: "medium",
          title: "Aumento de Consumo",
          message: `${forecast.itemName} tiene un consumo mayor al habitual`,
          itemId: forecast.itemId,
          itemName: forecast.itemName,
          timestamp: now,
        });
      } else if (forecast.trend === "decreasing" && forecast.confidence > 70) {
        generatedAlerts.push({
          id: `trend-down-${forecast.itemId}`,
          type: "consumption_drop",
          severity: "low",
          title: "Disminución de Consumo",
          message: `${forecast.itemName} tiene un consumo menor al habitual`,
          itemId: forecast.itemId,
          itemName: forecast.itemName,
          timestamp: now,
        });
      }
    });

    // Sort by severity and timestamp
    return generatedAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [items, forecasts]);

  const severityConfig = {
    high: {
      bg: "bg-gradient-to-br from-red-500/20 to-orange-500/10",
      border: "border-red/30",
      icon: <AlertTriangle size={20} className="text-red-400" />,
      iconBg: "bg-red-500/20",
    },
    medium: {
      bg: "bg-gradient-to-br from-amber-500/20 to-yellow-500/10",
      border: "border-amber/30",
      icon: <Bell size={20} className="text-amber-400" />,
      iconBg: "bg-amber-500/20",
    },
    low: {
      bg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/10",
      border: "border-blue/30",
      icon: <Clock size={20} className="text-blue-400" />,
      iconBg: "bg-blue-500/20",
    },
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Sin Alertas</p>
            <p className="text-xs text-white/50">El inventario está en buen estado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/20">
            <Bell size={20} className="text-violet-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Alertas Inteligentes</h3>
            <p className="text-xs text-white/50">{alerts.length} alerta(s) activa(s)</p>
          </div>
        </div>
      </div>

      {alerts.map((alert) => {
        const config = severityConfig[alert.severity];
        return (
          <div
            key={alert.id}
            className={`rounded-xl p-4 border ${config.bg} ${config.border} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${config.iconBg} flex-shrink-0`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <X size={14} className="text-white/50" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-white/70 mb-2">{alert.message}</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  {alert.itemName && (
                    <span className="text-[10px] text-white/50">{alert.itemName}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
