/**
 * EMPLOYEE AVATAR
 * Componente de avatar de empleado
 */

"use client";

import { User } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
  theme: {
    iconColor: string;
  };
}

export function EmployeeAvatar({ employee, theme }: Props) {
  return (
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
        <User size={28} className={theme.iconColor} />
      </div>
      {employee.isActive && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-black/50 animate-pulse" />
      )}
    </div>
  );
}
