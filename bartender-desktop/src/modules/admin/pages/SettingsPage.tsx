"use client";

import { useState } from "react";
import { Shield, Database, Bell } from "lucide-react";
import BackupSystem, { type BackupConfig } from "../../../components/shared/BackupSystem";
import AuditLogSystem from "../../../components/shared/AuditLogSystem";
import CustomReportBuilder from "../../../components/shared/CustomReportBuilder";
import AlertsConfigurationPage from "./AlertsConfigurationPage";
import "../../../styles/nebula-obsidian-theme.css";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"backup" | "audit" | "alerts" | "reports">("backup");
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    enabled: true,
    interval: 60,
    maxBackups: 10,
    autoCleanup: true,
  });

  return (
    <div className="min-h-screen fused-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fused-text-primary mb-2" style={{ fontFamily: 'var(--fused-font-display)' }}>Configuración</h1>
          <p className="text-fused-text-secondary text-sm">Gestión de respaldos, auditoría y configuración del sistema</p>
        </div>

        {/* Tabs */}
        <div className="fused-mode-toggle mb-6">
          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "backup"
                ? "active"
                : "text-fused-text-muted hover:text-fused-text-primary"
            }`}
          >
            <Database size={16} />
            Respaldos
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "audit"
                ? "active"
                : "text-fused-text-muted hover:text-fused-text-primary"
            }`}
          >
            <Shield size={16} />
            Auditoría
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "alerts"
                ? "active"
                : "text-fused-text-muted hover:text-fused-text-primary"
            }`}
          >
            <Bell size={16} />
            Alertas
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "reports"
                ? "active"
                : "text-fused-text-muted hover:text-fused-text-primary"
            }`}
          >
            <Shield size={16} />
            Reportes
          </button>
        </div>

        {/* Content */}
        <div className="fused-glass-card p-6">
          {activeTab === "backup" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-fused-violet/15 text-fused-violet">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-fused-text-primary">Sistema de Respaldos</h2>
                  <p className="text-fused-text-secondary text-sm">Gestión automática y manual de respaldos del sistema</p>
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
                <div className="p-2 rounded-lg bg-fused-violet/15 text-fused-violet">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-fused-text-primary">Registro de Auditoría</h2>
                  <p className="text-fused-text-secondary text-sm">Historial de acciones y cambios en el sistema</p>
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
            <AlertsConfigurationPage />
          )}

          {activeTab === "reports" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-fused-violet/15 text-fused-violet">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-fused-text-primary">Constructor de Reportes</h2>
                  <p className="text-fused-text-secondary text-sm">Crea reportes personalizados con los datos del sistema</p>
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
