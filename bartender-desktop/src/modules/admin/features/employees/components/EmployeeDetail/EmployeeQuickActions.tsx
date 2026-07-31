/**
 * EMPLOYEE QUICK ACTIONS
 * Menú de acciones rápidas para el empleado
 */

"use client";

import { Key, Shield, Calendar, Clock, UserX, UserCheck, History, Settings } from "lucide-react";
import type { Employee } from "../../types";

interface Props {
  employee: Employee;
  onClose: () => void;
}

export function EmployeeQuickActions({ employee, onClose }: Props) {
  const actions = [
    {
      icon: Key,
      label: "Restablecer Contraseña",
      description: "Enviar correo de recuperación",
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
    },
    {
      icon: Shield,
      label: "Gestionar Permisos",
      description: "Modificar roles y permisos",
      color: "text-amber-400",
      bgColor: "bg-amber-400/20",
    },
    {
      icon: Calendar,
      label: "Editar Horario",
      description: "Modificar turnos y disponibilidad",
      color: "text-purple-400",
      bgColor: "bg-purple-400/20",
    },
    {
      icon: Clock,
      label: "Ver Actividad",
      description: "Historial de actividad",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/20",
    },
    {
      icon: employee.isActive ? UserX : UserCheck,
      label: employee.isActive ? "Desactivar Cuenta" : "Activar Cuenta",
      description: employee.isActive ? "Bloquear acceso temporalmente" : "Reactivar cuenta",
      color: employee.isActive ? "text-red-400" : "text-emerald-400",
      bgColor: employee.isActive ? "bg-red-400/20" : "bg-emerald-400/20",
    },
    {
      icon: Settings,
      label: "Configuración",
      description: "Configuración avanzada",
      color: "text-gray-400",
      bgColor: "bg-gray-600/20",
    },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
      <div className="p-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left"
              onClick={() => {
                // Handle action
                onClose();
              }}
            >
              <div className={`p-2 ${action.bgColor} rounded-lg`}>
                <Icon size={16} className={action.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{action.label}</p>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
