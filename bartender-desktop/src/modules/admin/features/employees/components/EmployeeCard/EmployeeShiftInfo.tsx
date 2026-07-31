/**
 * EMPLOYEE SHIFT INFO
 * Componente de información de turno de empleado
 */

"use client";

import { Calendar } from "lucide-react";
import type { Employee } from "../../types";
import { getShiftLabel } from "../../utils";

interface Props {
  employee: Employee;
  theme: {
    iconColor: string;
  };
}

export function EmployeeShiftInfo({ employee, theme }: Props) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
      <div className="flex items-center gap-2">
        <Calendar size={14} className={theme.iconColor} />
        <div>
          <p className="text-[8px] text-white/40 uppercase tracking-wider">Turno</p>
          <p className="text-xs font-bold text-white uppercase">
            {getShiftLabel(employee.shift || undefined)}
          </p>
        </div>
      </div>
      {employee.shift && (
        <div className="px-2 py-0.5 bg-emerald/10 border border-emerald/30 rounded text-[8px] font-bold text-emerald-400 uppercase">
          Activo
        </div>
      )}
    </div>
  );
}
