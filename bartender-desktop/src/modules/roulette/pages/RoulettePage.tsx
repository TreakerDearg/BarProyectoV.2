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
    // SpinPhase
    phase,
    revealedResult,
    targetAngle,
    onWheelLanded,
    // Backward compat
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

      const loop = (now: number) => {
        const elapsed = (now - spinStartTimeRef.current) / 1000;

        // Linear decay: speed starts at 1 and drops to 0.1 over 8s
        const speed = Math.max(0.1, 1 - elapsed / 8);

        // Tick every ~(120ms at full speed) → ~(600ms at slow speed)
        const interval = 0.06 + (1 - speed) * 0.5;

        // Throttle by accumulating elapsed time
        if (!tickRafRef.current) {
          playTick(speed);
        }

        tickRafRef.current = requestAnimationFrame(loop);
      };

      // Start loop — use a simple interval approach for tick frequency
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

  // Estadísticas por rareza para el Playroom
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
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gold uppercase tracking-[0.5em] animate-pulse">
          Iniciando Smart Roulette Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in p-2 md:p-8">

      {/* ================= JACKPOT BANNER ================= */}
      <JackpotBanner
        visible={!!jackpot}
        drinkName={jackpot?.drinkName ?? ""}
        onClose={() => setJackpot(null)}
      />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-gold/10 text-gold shadow-gold-glow">
              <Shuffle size={24} />
            </div>
            <h1 className="text-4xl font-black text-ivory tracking-tighter uppercase">
              Roulette <span className="text-grad-gold">Engine</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.5em]">
              Operational Gamification Protocol v5.1
            </p>
            <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
              Live Sync Active
            </span>
          </div>
        </div>

        {/* Mute toggle + Tutorial */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="flex items-center gap-2 px-4 py-2 bg-surface-3/50 hover:bg-surface-3 text-muted hover:text-ivory rounded-xl border border-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX size={14} className="text-muted" /> : <Volume2 size={14} className="text-gold" />}
            {isMuted ? "Muted" : "Sound"}
          </button>

          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl border border-gold/20 transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <BookOpen size={14} />
            Tutorial
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-surface-3/30 p-1.5 rounded-2xl border border-white/5 w-full xl:w-auto overflow-x-auto">
          {(
            [
              { mode: "playroom", tab: "main",  icon: <Tv size={12} />,               label: "Playroom Mode" },
              { mode: "control",  tab: "main",  icon: <SlidersHorizontal size={12} />, label: "Control Deck" },
              { mode: "playroom", tab: "logs",  icon: <History size={12} />,           label: "Logs"         },
            ] as const
          ).map((item) => {
            const isActive = viewMode === item.mode && activeTab === item.tab;
            return (
              <button
                key={`${item.mode}-${item.tab}`}
                onClick={() => { setViewMode(item.mode); setActiveTab(item.tab); }}
                className={`flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gold/15 text-gold border border-gold/10 shadow-gold-glow/5"
                    : "text-muted hover:text-ivory"
                }`}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= STATS ROW ================= */}
      <RouletteStats drinks={drinks} lastResult={lastResult} />

      {/* ================= RARITY DISTRIBUTION BAR ================= */}
      {activeTab === "main" && (
        <div className="grid grid-cols-4 gap-3">
          {rarityStats.map(({ rarity, count, probability }) => (
            <div
              key={rarity}
              className="glass-royale rounded-2xl p-4 border border-white/5 flex flex-col gap-1"
            >
              <RarityBadge rarity={rarity} size="sm" />
              <p className="text-xl font-black text-ivory mt-1">{count}</p>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-muted font-black uppercase tracking-widest">tragos</span>
                <span className="text-[9px] font-black text-gold/70">~{probability}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= VIEWS ================= */}
      {activeTab === "logs" ? (
        <div className="glass-royale rounded-[3rem] p-10 border border-white/5 flex flex-col min-h-[600px] animate-fadeIn">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <History size={20} className="text-gold" />
            <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">
              Historial de Actividad
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            <RouletteLogs logs={logs} />
          </div>
        </div>
      ) : viewMode === "playroom" ? (
        /* ── PLAYROOM ── */
        <div className="grid grid-cols-12 gap-8 items-stretch animate-fadeIn">

          {/* Rueda visual */}
          <div className="col-span-12 lg:col-span-7 glass-royale rounded-[3.5rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-center w-full mb-8 absolute top-8 left-0 px-10">
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-gold" />
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">
                  Live Royale Visualizer
                </span>
              </div>
              {spinning && (
                <div className="px-4 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-[8px] font-black uppercase tracking-widest animate-pulse">
                  MOTOR GIRANDO
                </div>
              )}
            </div>
            <div className="relative mt-8 transform hover:scale-102 transition-transform duration-700">
              <RoulettePreview
                drinks={drinks}
                phase={phase}
                targetAngle={targetAngle}
                onWheelLanded={onWheelLanded}
                revealedResult={revealedResult?.result ?? null}
              />
            </div>
            <div className="mt-8 w-full max-w-md p-6 rounded-2xl bg-surface-3/20 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">
                  Estado de la Ruleta
                </p>
                <p className="text-sm font-black text-ivory uppercase tracking-tighter">
                  {phase === "idle"      && "Esperando lanzamiento"}
                  {phase === "launching" && "Iniciando..."}
                  {phase === "spinning"  && "Seleccionando trago..."}
                  {phase === "revealing" && "Determinando ganador..."}
                  {phase === "landing"   && "Aterrizando..."}
                  {phase === "revealed"  && "¡Ganador revelado!"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    spinning ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                  {spinning ? "Active" : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Resultados + receta */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">

            {/* Último ganador */}
            <WinnerCard
              result={revealedResult}
              phase={phase}
              onSpin={actions.spin}
            />

            {/* Pool de tragos activos */}
            <div className="glass-royale rounded-[3rem] p-7 border border-white/5 max-h-[260px] overflow-hidden flex flex-col">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] block mb-3">
                POOL ACTIVO
              </span>
              <div className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
                {drinks.filter((d) => d && d.active).map((drink) => (
                  <div
                    key={drink._id}
                    className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm flex-shrink-0">🍸</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-ivory uppercase tracking-tight truncate capitalize">
                          {drink.name}
                        </p>
                        <p className="text-[8px] text-muted uppercase tracking-widest">{drink.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <RarityBadge rarity={drink.rarity} size="sm" />
                      <span className="text-[10px] font-black text-grad-gold">
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
        /* ── CONTROL DECK ── */
        <div className="grid grid-cols-12 gap-6 animate-fadeIn">
          <div className="col-span-12 xl:col-span-8 space-y-6">
            <ProbabilityEngine
              drinks={drinks}
              onUpdate={actions.update}
              onAutoBalance={actions.autoBalance}
              onRemove={actions.remove}
            />
          </div>
          <div className="col-span-12 xl:col-span-4 space-y-4">
            {/* Add Drink button */}
            <div className="glass-royale rounded-[2.5rem] p-6 border border-white/5 animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <LayoutDashboard size={18} className="text-gold" />
                <div>
                  <h3 className="text-base font-black text-ivory tracking-tighter uppercase">
                    Añadir Trago
                  </h3>
                  <p className="text-[8px] text-muted uppercase tracking-[0.2em] mt-1">Inventario POS</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDrinkModal(true)}
                className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-gold/10 hover:bg-gold/20 border-2 border-dashed border-gold/30 hover:border-gold/50 rounded-2xl transition-all group"
              >
                <div className="p-3 rounded-full bg-gold/20 group-hover:bg-gold/30 transition-all">
                  <Plus size={24} className="text-gold" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-ivory uppercase tracking-tight mb-1">
                    Abrir Selector
                  </p>
                  <p className="text-[8px] text-muted uppercase tracking-widest">Busca y añade tragos</p>
                </div>
              </button>
            </div>

            {/* THE LAB collapsible section */}
            <div className="glass-royale rounded-[2.5rem] border border-white/5 overflow-hidden">
              <button
                onClick={() => setShowTheLab((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gold/10 text-gold">
                    <Zap size={16} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-ivory tracking-tighter uppercase">
                      The <span className="text-grad-gold">Lab</span>
                    </h3>
                    <p className="text-[8px] text-muted uppercase tracking-[0.3em] mt-0.5">
                      Fader · Presets · Pity
                    </p>
                  </div>
                </div>
                <span className={`text-muted transition-transform duration-300 ${showTheLab ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {showTheLab && (
                <div className="px-4 pb-4 space-y-4 animate-fadeIn border-t border-white/5 pt-4">
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

      {/* Add Drink Modal */}
      {showAddDrinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-gold/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gold/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gold/10 text-gold">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-ivory tracking-tighter uppercase">
                    Añadir Trago
                  </h2>
                  <p className="text-[9px] text-muted uppercase tracking-[0.2em] mt-0.5">
                    Inventario POS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDrinkModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-ivory transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <ProductSelector
                onSelect={async (product, config) => {
                  const result = await actions.create({
                    name:     product.name,
                    weight:   config.weight,
                    color:    "#D4A340",
                    category: "general",
                    rarity:   config.rarity,
                    product:  product._id,
                  });
                  if (result.success) {
                    setShowAddDrinkModal(false);
                    success("Trago Añadido", `${product.name} ha sido añadido a la ruleta`);
                  } else {
                    const msgs: Record<string, string> = {
                      duplicate:      `El trago "${product.name}" ya está en la ruleta`,
                      missing_name:   "El nombre del trago es requerido",
                      invalid_weight: "El peso debe estar entre 1 y 1000",
                    };
                    error("Error", msgs[result.error ?? ""] ?? `No se pudo añadir: ${result.error}`);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
