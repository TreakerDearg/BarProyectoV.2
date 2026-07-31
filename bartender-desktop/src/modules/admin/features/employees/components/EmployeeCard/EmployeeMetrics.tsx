/**
 * EMPLOYEE METRICS
 * Componente de métricas de empleado
 */

"use client";

import { Activity, Clock, TrendingUp } from "lucide-react";
import type { Employee } from "../../types";
import { calculateEmployeeMetrics } from "../../utils";

interface Props {
  employee: Employee;
}

export function EmployeeMetrics({ employee }: Props) {
  const metrics = calculateEmployeeMetrics(employee);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <Activity size={12} className="text-white/40" />
          <span className="text-[8px] text-white/40 uppercase tracking-wider">Performance</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-xl font-bold text-white">{metrics.performance}%</span>
          <TrendingUp size={12} className="text-emerald-400 mb-1" />
        </div>
      </div>
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <Clock size={12} className="text-white/40" />
          <span className="text-[8px] text-white/40 uppercase tracking-wider">Turnos</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-xl font-bold text-white">{metrics.totalShifts}</span>
          <span className="text-[8px] text-white/40 mb-1">OPS</span>
        </div>
      </div>
    </div>
  );
}
