"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  User,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

export type AuditAction = "create" | "update" | "delete" | "export" | "import" | "backup" | "restore" | "login" | "logout";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  userId: string;
  userName: string;
  timestamp: Date;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

interface Props {
  logs: AuditLog[];
  onExport?: () => void;
  onClear?: () => void;
}

export default function AuditLogSystem({
  logs,
  onExport,
  onClear
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case "create":
        return <CheckCircle size={16} className="text-emerald-400" />;
      case "update":
        return <Info size={16} className="text-cyan-400" />;
      case "delete":
        return <XCircle size={16} className="text-red-400" />;
      case "export":
        return <Download size={16} className="text-gold" />;
      case "import":
        return <Download size={16} className="text-violet-400" />;
      case "backup":
        return <FileText size={16} className="text-emerald-400" />;
      case "restore":
        return <FileText size={16} className="text-amber-400" />;
      case "login":
        return <CheckCircle size={16} className="text-emerald-400" />;
      case "logout":
        return <XCircle size={16} className="text-muted" />;
    }
  };

  const getActionLabel = (action: AuditAction) => {
    const labels: Record<AuditAction, string> = {
      create: "Creación",
      update: "Actualización",
      delete: "Eliminación",
      export: "Exportación",
      import: "Importación",
      backup: "Respaldo",
      restore: "Restauración",
      login: "Inicio de Sesión",
      logout: "Cierre de Sesión"
    };
    return labels[action];
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case "create":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "update":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      case "delete":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "export":
        return "bg-gold/10 border-gold/30 text-gold";
      case "import":
        return "bg-violet-500/10 border-violet-500/30 text-violet-400";
      case "backup":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "restore":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "login":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "logout":
        return "bg-surface-4/40 border-white/10 text-muted";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === "" || 
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityId && log.entityId.includes(searchQuery));
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entity === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const uniqueEntities = [...new Set(logs.map(log => log.entity))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora mismo";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  };

  return (
    <div className="bg-surface-3/30 border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <FileText size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-amber-400 uppercase tracking-[0.3em]">Auditoría de Cambios</p>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
              Registro de actividad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              title="Exportar logs"
            >
              <Download size={16} className="text-muted" />
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="p-2 hover:bg-red/10 rounded-xl transition-colors"
              title="Limpiar logs"
            >
              <Trash2 size={16} className="text-red/40" />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por entidad, usuario o ID..."
            className="w-full pl-12 pr-4 py-3 bg-surface-4/40 border border-white/5 rounded-xl text-ivory placeholder:text-muted/50 focus:outline-none focus:border-amber/30 focus:ring-1 focus:ring-amber/20 transition-all text-sm"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-ivory transition-colors"
        >
          <Filter size={14} />
          <span>Filtros</span>
          <ChevronDown size={14} className={showFilters ? "rotate-180" : ""} />
        </button>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Acción</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as AuditAction | "all")}
                className="w-full px-3 py-2 bg-surface-4/40 border border-white/5 rounded-xl text-ivory text-sm focus:outline-none focus:border-amber/30"
              >
                <option value="all">Todas</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{getActionLabel(action)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">Entidad</label>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-surface-4/40 border border-white/5 rounded-xl text-ivory text-sm focus:outline-none focus:border-amber/30"
              >
                <option value="all">Todas</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Logs List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText size={48} className="text-muted/30 mb-4" />
            <p className="text-sm text-muted">No hay registros de auditoría</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              className={`
                p-4 rounded-xl border transition-all cursor-pointer
                ${selectedLog?.id === log.id
                  ? "bg-amber/10 border-amber/30"
                  : "bg-surface-4/40 border-white/5 hover:border-white/10"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-ivory">{getActionLabel(log.action)}</p>
                    <p className="text-[10px] text-muted">{formatRelativeTime(log.timestamp)}</p>
                  </div>
                  <p className="text-xs text-muted">
                    <span className="font-semibold text-ivory">{log.entity}</span>
                    {log.entityId && <span className="text-muted/50"> #{log.entityId.slice(-6)}</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <User size={12} className="text-muted/50" />
                    <p className="text-[10px] text-muted/70">{log.userName}</p>
                    {log.ipAddress && (
                      <>
                        <span className="text-muted/30">•</span>
                        <p className="text-[10px] text-muted/50">{log.ipAddress}</p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLog(selectedLog?.id === log.id ? null : log);
                  }}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Eye size={14} className="text-muted/50 hover:text-muted" />
                </button>
              </div>

              {/* Expanded Details */}
              {selectedLog?.id === log.id && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Timestamp</p>
                    <p className="text-xs text-ivory">{formatDate(log.timestamp)}</p>
                  </div>

                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Cambios</p>
                      <div className="space-y-2">
                        {Object.entries(log.changes).map(([key, change]) => (
                          <div key={key} className="bg-surface-4/40 p-2 rounded-lg">
                            <p className="text-[10px] font-semibold text-ivory mb-1">{key}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-red-400 line-through">{String(change.from)}</span>
                              <span className="text-muted">→</span>
                              <span className="text-emerald-400">{String(change.to)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Metadatos</p>
                      <div className="bg-surface-4/40 p-2 rounded-lg">
                        <pre className="text-[10px] text-muted overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {filteredLogs.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] text-muted/50 text-center">
            Mostrando {filteredLogs.length} de {logs.length} registros
          </p>
        </div>
      )}
    </div>
  );
}
