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
} from "lucide-react";

type PityVaultTab = "tracker" | "config";

export default function PityVault() {
  const [activeTab, setActiveTab] = useState<PityVaultTab>("tracker");

  // ── Live Tracker state ─────────────────────────────────────────
  const [employees, setEmployees] = useState<EmployeeRouletteStats[]>([]);
  const [loadingTracker, setLoadingTracker] = useState(true);

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
      alert("Configuración de pity guardada y sincronizada.");
    } catch (error) {
      console.error("PityVault: error saving config:", error);
      alert("Error al guardar la configuración.");
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="relative glass-royale border border-white/5 rounded-[2.5rem] p-6 shadow-royale overflow-hidden">
      {/* Background glow */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-gold" />
          <div>
            <h3 className="text-sm font-black text-ivory tracking-tighter uppercase">
              Pity <span className="text-grad-gold">Vault</span>
            </h3>
            <p className="text-[8px] text-muted font-black uppercase tracking-[0.35em] mt-0.5">
              Garantías & Configuración
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-surface-3/30 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab("tracker")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "tracker"
                ? "bg-gold/15 text-gold border border-gold/10"
                : "text-muted hover:text-ivory"
            }`}
          >
            <Trophy size={10} /> Live Tracker
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "config"
                ? "bg-gold/15 text-gold border border-gold/10"
                : "text-muted hover:text-ivory"
            }`}
          >
            <Settings2 size={10} /> Config
          </button>
        </div>
      </div>

      {/* ── TAB: LIVE TRACKER ── */}
      {activeTab === "tracker" && (
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[8px] font-black text-muted uppercase tracking-widest">
              Empleados activos: {employees.length}
            </span>
            <button
              onClick={fetchStats}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-3/30 hover:bg-gold/10 text-[8px] font-black tracking-widest text-gold rounded-xl border border-gold/20 transition-all active:scale-95"
            >
              <RefreshCw size={10} className={loadingTracker ? "animate-spin" : ""} /> Refrescar
            </button>
          </div>

          {loadingTracker && employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="text-gold animate-spin mb-3" size={24} />
              <span className="text-[9px] text-muted font-black tracking-widest uppercase">
                Cargando Pity Tracker...
              </span>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl">
              <User2 size={24} className="text-muted/30 mx-auto mb-2" />
              <p className="text-[9px] text-muted font-black uppercase tracking-wider">
                No se encontraron empleados
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {employees.map(({ user, stats }) => (
                <div
                  key={user.id}
                  className="group p-5 rounded-2xl border border-white/5 bg-surface-3/15 hover:border-gold/20 hover:bg-surface-3/30 transition-all duration-300"
                >
                  {/* Employee header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-3 border border-white/5 flex items-center justify-center text-lg group-hover:border-gold/30 transition-colors">
                        👤
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-ivory tracking-tight uppercase group-hover:text-gold transition-colors">
                          {user.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-surface-3 text-muted text-[7px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                            {user.role}
                          </span>
                          {user.shift && (
                            <span className="px-2 py-0.5 bg-gold/5 text-gold text-[7px] font-black uppercase tracking-widest rounded-lg border border-gold/10">
                              {user.shift}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7px] text-muted font-black tracking-widest uppercase">KPI</span>
                        <span className="text-[9px] font-black text-gold">{user.kpiScore}%</span>
                      </div>
                      {user.hasLuckBuff ? (
                        <div className="flex items-center gap-1 mt-0.5 text-[7px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20 animate-pulse">
                          <Sparkles size={8} /> x{user.luckMultiplier}
                        </div>
                      ) : (
                        <span className="text-[7px] text-muted/60 font-bold uppercase tracking-widest mt-0.5">
                          Sin buff
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pity bars */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
                    {/* RARE */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-wider">
                        <span className="text-blue-400 flex items-center gap-0.5">
                          <Zap size={8} /> RARE
                        </span>
                        <span className="text-ivory">{stats.spinsSinceRare}/10</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div
                          className="h-full rounded-full bg-blue-400 transition-all duration-700"
                          style={{ width: `${Math.min((stats.spinsSinceRare / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[6px] text-muted uppercase font-bold tracking-widest">
                        {stats.nextRarePity === 0
                          ? "🏆 ¡Garantizado!"
                          : `En ${stats.nextRarePity} spins`}
                      </p>
                    </div>

                    {/* EPIC */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-wider">
                        <span className="text-purple-400 flex items-center gap-0.5">
                          <Award size={8} /> EPIC
                        </span>
                        <span className="text-ivory">{stats.spinsSinceEpic}/25</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div
                          className="h-full rounded-full bg-purple-400 transition-all duration-700"
                          style={{ width: `${Math.min((stats.spinsSinceEpic / 25) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[6px] text-muted uppercase font-bold tracking-widest">
                        {stats.nextEpicPity === 0
                          ? "🏆 ¡Garantizado!"
                          : `En ${stats.nextEpicPity} spins`}
                      </p>
                    </div>

                    {/* LEGENDARY */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-wider">
                        <span className="text-gold flex items-center gap-0.5">
                          <Star size={8} /> LEG
                        </span>
                        <span className="text-ivory">{stats.spinsSinceLegendary}/50</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                        <div
                          className="h-full rounded-full bg-grad-gold transition-all duration-700"
                          style={{ width: `${Math.min((stats.spinsSinceLegendary / 50) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[6px] text-muted uppercase font-bold tracking-widest">
                        {stats.nextLegendaryPity === 0
                          ? "🏆 ¡Garantizado!"
                          : `En ${stats.nextLegendaryPity} spins`}
                      </p>
                    </div>
                  </div>

                  {/* Prize counts */}
                  <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5 text-[7px] uppercase font-black tracking-widest">
                    <span className="text-muted">C: <strong className="text-ivory">{stats.prizesWon.common}</strong></span>
                    <span className="text-blue-400">R: <strong className="text-ivory">{stats.prizesWon.rare}</strong></span>
                    <span className="text-purple-400">E: <strong className="text-ivory">{stats.prizesWon.epic}</strong></span>
                    <span className="text-gold">L: <strong className="text-ivory">{stats.prizesWon.legendary}</strong></span>
                    <span className="ml-auto text-muted/60">{stats.totalSpins} spins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CONFIG ── */}
      {activeTab === "config" && (
        <div className="relative z-10 space-y-5">
          {loadingConfig ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="text-gold animate-spin mb-3" size={20} />
              <span className="text-[9px] text-muted font-black tracking-widest uppercase">
                Cargando Configuración...
              </span>
            </div>
          ) : config ? (
            <>
              {/* Pity Thresholds */}
              <div className="bg-surface-3/15 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-[9px] font-black text-ivory tracking-widest uppercase border-b border-white/5 pb-3">
                  Umbrales de Garantía (Spins)
                </h4>

                {(["RARE", "EPIC", "LEGENDARY"] as const).map((rarityKey) => (
                  <div key={rarityKey} className="flex justify-between items-center">
                    <label className="text-[8px] font-black text-muted uppercase tracking-widest">
                      Garantía {rarityKey}
                    </label>
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
                      className="w-20 bg-surface-3 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                    />
                  </div>
                ))}

                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div>
                    <label className="text-[8px] font-black text-muted uppercase tracking-widest">
                      Pity Boost Multiplier
                    </label>
                    <p className="text-[7px] text-muted/70 uppercase tracking-wider mt-0.5">
                      Multiplicador al alcanzar garantía
                    </p>
                  </div>
                  <input
                    type="number"
                    value={config.pityBoostMultiplier}
                    onChange={(e) =>
                      setConfig({ ...config, pityBoostMultiplier: Number(e.target.value) })
                    }
                    className="w-20 bg-surface-3 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                  />
                </div>
              </div>

              {/* KPI & Rarity */}
              <div className="bg-surface-3/15 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-[9px] font-black text-ivory tracking-widest uppercase border-b border-white/5 pb-3">
                  KPI & Multiplicadores
                </h4>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[8px] font-black text-muted uppercase tracking-widest">
                      KPI Mínimo de Suerte
                    </label>
                    <p className="text-[7px] text-muted/70 mt-0.5 uppercase tracking-wider">Meta para activar buff</p>
                  </div>
                  <input
                    type="number"
                    value={config.kpiMinScore}
                    onChange={(e) =>
                      setConfig({ ...config, kpiMinScore: Number(e.target.value) })
                    }
                    className="w-20 bg-surface-3 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[8px] font-black text-muted uppercase tracking-widest">
                      Multiplicador Máx Buff
                    </label>
                    <p className="text-[7px] text-muted/70 mt-0.5 uppercase tracking-wider">Empuje máx por excelencia</p>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    value={config.kpiMaxMultiplier}
                    onChange={(e) =>
                      setConfig({ ...config, kpiMaxMultiplier: Number(e.target.value) })
                    }
                    className="w-20 bg-surface-3 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="space-y-2 pt-3 border-t border-white/5">
                  <label className="text-[8px] font-black text-muted uppercase tracking-widest">
                    Modificadores de Rarity Base
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(config.rarityModifiers) as RouletteRarity[]).map((rarityKey) => (
                      <div
                        key={rarityKey}
                        className="flex justify-between items-center bg-surface-3/30 border border-white/5 rounded-xl px-3 py-2"
                      >
                        <span className="text-[7px] font-black uppercase text-muted tracking-wider">
                          {rarityKey}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={config.rarityModifiers[rarityKey]}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              rarityModifiers: {
                                ...config.rarityModifiers,
                                [rarityKey]: Number(e.target.value),
                              },
                            })
                          }
                          className="w-14 bg-surface-3 border border-white/10 rounded-lg py-1 text-[9px] font-black text-ivory text-center focus:outline-none focus:border-gold/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  className="flex items-center gap-2 px-6 py-3 bg-grad-gold hover:opacity-90 text-[9px] font-black tracking-[0.2em] text-black rounded-xl border border-gold/30 shadow-gold-glow/5 uppercase transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  <Save size={12} /> {savingConfig ? "GUARDANDO..." : "GUARDAR CONFIG"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-[9px] text-muted font-black uppercase tracking-widest">
                Error al cargar la configuración
              </p>
              <button
                onClick={fetchConfig}
                className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 bg-surface-3/30 hover:bg-gold/10 text-[8px] font-black tracking-widest text-gold rounded-xl border border-gold/20 transition-all"
              >
                <RefreshCw size={10} /> Reintentar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
