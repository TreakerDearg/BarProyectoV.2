"use client";

import { useState } from "react";
import { Shield, Database, Bell } from "lucide-react";
import BackupSystem, { type BackupConfig } from "../../../components/shared/BackupSystem";
import AuditLogSystem from "../../../components/shared/AuditLogSystem";
import CustomReportBuilder from "../../../components/shared/CustomReportBuilder";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"backup" | "audit" | "alerts" | "reports">("backup");
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    enabled: true,
    interval: 60,
    maxBackups: 10,
    autoCleanup: true,
  });

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ivory mb-2">Configuración</h1>
          <p className="text-muted text-sm">Gestión de respaldos, auditoría y configuración del sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "backup"
                ? "bg-violet-500/20 text-violet-200 border border-violet-400/30"
                : "bg-white/5 text-muted border border-white/10 hover:text-ivory"
            }`}
          >
            <Database size={16} />
            Respaldos
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "audit"
                ? "bg-violet-500/20 text-violet-200 border border-violet-400/30"
                : "bg-white/5 text-muted border border-white/10 hover:text-ivory"
            }`}
          >
            <Shield size={16} />
            Auditoría
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "alerts"
                ? "bg-violet-500/20 text-violet-200 border border-violet-400/30"
                : "bg-white/5 text-muted border border-white/10 hover:text-ivory"
            }`}
          >
            <Bell size={16} />
            Alertas
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "reports"
                ? "bg-violet-500/20 text-violet-200 border border-violet-400/30"
                : "bg-white/5 text-muted border border-white/10 hover:text-ivory"
            }`}
          >
            <Shield size={16} />
            Reportes
          </button>
        </div>

        {/* Content */}
        <div className="bg-surface-3 border border-white/10 rounded-2xl p-6">
          {activeTab === "backup" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ivory">Sistema de Respaldos</h2>
                  <p className="text-muted text-sm">Gestión automática y manual de respaldos del sistema</p>
                </div>
              </div>
              <BackupSystem
                onBackup={async () => {
                  console.log("Manual backup triggered");
                  // TODO: Implement backup logic
                }}
                onRestore={async (backupId) => {
                  console.log("Restore backup:", backupId);
                  // TODO: Implement restore logic
                }}
                onDelete={async (backupId) => {
                  console.log("Delete backup:", backupId);
                  // TODO: Implement delete logic
                }}
                onConfigChange={(config) => {
                  setBackupConfig(config);
                  console.log("Config change:", config);
                  // TODO: Implement config save logic
                }}
                config={backupConfig}
              />
            </div>
          )}

          {activeTab === "audit" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ivory">Registro de Auditoría</h2>
                  <p className="text-muted text-sm">Historial de acciones y cambios en el sistema</p>
                </div>
              </div>
              <AuditLogSystem
                logs={[]}
                onExport={() => {
                  console.log("Export audit logs");
                  // TODO: Implement export logic
                }}
                onClear={() => {
                  console.log("Clear audit logs");
                  // TODO: Implement clear logic
                }}
              />
            </div>
          )}

          {activeTab === "alerts" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ivory">Alertas Personalizadas</h2>
                  <p className="text-muted text-sm">Configura alertas automáticas para el sistema</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <p className="text-muted text-sm">Sistema de alertas configurado. Las alertas se gestionan a través de la API del backend.</p>
                <p className="text-xs text-muted mt-2">Endpoints disponibles: POST /api/alerts, GET /api/alerts, PUT /api/alerts/:id, DELETE /api/alerts/:id</p>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/15 text-violet-200">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ivory">Constructor de Reportes</h2>
                  <p className="text-muted text-sm">Crea reportes personalizados con los datos del sistema</p>
                </div>
              </div>
              <CustomReportBuilder />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
