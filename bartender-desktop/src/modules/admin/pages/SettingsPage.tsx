import { useState, useEffect } from "react";
import {
  Building2,
  Sliders,
  Coins,
  Database,
  Shield,
  Bell,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Star,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Check,
  GlassWater,
  ChefHat,
  Eye,
} from "lucide-react";
import {
  getSystemConfig,
  updateSystemConfig,
  getHomeFeatured,
  updateHomeFeatured,
  type SystemConfig,
  type HomeFeaturedConfig,
} from "../services/configService";
import {
  downloadDatabaseBackup,
  getBackupStats,
  restoreDatabaseBackup,
  type BackupStats,
} from "../services/backupService";
import {
  getAuditLogs,
  exportAuditLogs,
  type AuditQueryParams,
} from "../services/auditService";
import { getProducts } from "../../products/services/productService";
import type { AuditLog } from "../../../components/shared/AuditLogSystem";
import AuditLogSystem from "../../../components/shared/AuditLogSystem";
import AlertsConfigurationPage from "./AlertsConfigurationPage";

type SettingsTab = "business" | "pos" | "loyalty" | "homeFeatured" | "backup" | "audit" | "alerts";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);

  // Estados de Backup
  const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);

  // Estados de Auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [exportingAudit, setExportingAudit] = useState(false);

  // Estados de Destacados Web (Home)
  const [homeFeaturedConfig, setHomeFeaturedConfig] = useState<HomeFeaturedConfig>({
    headline: "Nuestra Selección de Autor",
    subtitle: "Las creaciones y platos más aclamados de nuestra barra y cocina",
    badge: "Recomendados de la Casa",
    maxItems: 6,
    productIds: [],
  });
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "drink" | "food">("all");

  // Feedback Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showNotification = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMessage(msg);
      setErrorMessage(null);
    } else {
      setErrorMessage(msg);
      setSuccessMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4000);
  };

  /* ── 1. Cargar Configuración Inicial ── */
  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const data = await getSystemConfig();
      setConfig(data);
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al cargar la configuración");
    } finally {
      setLoadingConfig(false);
    }
  };

  /* ── 2. Cargar Métricas de Backup ── */
  const loadBackupStats = async () => {
    try {
      const stats = await getBackupStats();
      setBackupStats(stats);
    } catch (err) {
      console.error("Error al cargar estadísticas de respaldo:", err);
    }
  };

  /* ── 3. Cargar Logs de Auditoría ── */
  const loadAuditLogs = async (params: AuditQueryParams = {}) => {
    setLoadingAudit(true);
    try {
      const res = await getAuditLogs(params);
      setAuditLogs(res.logs);
    } catch (err) {
      console.error("Error al cargar logs de auditoría:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  /* ── 4. Cargar Destacados Web y Catálogo ── */
  const loadHomeFeaturedData = async () => {
    setLoadingFeatured(true);
    try {
      const [feat, prods] = await Promise.all([
        getHomeFeatured(),
        getProducts(),
      ]);
      if (feat) {
        setHomeFeaturedConfig({
          headline: feat.headline || "Nuestra Selección de Autor",
          subtitle: feat.subtitle || "Las creaciones y platos más aclamados de nuestra barra y cocina",
          badge: feat.badge || "Recomendados de la Casa",
          maxItems: feat.maxItems || 6,
          productIds: Array.isArray(feat.productIds) ? feat.productIds : [],
        });
      }
      setAllProducts(Array.isArray(prods) ? prods : []);
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al cargar configuración de destacados web");
    } finally {
      setLoadingFeatured(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadBackupStats();
  }, []);

  useEffect(() => {
    if (activeTab === "audit") {
      loadAuditLogs();
    } else if (activeTab === "backup") {
      loadBackupStats();
    } else if (activeTab === "homeFeatured") {
      loadHomeFeaturedData();
    }
  }, [activeTab]);

  /* ── Alternar Producto en Destacados Web ── */
  const handleToggleProductFeatured = (productId: string) => {
    const current = homeFeaturedConfig.productIds || [];
    const isSelected = current.includes(productId);

    if (isSelected) {
      setHomeFeaturedConfig({
        ...homeFeaturedConfig,
        productIds: current.filter((id) => id !== productId),
      });
    } else {
      const limit = homeFeaturedConfig.maxItems || 6;
      if (current.length >= limit) {
        showNotification(
          "error",
          `Límite alcanzado: el máximo configurado es de ${limit} productos para mantener el Home ágil y limpio.`
        );
        return;
      }
      setHomeFeaturedConfig({
        ...homeFeaturedConfig,
        productIds: [...current, productId],
      });
    }
  };

  /* ── Guardar Destacados Web ── */
  const handleSaveHomeFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFeatured(true);
    try {
      await updateHomeFeatured(homeFeaturedConfig);
      showNotification("success", "Destacados de la página de inicio guardados correctamente");
      await loadHomeFeaturedData();
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al actualizar destacados web");
    } finally {
      setSavingFeatured(false);
    }
  };

  /* ── Guardar Configuración ── */
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSavingConfig(true);
    try {
      const updated = await updateSystemConfig(config);
      setConfig(updated);
      showNotification("success", "Configuración guardada exitosamente en el sistema");
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al guardar la configuración");
    } finally {
      setSavingConfig(false);
    }
  };

  /* ── Descargar Backup Manual ── */
  const handleDownloadBackup = async () => {
    setDownloadingBackup(true);
    try {
      await downloadDatabaseBackup();
      showNotification("success", "Respaldo JSON descargado directamente en tu equipo");
      loadBackupStats();
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al generar archivo de respaldo");
    } finally {
      setDownloadingBackup(false);
    }
  };

  /* ── Restaurar Backup desde Archivo ── */
  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("ADVERTENCIA: Esta acción actualizará o insertará los registros del archivo de respaldo en la base de datos. ¿Deseas continuar?")) {
      e.target.value = "";
      return;
    }

    setRestoringBackup(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const content = evt.target?.result as string;
          const json = JSON.parse(content);
          const res = await restoreDatabaseBackup(json);
          showNotification("success", "Base de datos restaurada correctamente desde el archivo");
          loadBackupStats();
          loadConfig();
        } catch (err: unknown) {
          const e = err as Error;
          showNotification("error", e.message || "Archivo de respaldo inválido");
        } finally {
          setRestoringBackup(false);
        }
      };
      reader.readAsText(file);
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al leer el archivo");
      setRestoringBackup(false);
    } finally {
      e.target.value = "";
    }
  };

  /* ── Exportar Auditoría a Excel ── */
  const handleExportAudit = async () => {
    setExportingAudit(true);
    try {
      await exportAuditLogs();
      showNotification("success", "Reporte de auditoría exportado a Excel exitosamente");
    } catch (err: unknown) {
      const e = err as Error;
      showNotification("error", e.message || "Error al exportar registros de auditoría");
    } finally {
      setExportingAudit(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] p-4 md:p-8 space-y-6 animate-fade-in">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#30363D] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[#E6EDF3] tracking-tight">
            Configuración & Centro de Control
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Gestión de identidad del bar, parámetros operativos de TPV, fidelidad, respaldos y auditoría
          </p>
        </div>

        {/* Notificaciones Flash */}
        {successMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3FB950]/15 border border-[#3FB950]/30 text-[#3FB950] text-xs font-bold animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F85149]/15 border border-[#F85149]/30 text-[#F85149] text-xs font-bold animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex items-center gap-2 border-b border-[#30363D] pb-3 overflow-x-auto">
        {[
          { id: "business",     label: "Identidad del Bar",  icon: Building2 },
          { id: "pos",          label: "Operación & TPV",    icon: Sliders },
          { id: "loyalty",      label: "Fidelidad & Puntos", icon: Coins },
          { id: "homeFeatured", label: "Destacados Web",     icon: Star },
          { id: "backup",       label: "Respaldos de Datos", icon: Database },
          { id: "audit",        label: "Auditoría en Vivo",  icon: Shield },
          { id: "alerts",       label: "Alertas & Monitoreo", icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as SettingsTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === id
                ? "bg-[#161B22] text-[#F0B429] border border-[#F0B429]/30 shadow-md"
                : "text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ================= CONTENIDO DE CADA PESTAÑA ================= */}
      {loadingConfig && activeTab !== "audit" && activeTab !== "alerts" && activeTab !== "homeFeatured" ? (
        <div className="flex items-center justify-center p-20 gap-3 text-[#F0B429]">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Cargando parámetros...</span>
        </div>
      ) : (
        <div className="space-y-6">

          {/* TAB 1: IDENTIDAD DEL BAR */}
          {activeTab === "business" && config && (
            <form onSubmit={handleSaveConfig} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-6 max-w-4xl shadow-xl">
              <div className="border-b border-[#30363D] pb-4">
                <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                  <Building2 size={18} className="text-[#F0B429]" />
                  Información Comercial del Establecimiento
                </h2>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Estos datos se reflejan en las comandas de mesas, comprobantes de pago y la aplicación web/móvil
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    value={config.business.name}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, name: e.target.value } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Razón Social / Titular Legal
                  </label>
                  <input
                    type="text"
                    value={config.business.legalName}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, legalName: e.target.value } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    CUIT / Identificación Fiscal
                  </label>
                  <input
                    type="text"
                    value={config.business.taxId}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, taxId: e.target.value } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={config.business.phone}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, phone: e.target.value } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    value={config.business.address}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, address: e.target.value } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Horario Operativo Habitual
                  </label>
                  <input
                    type="text"
                    value={config.business.openingHours}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, openingHours: e.target.value } })
                    }
                    placeholder="Ej: 19:00 - 05:00"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Símbolo de Moneda
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.business.currencySymbol}
                      onChange={(e) =>
                        setConfig({ ...config, business: { ...config.business, currencySymbol: e.target.value } })
                      }
                      className="w-20 bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono text-center text-[#F0B429] font-bold focus:outline-none focus:border-[#F0B429]"
                    />
                    <select
                      value={config.business.currency}
                      onChange={(e) =>
                        setConfig({ ...config, business: { ...config.business, currency: e.target.value } })
                      }
                      className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                    >
                      <option value="ARS">ARS - Peso Argentino</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="CLP">CLP - Peso Chileno</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    URL Logo del Bar (PNG / SVG)
                  </label>
                  <input
                    type="text"
                    value={config.business.logo || ""}
                    onChange={(e) =>
                      setConfig({ ...config, business: { ...config.business, logo: e.target.value } })
                    }
                    placeholder="https://..."
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#30363D]">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0B429] hover:bg-[#F0B429]/90 text-[#0D1117] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B429]/20"
                >
                  {savingConfig ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Guardar Identidad
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: OPERACIÓN & TPV */}
          {activeTab === "pos" && config && (
            <form onSubmit={handleSaveConfig} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-6 max-w-4xl shadow-xl">
              <div className="border-b border-[#30363D] pb-4">
                <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                  <Sliders size={18} className="text-[#F0B429]" />
                  Parámetros de Cobro, Comandas y Tiempos de Estación
                </h2>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Control de propinas, umbrales de alerta en cocina/barra y comportamiento de comandas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Propina Sugerida por Defecto (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.pos.suggestedTipPercent}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, suggestedTipPercent: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">Porcentaje sugerido en la precuenta del salón</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Impuesto / IVA (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={config.pos.taxPercent}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, taxPercent: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">Tasa impositiva aplicada a los productos</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Alerta Comanda Demorada en Barra (Minutos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={config.pos.delayedOrderMinutesBar}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, delayedOrderMinutesBar: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#F0B429] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">Minutos antes de marcar cócteles como demorados</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Alerta Comanda Demorada en Cocina (Minutos)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={config.pos.delayedOrderMinutesKitchen}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, delayedOrderMinutesKitchen: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#F0B429] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">Minutos antes de alertar platos demorados</p>
                </div>
              </div>

              {/* Switches de Operación */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                  <div>
                    <p className="text-xs font-bold text-[#E6EDF3]">Alertas Sonoras en TPV</p>
                    <p className="text-[11px] text-[#8B949E]">Emitir aviso sonoro al entrar un nuevo pedido en sala o app</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.pos.soundAlerts}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, soundAlerts: e.target.checked } })
                    }
                    className="w-4 h-4 rounded text-[#F0B429] border-[#30363D] focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                  <div>
                    <p className="text-xs font-bold text-[#E6EDF3]">Precios de Carta con IVA Incluido</p>
                    <p className="text-[11px] text-[#8B949E]">El valor publicado en el menú ya incluye la tasa impositiva</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.pos.taxIncluded}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, taxIncluded: e.target.checked } })
                    }
                    className="w-4 h-4 rounded text-[#F0B429] border-[#30363D] focus:ring-0"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                  <div>
                    <p className="text-xs font-bold text-[#E6EDF3]">Permitir Venta sin Stock de Insumos</p>
                    <p className="text-[11px] text-[#8B949E]">Permite emitir comandas aun si el stock en boveda figura en 0</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.pos.allowZeroStockSale}
                    onChange={(e) =>
                      setConfig({ ...config, pos: { ...config.pos, allowZeroStockSale: e.target.checked } })
                    }
                    className="w-4 h-4 rounded text-[#F0B429] border-[#30363D] focus:ring-0"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#30363D]">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0B429] hover:bg-[#F0B429]/90 text-[#0D1117] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B429]/20"
                >
                  {savingConfig ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Guardar Parámetros de Operación
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FIDELIDAD & PUNTOS */}
          {activeTab === "loyalty" && config && (
            <form onSubmit={handleSaveConfig} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 space-y-6 max-w-4xl shadow-xl">
              <div className="border-b border-[#30363D] pb-4">
                <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                  <Coins size={18} className="text-[#F0B429]" />
                  Reglas de Acumulación y Beneficios de Clientes
                </h2>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Define cómo los clientes ganan puntos al consumir en el bar y las políticas de vencimiento
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Tasa de Acumulación (Puntos por Peso Gastado)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={config.loyalty.pointsPerCurrencyUnit}
                    onChange={(e) =>
                      setConfig({ ...config, loyalty: { ...config.loyalty, pointsPerCurrencyUnit: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#F0B429] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">
                    Ej: 0.01 otorga 1 punto por cada $100 consumidos en el ticket
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Puntos de Bienvenida (Registro Nuevo)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.loyalty.welcomeBonusPoints}
                    onChange={(e) =>
                      setConfig({ ...config, loyalty: { ...config.loyalty, welcomeBonusPoints: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">
                    Crédito inicial otorgado al crear cuenta en la aplicación móvil
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Vigencia de Puntos (Días)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={config.loyalty.pointsExpiryDays}
                    onChange={(e) =>
                      setConfig({ ...config, loyalty: { ...config.loyalty, pointsExpiryDays: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                  <p className="text-[10px] text-[#8B949E] mt-1">
                    0 = sin vencimiento. 365 = 1 año de validez para canjear
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-1">
                    Mínimo de Puntos para Canje
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={config.loyalty.minRedemptionPoints}
                    onChange={(e) =>
                      setConfig({ ...config, loyalty: { ...config.loyalty, minRedemptionPoints: Number(e.target.value) } })
                    }
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#E6EDF3] focus:outline-none focus:border-[#F0B429]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D1117] border border-[#30363D]">
                <div>
                  <p className="text-xs font-bold text-[#E6EDF3]">Programa de Fidelidad Habilitado</p>
                  <p className="text-[11px] text-[#8B949E]">Permite sumar y canjear puntos a través de la aplicación de clientes</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.loyalty.isActive}
                  onChange={(e) =>
                    setConfig({ ...config, loyalty: { ...config.loyalty, isActive: e.target.checked } })
                  }
                  className="w-4 h-4 rounded text-[#F0B429] border-[#30363D] focus:ring-0"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[#30363D]">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0B429] hover:bg-[#F0B429]/90 text-[#0D1117] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F0B429]/20"
                >
                  {savingConfig ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Guardar Reglas de Fidelidad
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: RESPALDOS DE DATOS */}
          {activeTab === "backup" && (
            <div className="space-y-6 max-w-4xl">
              
              {/* Snapshot Metrics Card */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                      <Database size={18} className="text-[#3FB950]" />
                      Motor de Respaldos Directos
                    </h2>
                    <p className="text-xs text-[#8B949E] mt-0.5">
                      Descarga snapshots completos en formato JSON listos para importar o resguardar
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#3FB950] bg-[#3FB950]/10 px-3 py-1 rounded-md border border-[#3FB950]/30 font-bold">
                    {backupStats?.totalRecords || 0} registros activos
                  </span>
                </div>

                {/* Grid de desglose */}
                {backupStats && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {[
                      { label: "Menús", count: backupStats.breakdown.menus },
                      { label: "Productos", count: backupStats.breakdown.products },
                      { label: "Recetas", count: backupStats.breakdown.recipes },
                      { label: "Insumos", count: backupStats.breakdown.inventory },
                      { label: "Premios", count: backupStats.breakdown.rewards },
                      { label: "Mesas", count: backupStats.breakdown.tables },
                    ].map(({ label, count }) => (
                      <div key={label} className="bg-[#0D1117] p-3 rounded-xl border border-[#30363D] text-center">
                        <p className="text-base font-mono font-bold text-[#E6EDF3]">{count}</p>
                        <p className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Acciones de Backup */}
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    disabled={downloadingBackup}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3FB950] hover:bg-[#3FB950]/90 disabled:opacity-50 text-[#0D1117] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#3FB950]/20"
                  >
                    {downloadingBackup ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Descargar Respaldo Completo (.JSON)
                  </button>

                  <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1C2333] hover:bg-[#1C2333]/80 border border-[#30363D] text-[#E6EDF3] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                    {restoringBackup ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Restaurar desde Archivo (.JSON)
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreFile}
                      disabled={restoringBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDITORÍA EN VIVO */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#161B22] p-4 rounded-2xl border border-[#30363D]">
                <div>
                  <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                    <Shield size={16} className="text-[#388BFD]" />
                    Registro de Auditoría de Operaciones
                  </h2>
                  <p className="text-xs text-[#8B949E]">
                    Historial de eventos de MongoDB conectado en tiempo real
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => loadAuditLogs()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                  >
                    <RefreshCw size={13} className={loadingAudit ? "animate-spin" : ""} />
                    Refrescar
                  </button>

                  <button
                    type="button"
                    onClick={handleExportAudit}
                    disabled={exportingAudit}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#388BFD] hover:bg-[#388BFD]/90 text-[#0D1117] text-xs font-bold transition-all shadow-md shadow-[#388BFD]/20"
                  >
                    {exportingAudit ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
                    Exportar a Excel
                  </button>
                </div>
              </div>

              <AuditLogSystem
                logs={auditLogs}
                onExport={handleExportAudit}
              />
            </div>
          )}

          {/* TAB 6: ALERTAS */}
          {activeTab === "alerts" && (
            <AlertsConfigurationPage />
          )}

          {/* TAB 7: DESTACADOS WEB (HOME) */}
          {activeTab === "homeFeatured" && (
            <div className="space-y-6">
              {loadingFeatured ? (
                <div className="flex items-center justify-center p-20 gap-3 text-[#F0B429]">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider">Cargando catálogo web...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveHomeFeatured} className="space-y-6">
                  {/* Card 1: Parámetros Visuales */}
                  <div className="bg-[#161B22] p-6 rounded-2xl border border-[#30363D] space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
                      <div>
                        <h2 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                          <Star size={16} className="text-[#F0B429]" />
                          Curaduría de Destacados Web (Home)
                        </h2>
                        <p className="text-xs text-[#8B949E] mt-0.5">
                          Controla qué productos emblemáticos ve el cliente al entrar en la web, con límite estricto para evitar saturación visual.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8B949E]">Límite en Home:</span>
                        {[4, 6, 8].map((limit) => (
                          <button
                            key={limit}
                            type="button"
                            onClick={() => {
                              const newIds = (homeFeaturedConfig.productIds || []).slice(0, limit);
                              setHomeFeaturedConfig({
                                ...homeFeaturedConfig,
                                maxItems: limit,
                                productIds: newIds,
                              });
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                              homeFeaturedConfig.maxItems === limit
                                ? "bg-[#F0B429] text-[#0D1117] border-[#F0B429] shadow-sm"
                                : "bg-[#0D1117] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                            }`}
                          >
                            {limit} ítems
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                          Etiqueta / Badge Superior
                        </label>
                        <input
                          type="text"
                          value={homeFeaturedConfig.badge}
                          onChange={(e) =>
                            setHomeFeaturedConfig({
                              ...homeFeaturedConfig,
                              badge: e.target.value,
                            })
                          }
                          placeholder="Ej: Recomendados de la Casa"
                          className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:border-[#F0B429] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                          Título Principal de la Sección
                        </label>
                        <input
                          type="text"
                          value={homeFeaturedConfig.headline}
                          onChange={(e) =>
                            setHomeFeaturedConfig({
                              ...homeFeaturedConfig,
                              headline: e.target.value,
                            })
                          }
                          placeholder="Ej: Nuestra Selección de Autor"
                          className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:border-[#F0B429] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#8B949E] uppercase tracking-wider mb-1.5">
                          Subtítulo Descriptivo
                        </label>
                        <input
                          type="text"
                          value={homeFeaturedConfig.subtitle}
                          onChange={(e) =>
                            setHomeFeaturedConfig({
                              ...homeFeaturedConfig,
                              subtitle: e.target.value,
                            })
                          }
                          placeholder="Ej: Las creaciones y platos más aclamados de nuestra barra y cocina"
                          className="w-full bg-[#0D1117] border border-[#30363D] rounded-xl px-3.5 py-2.5 text-xs text-[#E6EDF3] focus:border-[#F0B429] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Previsualización Header Web */}
                    <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-[#F0B429]/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#F0B429] bg-[#F0B429]/10 px-2 py-0.5 rounded-full border border-[#F0B429]/30">
                          <Sparkles size={11} />
                          {homeFeaturedConfig.badge || "Recomendados de la Casa"}
                        </span>
                        <h3 className="text-base font-bold text-[#E6EDF3]">
                          {homeFeaturedConfig.headline || "Nuestra Selección de Autor"}
                        </h3>
                        <p className="text-xs text-[#8B949E]">
                          {homeFeaturedConfig.subtitle || "Las creaciones y platos más aclamados"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#E6EDF3]">
                            {(homeFeaturedConfig.productIds || []).length} / {homeFeaturedConfig.maxItems}
                          </span>
                          <p className="text-[10px] text-[#8B949E]">Seleccionados</p>
                        </div>
                        <button
                          type="submit"
                          disabled={savingFeatured}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F0B429] hover:bg-[#F0B429]/90 text-[#0D1117] text-xs font-bold transition-all shadow-md shadow-[#F0B429]/20"
                        >
                          {savingFeatured ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bandeja de productos seleccionados actualmente */}
                  <div className="bg-[#161B22] p-5 rounded-2xl border border-[#30363D] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E6EDF3] flex items-center gap-2">
                        <Layers size={14} className="text-[#388BFD]" />
                        Productos en Destacados Ahora ({(homeFeaturedConfig.productIds || []).length})
                      </span>
                      {(homeFeaturedConfig.productIds || []).length === 0 && (
                        <span className="text-xs text-[#F0B429]">
                          (Se mostrarán automáticamente los productos mejor valorados por defecto)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(homeFeaturedConfig.productIds || []).map((id) => {
                        const prod = allProducts.find((p) => (p._id || p.id) === id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg bg-[#0D1117] border border-[#F0B429]/40 text-xs text-[#E6EDF3]"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#F0B429]" />
                            <span className="font-medium">{prod?.name || `ID: ${id}`}</span>
                            <span className="text-[11px] text-[#F0B429] font-bold">
                              ${Number(prod?.price || 0).toLocaleString("es-AR")}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleProductFeatured(id)}
                              className="p-1 rounded hover:bg-[#F85149]/20 text-[#8B949E] hover:text-[#F85149] transition-colors ml-1"
                              title="Quitar de destacados"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 2: Catálogo de Productos y Selector */}
                  <div className="bg-[#161B22] p-6 rounded-2xl border border-[#30363D] space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-[#E6EDF3]">
                          Catálogo de Productos Disponibles
                        </h3>
                        <p className="text-xs text-[#8B949E]">
                          Selecciona los productos del menú que deseas destacar en la portada
                        </p>
                      </div>

                      {/* Buscador y Filtro por Tipo */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Buscar producto o categoría..."
                            className="bg-[#0D1117] border border-[#30363D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-[#F0B429] focus:outline-none w-56"
                          />
                        </div>

                        <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-xl border border-[#30363D]">
                          <button
                            type="button"
                            onClick={() => setProductTypeFilter("all")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              productTypeFilter === "all"
                                ? "bg-[#161B22] text-[#F0B429]"
                                : "text-[#8B949E] hover:text-[#E6EDF3]"
                            }`}
                          >
                            Todos
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductTypeFilter("drink")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              productTypeFilter === "drink"
                                ? "bg-[#161B22] text-[#F0B429]"
                                : "text-[#8B949E] hover:text-[#E6EDF3]"
                            }`}
                          >
                            Bebidas
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductTypeFilter("food")}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              productTypeFilter === "food"
                                ? "bg-[#161B22] text-[#F0B429]"
                                : "text-[#8B949E] hover:text-[#E6EDF3]"
                            }`}
                          >
                            Comidas
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Grilla de Selección de Productos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                      {allProducts
                        .filter((p) => {
                          const matchesSearch =
                            !productSearch ||
                            p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.category?.toLowerCase().includes(productSearch.toLowerCase());
                          const matchesType =
                            productTypeFilter === "all" || p.type === productTypeFilter;
                          return matchesSearch && matchesType;
                        })
                        .map((prod) => {
                          const pId = prod._id || prod.id;
                          const isSelected = (homeFeaturedConfig.productIds || []).includes(pId);
                          const isMaxReached =
                            (homeFeaturedConfig.productIds || []).length >=
                            (homeFeaturedConfig.maxItems || 6);

                          return (
                            <div
                              key={pId}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                isSelected
                                  ? "bg-[#0D1117] border-[#F0B429] shadow-md shadow-[#F0B429]/10"
                                  : "bg-[#0D1117]/60 border-[#30363D] hover:border-[#8B949E]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-[#161B22] shrink-0 border border-[#30363D]"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-[#161B22] flex items-center justify-center shrink-0 border border-[#30363D] text-[#8B949E]">
                                    {prod.type === "drink" ? (
                                      <GlassWater size={20} className="text-[#388BFD]" />
                                    ) : (
                                      <ChefHat size={20} className="text-[#E6EDF3]" />
                                    )}
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
                                      {prod.category}
                                    </span>
                                    {isSelected && (
                                      <span className="text-[9px] font-bold text-[#0D1117] bg-[#F0B429] px-1.5 py-0.2 rounded-md">
                                        EN HOME
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-bold text-[#E6EDF3] truncate">
                                    {prod.name}
                                  </h4>
                                  <p className="text-xs font-extrabold text-[#F0B429] mt-0.5">
                                    ${Number(prod.price || 0).toLocaleString("es-AR")}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleProductFeatured(pId)}
                                disabled={!isSelected && isMaxReached}
                                className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                  isSelected
                                    ? "bg-[#F85149]/15 text-[#F85149] hover:bg-[#F85149]/25 border border-[#F85149]/30"
                                    : isMaxReached
                                    ? "bg-[#161B22] text-[#8B949E]/50 border border-[#30363D] cursor-not-allowed"
                                    : "bg-[#161B22] text-[#E6EDF3] hover:text-[#0D1117] hover:bg-[#F0B429] border border-[#30363D] hover:border-[#F0B429]"
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Trash2 size={13} /> Quitar de Portada
                                  </>
                                ) : (
                                  <>
                                    <Plus size={13} /> Destacar en Portada
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
