"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAllUserRouletteStats,
  getRouletteConfig,
  updateRouletteConfig,
} from "../../services/rouletteService";
import type { EmployeeRouletteStats, RouletteConfig } from "../../services/rouletteService";
import type { RouletteRarity } from "../../types/roulette";
import { getSocket } from "../../../../services/socket";
import {
  Trophy,
  Settings2,
  RefreshCw,
  User2,
  Sparkles,
  Zap,
  Award,
  Star,
  Save,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type PityVaultTab = "tracker" | "config";

export default function PityVault() {
  const [activeTab, setActiveTab] = useState<PityVaultTab>("tracker");

  // ── Live Tracker state ─────────────────────────────────────────
  const [employees, setEmployees] = useState<EmployeeRouletteStats[]>([]);
  const [loadingTracker, setLoadingTracker] = useState(true);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAllUserRouletteStats();
      setEmployees(data);
    } catch (error) {
      console.error("PityVault: error fetching employees stats:", error);
    } finally {
      setLoadingTracker(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const socket = getSocket();
    if (socket) {
      socket.on("roulette:spin", fetchStats);
      socket.on("roulette:admin:spin", fetchStats);
    }

    return () => {
      if (socket) {
        socket.off("roulette:spin", fetchStats);
        socket.off("roulette:admin:spin", fetchStats);
      }
    };
  }, [fetchStats]);

  // ── Config state ───────────────────────────────────────────────
  const [config, setConfig] = useState<RouletteConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const data = await getRouletteConfig();
      setConfig(data);
    } catch (error) {
      console.error("PityVault: error loading config:", error);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "config" && !config) {
      fetchConfig();
    }
  }, [activeTab, config, fetchConfig]);

  const handleSaveConfig = async () => {
    if (!config) return;
    setSavingConfig(true);
    try {
      const res = await updateRouletteConfig(config);
      setConfig(res);
      showFeedback("success", "Configuración de pity sincronizada con el servidor.");
    } catch (error) {
      console.error("PityVault: error saving config:", error);
      showFeedback("error", "Error al guardar la configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="bg-surface-2 border border-border rounded-2xl p-5 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Shield size={18} className="text-gold" />
          <div>
            <h4 className="text-xs font-black text-ivory tracking-wider uppercase">
              Pity Vault
            </h4>
            <p className="text-xs text-muted">
              Garantías de racha y configuración de probabilidades
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-surface-3 p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === "tracker"
                ? "bg-gold text-bg shadow-sm"
                : "text-muted hover:text-ivory"
            }`}
          >
            <Trophy size={12} /> Tracker
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
              activeTab === "config"
                ? "bg-gold text-bg shadow-sm"
                : "text-muted hover:text-ivory"
            }`}
          >
            <Settings2 size={12} /> Config
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 border animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald/10 text-emerald border-emerald/30"
              : "bg-red/10 text-red border-red/30"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── TAB: LIVE TRACKER ── */}
      {activeTab === "tracker" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-muted font-bold uppercase tracking-wider">
              Personal activo: {employees.length}
            </span>
            <button
              onClick={fetchStats}
              className="flex items-center gap-1 px-3 py-1 bg-surface-3 hover:bg-surface-4 text-xs font-bold text-gold rounded-lg border border-border transition-all"
            >
              <RefreshCw size={11} className={loadingTracker ? "animate-spin" : ""} /> Refrescar
            </button>
          </div>

          {loadingTracker && employees.length === 0 ? (
            <div className="py-8 text-center text-muted">
              <RefreshCw className="text-gold animate-spin mx-auto mb-2" size={20} />
              <p className="text-xs font-bold uppercase">Cargando Pity Tracker...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-xl">
              <User2 size={24} className="text-muted/40 mx-auto mb-2" />
              <p className="text-xs text-muted font-bold uppercase">Sin registros de empleados</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {employees.map(({ user, stats }) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl border border-border bg-surface-3/40 hover:bg-surface-3 transition-all"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-ivory uppercase truncate">
                        {user.name}
                      </h5>
                      <span className="text-xs text-muted font-bold">{user.role}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-gold">KPI {user.kpiScore}%</span>
                      {user.hasLuckBuff && (
                        <div className="text-xs font-bold text-emerald flex items-center gap-1">
                          <Sparkles size={10} /> x{user.luckMultiplier}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pity progress bars */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <div>
                      <div className="flex justify-between text-xs text-muted font-bold mb-1">
                        <span className="text-[#388BFD]">Raro</span>
                        <span>{stats.spinsSinceRare}/10</span>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#388BFD] rounded-full"
                          style={{ width: `${Math.min((stats.spinsSinceRare / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted font-bold mb-1">
                        <span className="text-[#A371F7]">Épico</span>
                        <span>{stats.spinsSinceEpic}/25</span>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A371F7] rounded-full"
                          style={{ width: `${Math.min((stats.spinsSinceEpic / 25) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted font-bold mb-1">
                        <span className="text-gold">Legend.</span>
                        <span>{stats.spinsSinceLegendary}/50</span>
                      </div>
                      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold rounded-full"
                          style={{ width: `${Math.min((stats.spinsSinceLegendary / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CONFIG ── */}
      {activeTab === "config" && (
        <div className="space-y-4">
          {loadingConfig ? (
            <div className="py-8 text-center text-muted">
              <RefreshCw className="text-gold animate-spin mx-auto mb-2" size={20} />
              <p className="text-xs font-bold uppercase">Cargando Configuración...</p>
            </div>
          ) : config ? (
            <>
              <div className="p-3.5 rounded-xl bg-surface-3/50 border border-border space-y-3">
                <h5 className="text-xs font-black text-ivory uppercase tracking-wider pb-2 border-b border-border">
                  Umbrales de Garantía (Giros)
                </h5>

                {(["RARE", "EPIC", "LEGENDARY"] as const).map((rarityKey) => (
                  <div key={rarityKey} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-muted uppercase">Garantía {rarityKey}</span>
                    <input
                      type="number"
                      value={config.pityThresholds[rarityKey]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          pityThresholds: {
                            ...config.pityThresholds,
                            [rarityKey]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-16 px-2 py-1 bg-surface-2 border border-border rounded-lg text-xs font-bold text-ivory text-center"
                    />
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
                  <span className="font-bold text-muted uppercase">Multiplicador Boost</span>
                  <input
                    type="number"
                    value={config.pityBoostMultiplier}
                    onChange={(e) =>
                      setConfig({ ...config, pityBoostMultiplier: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 bg-surface-2 border border-border rounded-lg text-xs font-bold text-ivory text-center"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-light text-bg text-xs font-black uppercase tracking-wider rounded-xl shadow-gold-glow transition-all disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{savingConfig ? "Guardando..." : "Guardar Configuración"}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-muted">
              <p className="text-xs font-bold">Error al cargar configuración</p>
              <button
                onClick={fetchConfig}
                className="mt-2 px-3 py-1 bg-surface-3 text-gold text-xs font-bold rounded-lg border border-border"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
