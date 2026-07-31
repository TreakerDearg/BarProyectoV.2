/**
 * EMPLOYEE CARD
 * Componente principal de tarjeta de empleado
 * Separado en subcomponentes para mejor reutilización
 */

"use client";

import { motion } from "framer-motion";
import type { Employee } from "../../types";
import { EmployeeAvatar } from "./EmployeeAvatar";
import { EmployeeInfo } from "./EmployeeInfo";
import { EmployeeMetrics } from "./EmployeeMetrics";
import { EmployeeShiftInfo } from "./EmployeeShiftInfo";
import { EmployeeActions } from "./EmployeeActions";
import { getRoleTheme } from "../../utils";

interface Props {
  employee: Employee;
  onDeactivate: (id: string) => void;
  onActivate?: (id: string) => void;
  onInspect?: (employee: Employee) => void;
}

export default function EmployeeCard({
  employee,
  onDeactivate,
  onActivate,
  onInspect,
}: Props) {
  const isActive = employee.isActive;
  const theme = getRoleTheme(employee.role);

  return (
    <motion.div
      onClick={() => onInspect?.(employee)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`
        group relative cursor-pointer
        rounded-2xl overflow-hidden transition-all duration-300
        bg-gradient-to-br ${theme.gradient} border ${theme.borderColor}
        ${isActive ? 'hover:shadow-2xl hover:shadow-amber-400/10' : 'opacity-60 grayscale'}
      `}
    >
      {/* Glow Effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${isActive ? 'bg-amber-400/20' : 'bg-red-400/10'}`} />

      {/* Hero Section */}
      <div className={`relative p-5 bg-gradient-to-r ${theme.gradient}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <EmployeeAvatar employee={employee} theme={theme} />
            <EmployeeInfo employee={employee} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <EmployeeMetrics employee={employee} />
        <EmployeeShiftInfo employee={employee} theme={theme} />
        <EmployeeActions
          employee={employee}
          isActive={isActive}
          onInspect={onInspect}
          onDeactivate={onDeactivate}
          onActivate={onActivate}
        />
      </div>
    </motion.div>
  );
}
