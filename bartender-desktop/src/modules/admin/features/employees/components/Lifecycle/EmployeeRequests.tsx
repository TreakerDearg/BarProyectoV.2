/**
 * EMPLOYEE REQUESTS
 * Sistema de solicitudes del empleado preparado para flujo completo
 */

"use client";

import { Plane, Coffee, Calendar, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export type RequestType = "vacation" | "leave" | "shift_change" | "permission";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

interface Request {
  id: string;
  type: RequestType;
  startDate: Date;
  endDate?: Date;
  reason: string;
  status: RequestStatus;
  approver?: string;
  requestDate: Date;
  approvedDate?: Date;
  rejectionReason?: string;
}

interface Props {
  requests: Request[];
  onAddRequest?: (request: Omit<Request, "id" | "requestDate" | "status">) => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string, reason: string) => void;
  onCancelRequest?: (requestId: string) => void;
}

const REQUEST_TYPE_CONFIGS: Record<RequestType, { label: string; icon: any; color: string }> = {
  vacation: {
    label: "Vacaciones",
    icon: Plane,
    color: "text-blue-400",
  },
  leave: {
    label: "Licencia",
    icon: Coffee,
    color: "text-purple-400",
  },
  shift_change: {
    label: "Cambio de Turno",
    icon: Calendar,
    color: "text-amber-400",
  },
  permission: {
    label: "Permiso Especial",
    icon: FileText,
    color: "text-emerald-400",
  },
};

const STATUS_CONFIGS: Record<RequestStatus, { label: string; icon: any; color: string; bgColor: string }> = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
  },
  approved: {
    label: "Aprobado",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20 border-emerald-500/30",
  },
  rejected: {
    label: "Rechazado",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20 border-red-500/30",
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/30",
  },
};

export function EmployeeRequests({ requests, onAddRequest, onApproveRequest, onRejectRequest, onCancelRequest }: Props) {
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-500/20 rounded-xl">
          <FileText size={24} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Solicitudes</h2>
          <p className="text-sm text-gray-400">Solicitudes del empleado</p>
        </div>
      </div>

      {/* Métricas de Solicitudes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{requests.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-amber-400">{pendingRequests.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Aprobadas</p>
          <p className="text-2xl font-bold text-emerald-400">{approvedRequests.length}</p>
        </div>
        <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Rechazadas</p>
          <p className="text-2xl font-bold text-red-400">{rejectedRequests.length}</p>
        </div>
      </div>

      {/* Alertas de Solicitudes Pendientes */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" aria-hidden="true" />
          <span className="text-sm text-amber-400">
            {pendingRequests.length} solicitud(es) pendiente(s) de aprobación
          </span>
        </div>
      )}

      {/* Lista de Solicitudes */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay solicitudes registradas
          </div>
        ) : (
          requests.map((request) => {
            const typeConfig = REQUEST_TYPE_CONFIGS[request.type];
            const statusConfig = STATUS_CONFIGS[request.status];
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={request.id}
                className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                    <TypeIcon size={16} className={typeConfig.color} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{request.reason}</h4>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${statusConfig.bgColor}`}>
                        <StatusIcon size={12} className={statusConfig.color} aria-hidden="true" />
                        <span className={`text-[10px] font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400">
                      <span>
                        Inicio: {new Date(request.startDate).toLocaleDateString()}
                      </span>
                      {request.endDate && (
                        <span>
                          Fin: {new Date(request.endDate).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        Solicitado: {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                    {request.approver && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        Aprobado por: {request.approver}
                      </div>
                    )}
                    {request.rejectionReason && (
                      <div className="text-[10px] text-red-400 mt-1">
                        Razón de rechazo: {request.rejectionReason}
                      </div>
                    )}
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      {onApproveRequest && (
                        <button
                          onClick={() => onApproveRequest(request.id)}
                          className="p-2 hover:bg-emerald-500/20 rounded transition-colors"
                          aria-label="Aprobar solicitud"
                        >
                          <CheckCircle size={14} className="text-emerald-400" />
                        </button>
                      )}
                      {onRejectRequest && (
                        <button
                          onClick={() => onRejectRequest(request.id, "")}
                          className="p-2 hover:bg-red-500/20 rounded transition-colors"
                          aria-label="Rechazar solicitud"
                        >
                          <XCircle size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  )}
                  {request.status === "pending" && onCancelRequest && (
                    <button
                      onClick={() => onCancelRequest(request.id)}
                      className="p-2 hover:bg-gray-500/20 rounded transition-colors"
                      aria-label="Cancelar solicitud"
                    >
                      <XCircle size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Nota de Implementación Futura */}
      <div className="mt-6 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-cyan-400" aria-hidden="true" />
          <p className="text-xs text-cyan-400">
            Arquitectura preparada para implementación completa de flujos de aprobación
          </p>
        </div>
      </div>
    </div>
  );
}
