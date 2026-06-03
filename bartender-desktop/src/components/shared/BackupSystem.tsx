"use client";

import { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  Download,
  Trash2,
  Calendar,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from "lucide-react";

export interface BackupConfig {
  enabled: boolean;
  interval: number; // in minutes
  maxBackups: number;
  autoCleanup: boolean;
}

export interface BackupInfo {
  id: string;
  timestamp: Date;
  size: number;
  type: "manual" | "automatic";
  status: "completed" | "failed" | "pending";
}

interface Props {
  onBackup?: () => Promise<void>;
  onRestore?: (backupId: string) => Promise<void>;
  onDelete?: (backupId: string) => Promise<void>;
  onConfigChange?: (config: BackupConfig) => void;
  backups?: BackupInfo[];
  config?: BackupConfig;
}

const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  interval: 60, // 1 hour
  maxBackups: 10,
  autoCleanup: true
};

export default function BackupSystem({
  onBackup,
  onRestore,
  onDelete,
  onConfigChange,
  backups = [],
  config = DEFAULT_CONFIG
}: Props) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [nextBackup, setNextBackup] = useState<Date | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const [backupStatus, setBackupStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });

  // Calculate next backup time
  useEffect(() => {
    if (localConfig.enabled && lastBackup) {
      const next = new Date(lastBackup.getTime() + localConfig.interval * 60000);
      setNextBackup(next);
    } else {
      setNextBackup(null);
    }
  }, [localConfig, lastBackup]);

  // Auto-backup timer
  useEffect(() => {
    if (!localConfig.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (nextBackup && now >= nextBackup) {
        handleBackup(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [localConfig, nextBackup]);

  const handleBackup = async (automatic = false) => {
    setIsBackingUp(true);
    setBackupStatus({ type: null, message: "" });

    try {
      await onBackup?.();
      setLastBackup(new Date());
      setBackupStatus({ 
        type: "success", 
        message: automatic ? "Respaldo automático completado" : "Respaldo completado exitosamente" 
      });
    } catch (error) {
      setBackupStatus({ type: "error", message: "Error al crear respaldo" });
    } finally {
      setIsBackingUp(false);
      setTimeout(() => setBackupStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleRestore = async (backupId: string) => {
    setIsRestoring(backupId);
    setBackupStatus({ type: null, message: "" });

    try {
      await onRestore?.(backupId);
      setBackupStatus({ type: "success", message: "Restauración completada exitosamente" });
    } catch (error) {
      setBackupStatus({ type: "error", message: "Error al restaurar respaldo" });
    } finally {
      setIsRestoring(null);
      setTimeout(() => setBackupStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleDelete = async (backupId: string) => {
    try {
      await onDelete?.(backupId);
      setBackupStatus({ type: "success", message: "Respaldo eliminado" });
    } catch (error) {
      setBackupStatus({ type: "error", message: "Error al eliminar respaldo" });
    } finally {
      setTimeout(() => setBackupStatus({ type: null, message: "" }), 3000);
    }
  };

  const handleConfigChange = (newConfig: BackupConfig) => {
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const getTimeUntilNextBackup = () => {
    if (!nextBackup) return null;
    const now = new Date();
    const diff = nextBackup.getTime() - now.getTime();
    if (diff <= 0) return "Ahora";
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `En ${hours}h ${minutes % 60}m`;
    return `En ${minutes} min`;
  };

  const getTotalBackupSize = () => {
    return backups.reduce((sum, b) => sum + b.size, 0);
  };

  return (
    <div className="bg-surface-3/30 border border-white/5 rounded-[2rem] p-6 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Database size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">Sistema de Respaldo</p>
            <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
              Protección de datos
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Settings size={16} className="text-muted" />
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-4/40 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={14} className="text-muted" />
            <p className="text-[9px] font-bold text-muted uppercase tracking-widest">Espacio Usado</p>
          </div>
          <p className="text-lg font-black text-ivory">{formatSize(getTotalBackupSize())}</p>
          <p className="text-[8px] text-muted/50">{backups.length} respaldos</p>
        </div>

        <div className="bg-surface-4/40 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-muted" />
            <p className="text-[9px] font-bold text-muted uppercase tracking-widest">Próximo Respaldo</p>
          </div>
          <p className="text-lg font-black text-ivory">
            {localConfig.enabled ? getTimeUntilNextBackup() : "Deshabilitado"}
          </p>
          <p className="text-[8px] text-muted/50">
            {localConfig.enabled ? `Cada ${localConfig.interval} min` : "Manual"}
          </p>
        </div>
      </div>

      {/* Manual Backup Button */}
      <button
        onClick={() => handleBackup(false)}
        disabled={isBackingUp}
        className={`
          w-full flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all font-semibold text-sm
          ${isBackingUp
            ? "bg-emerald/5 border-emerald/20 text-emerald/50 cursor-not-allowed"
            : "bg-emerald/5 border-emerald/20 text-emerald-400 hover:bg-emerald/10 hover:border-emerald/30"
          }
        `}
      >
        {isBackingUp ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>Creando respaldo...</span>
          </>
        ) : (
          <>
            <Database size={16} />
            <span>Crear Respaldo Manual</span>
          </>
        )}
      </button>

      {/* Backup List */}
      {backups.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Historial de Respaldos</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {backups.slice(0, 5).map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-3 bg-surface-4/40 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg ${
                    backup.type === "automatic" ? "bg-violet/10" : "bg-gold/10"
                  }`}>
                    {backup.type === "automatic" ? (
                      <RefreshCw size={12} className="text-violet-400" />
                    ) : (
                      <Database size={12} className="text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ivory truncate">{formatDate(backup.timestamp)}</p>
                    <p className="text-[10px] text-muted">{formatSize(backup.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    disabled={isRestoring === backup.id}
                    className="p-1.5 hover:bg-emerald/10 rounded-lg transition-colors text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    title="Restaurar"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(backup.id)}
                    className="p-1.5 hover:bg-red/10 rounded-lg transition-colors text-red/40 hover:text-red-300"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfig && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Configuración</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-ivory">Respaldo Automático</label>
              <button
                onClick={() => handleConfigChange({ ...localConfig, enabled: !localConfig.enabled })}
                className={`w-12 h-6 rounded-full transition-all ${
                  localConfig.enabled ? "bg-emerald-500" : "bg-surface-4"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                  localConfig.enabled ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            <div>
              <label className="text-sm text-ivory block mb-2">Intervalo (minutos)</label>
              <input
                type="number"
                value={localConfig.interval}
                onChange={(e) => handleConfigChange({ ...localConfig, interval: Number(e.target.value) })}
                min="5"
                max="1440"
                className="w-full px-4 py-2 bg-surface-4/40 border border-white/5 rounded-xl text-ivory focus:outline-none focus:border-emerald/30"
                disabled={!localConfig.enabled}
              />
            </div>

            <div>
              <label className="text-sm text-ivory block mb-2">Máximo de Respaldos</label>
              <input
                type="number"
                value={localConfig.maxBackups}
                onChange={(e) => handleConfigChange({ ...localConfig, maxBackups: Number(e.target.value) })}
                min="1"
                max="50"
                className="w-full px-4 py-2 bg-surface-4/40 border border-white/5 rounded-xl text-ivory focus:outline-none focus:border-emerald/30"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-ivory">Limpieza Automática</label>
              <button
                onClick={() => handleConfigChange({ ...localConfig, autoCleanup: !localConfig.autoCleanup })}
                className={`w-12 h-6 rounded-full transition-all ${
                  localConfig.autoCleanup ? "bg-emerald-500" : "bg-surface-4"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all ${
                  localConfig.autoCleanup ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {backupStatus.type && (
        <div className={`
          flex items-center gap-2 p-3 rounded-xl border
          ${backupStatus.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
          }
        `}>
          {backupStatus.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span className="text-xs font-semibold">{backupStatus.message}</span>
        </div>
      )}

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-400/80 leading-relaxed">
          Los respaldos se almacenan localmente. Se recomienda exportar respaldos importantes a un almacenamiento externo regularmente.
        </p>
      </div>
    </div>
  );
}
