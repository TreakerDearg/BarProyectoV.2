import api from "../../../services/api";

export interface BackupStats {
  totalRecords: number;
  breakdown: {
    menus: number;
    products: number;
    recipes: number;
    inventory: number;
    rewards: number;
    tables: number;
  };
  lastGeneratedAt: string;
}

const unwrap = (res: any): any => res?.data ?? res ?? null;

/**
 * Descarga directamente un snapshot JSON de la base de datos al navegador.
 */
export const downloadDatabaseBackup = async (): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const response = await api.get("/backup/export", { responseType: "blob" });

  const blob = response instanceof Blob ? response : new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nebula-snapshot-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Obtiene métricas del volumen de datos para la pantalla de respaldos.
 */
export const getBackupStats = async (): Promise<BackupStats> => {
  const res = await api.get("/backup/stats");
  return unwrap(res);
};

/**
 * Restaura la base de datos a partir de un objeto JSON de respaldo.
 */
export const restoreDatabaseBackup = async (
  backupJson: Record<string, unknown>
): Promise<{ success: boolean; restored: Record<string, number> }> => {
  const res = await api.post("/backup/restore", { backup: backupJson });
  return unwrap(res);
};
