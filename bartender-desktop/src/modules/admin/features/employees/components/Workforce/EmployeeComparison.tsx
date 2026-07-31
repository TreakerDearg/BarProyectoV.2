/**
 * EMPLOYEE COMPARISON
 * Comparativas entre empleados (asistencia, horas, rendimiento, puntualidad)
 */

"use client";

import { BarChart3, Users } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employees: Employee[];
  metrics: "attendance" | "hours" | "performance" | "punctuality";
  onMetricChange?: (metric: "attendance" | "hours" | "performance" | "punctuality") => void;
}

export function EmployeeComparison({ employees, metrics, onMetricChange }: Props) {
  const getMetricValue = (employee: Employee, metric: string) => {
    const attendance = employee.attendance as any;
    const performance = employee.performance as any;

    switch (metric) {
      case "attendance":
        const thisMonth = attendance?.thisMonth || {};
        const total = (thisMonth.present || 0) + (thisMonth.absent || 0) + (thisMonth.late || 0);
        return total > 0 ? Math.round(((thisMonth.present || 0) / total) * 100) : 0;
      case "hours":
        return attendance?.thisMonth?.totalHours || 0;
      case "performance":
        return performance?.averageRating || 0;
      case "punctuality":
        return performance?.onTimeRate || 0;
      default:
        return 0;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case "attendance":
        return "Asistencia (%)";
      case "hours":
        return "Horas Trabajadas";
      case "performance":
        return "Rendimiento (/5)";
      case "punctuality":
        return "Puntualidad (%)";
      default:
        return "";
    }
  };

  const getMetricColor = (value: number, metric: string) => {
    if (metric === "hours" || metric === "performance") {
      return value > 0 ? "text-emerald-400" : "text-gray-400";
    }
    return value >= 80 ? "text-emerald-400" : value >= 60 ? "text-amber-400" : "text-red-400";
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    const aValue = getMetricValue(a, metrics);
    const bValue = getMetricValue(b, metrics);
    return bValue - aValue;
  });

  const maxValue = Math.max(...sortedEmployees.map((emp) => getMetricValue(emp, metrics)));

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-xl">
            <BarChart3 size={24} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Comparativas</h2>
            <p className="text-sm text-gray-400">Análisis comparativo entre empleados</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["attendance", "hours", "performance", "punctuality"] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => onMetricChange?.(metric)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                metrics === metric
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {getMetricLabel(metric)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sortedEmployees.map((employee, index) => {
          const value = getMetricValue(employee, metrics);
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const color = getMetricColor(value, metrics);

          return (
            <div key={employee._id} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600/50">
                  <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-sm font-bold text-white">{employee.name}</span>
                    </div>
                    <span className={`text-lg font-bold ${color}`}>
                      {metrics === "performance" ? `${value}/5` : metrics === "hours" ? `${value}h` : `${value}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        metrics === "attendance"
                          ? value >= 80
                            ? "bg-emerald-500"
                            : value >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                          : "bg-cyan-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Excelente (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Bueno (60-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Mejorable (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}
