/**
 * SMART ACTIONS
 * Acciones inteligentes contextuales según estado del empleado
 */

"use client";

import { Edit, Shield, Calendar, Eye, RefreshCw, Play, UserPlus, CheckCircle, AlertTriangle, PauseCircle, LogOut, Archive } from "lucide-react";
import type { EmploymentStatus } from "./EmploymentStatus";

interface Props {
  employmentStatus: EmploymentStatus;
  onEditProfile?: () => void;
  onChangePermissions?: () => void;
  onManageSchedule?: () => void;
  onViewSessions?: () => void;
  onReactivate?: () => void;
  onViewHistory?: () => void;
  onChangeStatus?: () => void;
  onCompleteData?: () => void;
  onAssignRole?: () => void;
  onAssignSchedule?: () => void;
}

const STATUS_ACTIONS: Record<EmploymentStatus, { label: string; icon: any; action: string; color: string }[]> = {
  candidate: [
    { label: "Completar Datos", icon: UserPlus, action: "completeData", color: "text-blue-400" },
    { label: "Asignar Rol", icon: Shield, action: "assignRole", color: "text-purple-400" },
    { label: "Asignar Horario", icon: Calendar, action: "assignSchedule", color: "text-amber-400" },
  ],
  pending: [
    { label: "Completar Datos", icon: UserPlus, action: "completeData", color: "text-blue-400" },
    { label: "Asignar Rol", icon: Shield, action: "assignRole", color: "text-purple-400" },
    { label: "Asignar Horario", icon: Calendar, action: "assignSchedule", color: "text-amber-400" },
  ],
  active: [
    { label: "Editar Perfil", icon: Edit, action: "editProfile", color: "text-emerald-400" },
    { label: "Cambiar Permisos", icon: Shield, action: "changePermissions", color: "text-purple-400" },
    { label: "Gestionar Horario", icon: Calendar, action: "manageSchedule", color: "text-amber-400" },
    { label: "Ver Sesiones", icon: Eye, action: "viewSessions", color: "text-cyan-400" },
  ],
  training: [
    { label: "Editar Perfil", icon: Edit, action: "editProfile", color: "text-emerald-400" },
    { label: "Ver Progreso", icon: Eye, action: "viewProgress", color: "text-blue-400" },
    { label: "Revisar Historial", icon: AlertTriangle, action: "viewHistory", color: "text-gray-400" },
  ],
  on_leave: [
    { label: "Ver Detalles", icon: Eye, action: "viewDetails", color: "text-blue-400" },
    { label: "Revisar Historial", icon: AlertTriangle, action: "viewHistory", color: "text-gray-400" },
  ],
  suspended: [
    { label: "Reactivar", icon: RefreshCw, action: "reactivate", color: "text-emerald-400" },
    { label: "Revisar Historial", icon: AlertTriangle, action: "viewHistory", color: "text-gray-400" },
    { label: "Cambiar Estado", icon: PauseCircle, action: "changeStatus", color: "text-amber-400" },
  ],
  temporary_leave: [
    { label: "Reactivar", icon: RefreshCw, action: "reactivate", color: "text-emerald-400" },
    { label: "Revisar Historial", icon: AlertTriangle, action: "viewHistory", color: "text-gray-400" },
  ],
  terminated: [
    { label: "Revisar Historial", icon: AlertTriangle, action: "viewHistory", color: "text-gray-400" },
    { label: "Archivar", icon: Archive, action: "archive", color: "text-purple-400" },
  ],
  archived: [
    { label: "Ver Historial", icon: AlertTriangle, action: "viewHistory", color: "text-gray-400" },
  ],
};

export function SmartActions({ employmentStatus, onEditProfile, onChangePermissions, onManageSchedule, onViewSessions, onReactivate, onViewHistory, onChangeStatus, onCompleteData, onAssignRole, onAssignSchedule }: Props) {
  const actions = STATUS_ACTIONS[employmentStatus];

  const handleAction = (action: string) => {
    switch (action) {
      case "editProfile":
        onEditProfile?.();
        break;
      case "changePermissions":
        onChangePermissions?.();
        break;
      case "manageSchedule":
        onManageSchedule?.();
        break;
      case "viewSessions":
        onViewSessions?.();
        break;
      case "reactivate":
        onReactivate?.();
        break;
      case "viewHistory":
        onViewHistory?.();
        break;
      case "changeStatus":
        onChangeStatus?.();
        break;
      case "completeData":
        onCompleteData?.();
        break;
      case "assignRole":
        onAssignRole?.();
        break;
      case "assignSchedule":
        onAssignSchedule?.();
        break;
      default:
        console.log("Acción no implementada:", action);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Play size={24} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Acciones Inteligentes</h2>
          <p className="text-sm text-gray-400">Acciones contextuales según estado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              key={index}
              onClick={() => handleAction(action.action)}
              className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all flex items-center gap-3"
              aria-label={action.label}
            >
              <div className={`p-2 rounded-lg bg-gray-600/50`}>
                <Icon size={16} className={action.color} aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-blue-400" aria-hidden="true" />
          <p className="text-xs text-blue-400">
            Las acciones disponibles cambian dinámicamente según el estado laboral del empleado
          </p>
        </div>
      </div>
    </div>
  );
}
