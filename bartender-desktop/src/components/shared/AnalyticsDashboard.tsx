"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  color: string;
}

export interface ChartData {
  label: string;
  value: number;
  change?: number;
}

export interface ReportData {
  period: string;
  metrics: MetricCard[];
  charts: {
    title: string;
    data: ChartData[];
    type: "bar" | "line" | "pie";
  }[];
}

interface Props {
  data?: ReportData;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

const DEFAULT_DATA: ReportData = {
  period: "Últimos 30 días",
  metrics: [
    {
      title: "Ventas Totales",
      value: "$12,450",
      change: 15.3,
      changeType: "increase",
      icon: <DollarSign size={20} />,
      color: "text-emerald-400"
    },
    {
      title: "Productos Vendidos",
      value: "847",
      change: 8.2,
      changeType: "increase",
      icon: <Package size={20} />,
      color: "text-gold"
    },
    {
      title: "Pedidos",
      value: "234",
      change: -2.1,
      changeType: "decrease",
      icon: <Users size={20} />,
      color: "text-cyan-400"
    },
    {
      title: "Margen Promedio",
      value: "42%",
      change: 5.7,
      changeType: "increase",
      icon: <TrendingUp size={20} />,
      color: "text-violet-400"
    }
  ],
  charts: [
    {
      title: "Ventas por Categoría",
      data: [
        { label: "Bebidas", value: 4500, change: 12 },
        { label: "Comida", value: 3200, change: 8 },
        { label: "Postres", value: 1800, change: -5 },
        { label: "Otros", value: 950, change: 3 }
      ],
      type: "bar"
    },
    {
      title: "Tendencia de Ventas",
      data: [
        { label: "Semana 1", value: 2800 },
        { label: "Semana 2", value: 3200 },
        { label: "Semana 3", value: 3100 },
        { label: "Semana 4", value: 3350 }
      ],
      type: "line"
    }
  ]
};

export default function AnalyticsDashboard({
  data = DEFAULT_DATA,
  onRefresh,
  onExport,
  isLoading = false
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const getChangeIcon = (type: "increase" | "decrease" | "neutral") => {
    switch (type) {
      case "increase":
        return <ArrowUpRight size={14} className="text-emerald-400" />;
      case "decrease":
        return <ArrowDownRight size={14} className="text-red-400" />;
      case "neutral":
        return <Minus size={14} className="text-muted" />;
    }
  };

  const getChangeColor = (type: "increase" | "decrease" | "neutral") => {
    switch (type) {
      case "increase":
        return "text-emerald-400";
      case "decrease":
        return "text-red-400";
      case "neutral":
        return "text-muted";
    }
  };

  const renderChart = (chart: ReportData["charts"][0]) => {
    const maxValue = Math.max(...chart.data.map(d => d.value));
    
    if (chart.type === "bar") {
      return (
        <div className="space-y-3">
          {chart.data.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{item.label}</span>
                <span className="text-ivory font-semibold">{item.value}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (chart.type === "line") {
      return (
        <div className="relative h-40">
          <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(212, 163, 64, 0.3)" />
                <stop offset="100%" stopColor="rgba(212, 163, 64, 0)" />
              </linearGradient>
            </defs>
            <path
              d={`M0,${100 - (chart.data[0].value / maxValue) * 80} ${chart.data.map((d, i) => `${(i / (chart.data.length - 1)) * 300},${100 - (d.value / maxValue) * 80}`).join(" ")}`}
              fill="url(#lineGradient)"
              stroke="rgba(212, 163, 64, 0.5)"
              strokeWidth="2"
            />
            {chart.data.map((d, i) => (
              <circle
                key={i}
                cx={(i / (chart.data.length - 1)) * 300}
                cy={100 - (d.value / maxValue) * 80}
                r="4"
                fill="#d4a340"
              />
            ))}
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-surface-3/30 border border-white/5 rounded-[2rem] p-6 space-y-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl border border-gold/20 text-gold">
            <BarChart3 size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-gold uppercase tracking-[0.3em]">Analytics</p>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
              Reportes y métricas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-surface-4/40 border border-white/5 rounded-xl text-ivory text-sm focus:outline-none focus:border-gold/30"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={`text-muted ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {onExport && (
            <button
              onClick={onExport}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Download size={16} className="text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Period Info */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Calendar size={14} />
        <span>{data.period}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics.map((metric, idx) => (
          <div key={idx} className="bg-surface-4/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-white/5 ${metric.color}`}>
                {metric.icon}
              </div>
              {metric.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${getChangeColor(metric.changeType)}`}>
                  {getChangeIcon(metric.changeType)}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{metric.title}</p>
            <p className="text-2xl font-black text-ivory">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.charts.map((chart, idx) => (
          <div key={idx} className="bg-surface-4/40 p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-ivory mb-4">{chart.title}</h3>
            {renderChart(chart)}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Datos actualizados</span>
          <span className="text-ivory font-semibold">Hace 5 minutos</span>
        </div>
      </div>
    </div>
  );
}
