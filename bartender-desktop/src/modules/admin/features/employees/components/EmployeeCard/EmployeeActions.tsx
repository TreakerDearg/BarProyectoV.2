/**
 * EMPLOYEE ACTIONS
 * Componente de acciones de empleado
 */

"use client";

import { Trash2, UserCheck, Zap, ChevronRight } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
  isActive: boolean;
  onInspect?: (employee: Employee) => void;
  onDeactivate: (id: string) => void;
  onActivate?: (id: string) => void;
}

export function EmployeeActions({
  employee,
  isActive,
  onInspect,
  onDeactivate,
  onActivate,
}: Props) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <button
        onClick={(e) => { e.stopPropagation(); onInspect?.(employee); }}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400/20 to-purple-400/20 border border-amber-400/30 hover:border-amber-400/50 flex items-center justify-center gap-2 transition-all group/btn"
      >
        <Zap size={14} className="text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white">Auditoría</span>
        <ChevronRight size={12} className="text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
      </button>

      <div className="flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        {isActive ? (
          <button
            onClick={(e) => { e.stopPropagation(); onDeactivate(employee._id); }}
            className="flex-1 h-10 rounded-xl bg-red/10 border border-red/30 flex items-center justify-center gap-2 text-red-400 hover:bg-red/20 transition-all"
          >
            <Trash2 size={14} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Desactivar</span>
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onActivate?.(employee._id); }}
            className="flex-1 h-10 rounded-xl bg-emerald/10 border border-emerald/30 flex items-center justify-center gap-2 text-emerald-400 hover:bg-emerald/20 transition-all"
          >
            <UserCheck size={14} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Activar</span>
          </button>
        )}
      </div>
    </div>
  );
}
