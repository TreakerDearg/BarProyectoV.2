"use client";

import { useRoulette } from "../hooks/useRoulette";
import { useRouletteAudio } from "../hooks/useRouletteAudio";
import { useToast } from "../hooks/useToast";
import RoulettePreview from "../components/RoulettePreview/RoulettePreview";
import ProductSelector from "../components/ProductSelector";
import RouletteLogs from "../components/RouletteLogs";
import RouletteStats from "../components/RouletteStats";
import ProbabilityEngine from "../components/ProbabilityEngine";
import RarityBadge from "../components/RarityBadge";
import RouletteTutorial from "../components/RouletteTutorial";
import ToastContainer from "../components/ToastNotification";
import JackpotBanner from "../components/JackpotBanner";
import WinnerCard from "../components/WinnerCard";
import PityVault from "../components/TheLab/PityVault";
import FaderMixer from "../components/TheLab/FaderMixer";
import SmartPresets from "../components/TheLab/SmartPresets";
import { rouletteSocket } from "../services/rouletteService";

import {
  Shuffle,
  Zap,
  History,
  LayoutDashboard,
  Sparkles,
  Tv,
  SlidersHorizontal,
  BookOpen,
  X,
  Plus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";

export default function RoulettePage() {
  const {
    drinks,
    loading,
    phase,
    revealedResult,
    targetAngle,
    onWheelLanded,
    spinning,
    lastResult,
    logs,
    actions,
  } = useRoulette();

  const { playTick, playImpact, playFanfare, isMuted, toggleMute } = useRouletteAudio();
  const { toasts, removeToast, success, error } = useToast();

  const [viewMode, setViewMode] = useState<"playroom" | "control">("playroom");
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "logs">("main");
  const [showAddDrinkModal, setShowAddDrinkModal] = useState(false);
  const [showTheLab, setShowTheLab] = useState(false);

  // ── Jackpot banner state ──────────────────────────────────────
  const [jackpot, setJackpot] = useState<{ drinkName: string } | null>(null);

  useEffect(() => {
    rouletteSocket.onJackpot((data) => {
      setJackpot({ drinkName: data.drinkName });
      setTimeout(() => setJackpot(null), 8000);
    });
    return () => {
      rouletteSocket.offJackpot();
    };
  }, []);

  // ── Audio: tick loop during spinning/revealing ────────────────
  const tickRafRef = useRef<number | null>(null);
  const spinStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const isSpinning = phase === "spinning" || phase === "revealing";

    if (isSpinning) {
      spinStartTimeRef.current = performance.now();
      let lastTick = 0;

      const tickLoop = (now: number) => {
        const elapsed = (now - spinStartTimeRef.current) / 1000;
        const speed = Math.max(0.1, 1 - elapsed / 8);
        const interval = (0.06 + (1 - speed) * 0.5) * 1000; // ms

        if (now - lastTick >= interval) {
          playTick(speed);
          lastTick = now;
        }

        tickRafRef.current = requestAnimationFrame(tickLoop);
      };

      tickRafRef.current = requestAnimationFrame(tickLoop);

      return () => {
        if (tickRafRef.current !== null) {
          cancelAnimationFrame(tickRafRef.current);
          tickRafRef.current = null;
        }
      };
    } else {
      if (tickRafRef.current !== null) {
        cancelAnimationFrame(tickRafRef.current);
        tickRafRef.current = null;
      }
    }
  }, [phase, playTick]);

  // ── Audio: impact on landing ──────────────────────────────────
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current !== "landing" && phase === "landing") {
      playImpact();
    }
    if (prevPhaseRef.current !== "revealed" && phase === "revealed") {
      if (revealedResult?.result?.rarity) {
        playFanfare(revealedResult.result.rarity);
      }
    }
    prevPhaseRef.current = phase;
  }, [phase, revealedResult, playImpact, playFanfare]);

  // Estadísticas por rareza
  const rarityStats = useMemo(() => {
    const active = drinks.filter((d) => d && d.active);
    const totalW = active.reduce((s, d) => s + (d.weight || 0), 0) || 1;
    const tiers = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;
    return tiers.map((r) => {
      const group = active.filter((d) => d.rarity === r);
      const prob = (group.reduce((s, d) => s + (d.weight || 0), 0) / totalW) * 100;
      return { rarity: r, count: group.length, probability: +prob.toFixed(1) };
    });
  }, [drinks]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-14 h-14 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-xs font-black text-gold uppercase tracking-widest animate-pulse">
          Iniciando Smart Roulette Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
      {/* ================= JACKPOT BANNER ================= */}
      <JackpotBanner
        visible={!!jackpot}
        drinkName={jackpot?.drinkName ?? ""}
        onClose={() => setJackpot(null)}
      />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold border border-gold/30 shadow-gold-glow">
              <Shuffle size={24} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-ivory tracking-tight uppercase">
                Ruleta de <span className="text-gold">Tragos</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted font-bold uppercase tracking-wider">
                  Motor de Gamificación & Sorteo Royale
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-bold uppercase border border-emerald/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
                  Live Sync Activo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del Header: Sonido, Tutorial y Selector de Vistas */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-ivory rounded-xl border border-border transition-all text-xs font-bold uppercase tracking-wider"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX size={15} className="text-muted" /> : <Volume2 size={15} className="text-gold" />}
            <span>{isMuted ? "Silenciado" : "Audio Activo"}</span>
          </button>

          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl border border-gold/30 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <BookOpen size={15} />
            <span>Tutorial</span>
          </button>

          {/* Selector de Modo / Tabs */}
          <div className="flex bg-surface-2 p-1 rounded-2xl border border-border">
            {(
              [
                { mode: "playroom", tab: "main", icon: <Tv size={14} />, label: "Modo Escenario" },
                { mode: "control", tab: "main", icon: <SlidersHorizontal size={14} />, label: "Control Deck" },
                { mode: "playroom", tab: "logs", icon: <History size={14} />, label: "Auditoría" },
              ] as const
            ).map((item) => {
              const isActive = viewMode === item.mode && activeTab === item.tab;
              return (
                <button
                  key={`${item.mode}-${item.tab}`}
                  onClick={() => {
                    setViewMode(item.mode);
                    setActiveTab(item.tab);
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-gold text-bg shadow-sm"
                      : "text-muted hover:text-ivory"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= STATS ROW ================= */}
      <RouletteStats drinks={drinks} lastResult={lastResult} />

      {/* ================= BARRA DE DISTRIBUCIÓN POR RAREZA ================= */}
      {activeTab === "main" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rarityStats.map(({ rarity, count, probability }) => (
            <div
              key={rarity}
              className="bg-surface-2 rounded-2xl p-4 border border-border flex items-center justify-between shadow-sm"
            >
              <div>
                <RarityBadge rarity={rarity} size="sm" />
                <p className="text-xl sm:text-2xl font-black text-ivory mt-2">{count}</p>
                <span className="text-xs text-muted font-bold uppercase tracking-wider">
                  tragos en rotación
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-gold">~{probability}%</span>
                <span className="text-xs text-muted block uppercase font-bold">Prob. total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= VIEWS ================= */}
      {activeTab === "logs" ? (
        /* ── AUDITORÍA / LOGS ── */
        <div className="bg-surface-2 rounded-3xl p-6 sm:p-8 border border-border flex flex-col min-h-[600px] shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <History size={22} className="text-gold" />
            <h3 className="text-lg sm:text-xl font-black text-ivory tracking-tight uppercase">
              Historial de Auditoría & Eventos
            </h3>
          </div>
          <div className="flex-1">
            <RouletteLogs logs={logs} />
          </div>
        </div>
      ) : viewMode === "playroom" ? (
        /* ── PLAYROOM / ESCENARIO ── */
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start animate-fadeIn">
          {/* Escenario Central de la Ruleta (7 Cols) */}
          <div className="col-span-12 lg:col-span-7 bg-surface-2 rounded-3xl p-6 sm:p-8 border border-border relative overflow-hidden flex flex-col items-center justify-between min-h-[580px] shadow-xl">
            {/* Header del Escenario */}
            <div className="flex justify-between items-center w-full pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-gold" />
                <span className="text-xs font-black text-ivory uppercase tracking-widest">
                  Escenario Royale Visualizer
                </span>
              </div>
              {spinning ? (
                <div className="px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 text-xs font-black uppercase tracking-wider animate-pulse">
                  Motor Girando...
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-surface-3 text-muted border border-border text-xs font-bold uppercase tracking-wider">
                  En Espera
                </div>
              )}
            </div>

            {/* Rueda Royale */}
            <div className="py-6 flex items-center justify-center w-full">
              <RoulettePreview
                drinks={drinks}
                phase={phase}
                targetAngle={targetAngle}
                onWheelLanded={onWheelLanded}
                revealedResult={revealedResult?.result ?? null}
              />
            </div>

            {/* Barra de Estado Inferior */}
            <div className="w-full p-4 rounded-2xl bg-surface-3 border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-0.5">
                  Estado de la Rueda
                </p>
                <p className="text-sm font-black text-ivory uppercase tracking-tight">
                  {phase === "idle" && "Esperando lanzamiento"}
                  {phase === "launching" && "Iniciando giro..."}
                  {phase === "spinning" && "Seleccionando cóctel ganador..."}
                  {phase === "revealing" && "Frenando en el objetivo..."}
                  {phase === "landing" && "Aterrizando en premio..."}
                  {phase === "revealed" && "¡Premio revelado en pantalla!"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    spinning ? "bg-gold animate-ping" : "bg-emerald animate-pulse"
                  }`}
                />
                <span className="text-xs font-black text-muted uppercase tracking-wider">
                  {spinning ? "En Giro" : "Listo"}
                </span>
              </div>
            </div>
          </div>

          {/* Podio de Resultados & Pool Activo (5 Cols) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            {/* Tarjeta de Ganador */}
            <WinnerCard
              result={revealedResult}
              phase={phase}
              onSpin={actions.spin}
            />

            {/* Pool de Cócteles Activos */}
            <div className="bg-surface-2 rounded-3xl p-6 border border-border flex flex-col max-h-[300px] shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="text-xs font-black text-ivory uppercase tracking-widest">
                  Pool en Rotación
                </span>
                <span className="text-xs text-gold font-bold">
                  {drinks.filter((d) => d && d.active).length} activos
                </span>
              </div>
              <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-1">
                {drinks
                  .filter((d) => d && d.active)
                  .map((drink) => (
                    <div
                      key={drink._id}
                      className="flex justify-between items-center bg-surface-3/60 px-3.5 py-2.5 rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">🍸</span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-ivory uppercase truncate">
                            {drink.name}
                          </p>
                          <p className="text-xs text-muted uppercase">{drink.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <RarityBadge rarity={drink.rarity} size="sm" />
                        <span className="text-xs font-black text-gold">
                          {(drink.probability ?? 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── CONTROL DECK (MATRIZ & LABORATORIO) ── */
        <div className="grid grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Matriz de Probabilidades (8 Cols) */}
          <div className="col-span-12 xl:col-span-8">
            <ProbabilityEngine
              drinks={drinks}
              onUpdate={actions.update}
              onAutoBalance={actions.autoBalance}
              onRemove={actions.remove}
            />
          </div>

          {/* Consola Lateral: Añadir Trago & The Lab (4 Cols) */}
          <div className="col-span-12 xl:col-span-4 space-y-5">
            {/* Tarjeta Rápida: Añadir Trago */}
            <div className="bg-surface-2 rounded-3xl p-6 border border-border shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/20">
                  <LayoutDashboard size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ivory tracking-tight uppercase">
                    Añadir al Pool
                  </h3>
                  <p className="text-xs text-muted">Integrar producto del inventario</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDrinkModal(true)}
                className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-surface-3 hover:bg-surface-4 border-2 border-dashed border-border hover:border-gold/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="p-3 rounded-full bg-gold/10 text-gold group-hover:bg-gold/20 transition-all">
                  <Plus size={24} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-ivory uppercase tracking-wider mb-0.5">
                    Abrir Catálogo de Tragos
                  </p>
                  <p className="text-xs text-muted">Configura peso y rareza</p>
                </div>
              </button>
            </div>

            {/* THE LAB */}
            <div className="bg-surface-2 rounded-3xl border border-border shadow-lg overflow-hidden">
              <button
                onClick={() => setShowTheLab((v) => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-surface-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/20">
                    <Zap size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-ivory tracking-tight uppercase">
                      The <span className="text-gold">Lab</span>
                    </h3>
                    <p className="text-xs text-muted">
                      Fader Mixer · Smart Presets · Pity Vault
                    </p>
                  </div>
                </div>
                <span className={`text-muted text-xs transition-transform duration-300 ${showTheLab ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {showTheLab && (
                <div className="p-4 space-y-4 border-t border-border bg-surface-2/60 animate-fadeIn">
                  <FaderMixer drinks={drinks} onUpdate={actions.update} />
                  <SmartPresets
                    drinks={drinks}
                    onUpdate={actions.update}
                    onAutoBalance={actions.autoBalance}
                  />
                  <PityVault />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial */}
      <RouletteTutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* Modal Añadir Trago */}
      {showAddDrinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-surface-2 border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-3/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold border border-gold/20">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-ivory tracking-tight uppercase">
                    Añadir Trago a la Ruleta
                  </h2>
                  <p className="text-xs text-muted">Inventario POS del Sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDrinkModal(false)}
                className="p-2 rounded-xl bg-surface-3 hover:bg-surface-4 text-muted hover:text-ivory border border-border transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <ProductSelector
                onSelect={async (product, config) => {
                  const result = await actions.create({
                    name: product.name,
                    weight: config.weight,
                    color: "#F0B429",
                    category: "general",
                    rarity: config.rarity,
                    product: product._id,
                  });
                  if (result.success) {
                    setShowAddDrinkModal(false);
                    success("Trago Añadido", `${product.name} fue integrado a la ruleta exitosamente.`);
                  } else {
                    const msgs: Record<string, string> = {
                      duplicate: `El trago "${product.name}" ya se encuentra configurado en la ruleta`,
                      missing_name: "El nombre del trago es requerido",
                      invalid_weight: "El peso debe estar entre 1 y 100",
                    };
                    error("Error", msgs[result.error ?? ""] ?? `No se pudo añadir: ${result.error}`);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toasts de Notificación */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
