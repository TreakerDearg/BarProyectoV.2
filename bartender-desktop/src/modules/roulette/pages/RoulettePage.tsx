"use client";

import { useRoulette } from "../hooks/useRoulette";
import { useToast } from "../hooks/useToast";
import RoulettePreview from "../components/RoulettePreview/RoulettePreview";
import ProductSelector from "../components/ProductSelector";
import RouletteLogs from "../components/RouletteLogs";
import RouletteStats from "../components/RouletteStats";
import ProbabilityEngine from "../components/ProbabilityEngine";
import PityTrackerPanel from "../components/PityTrackerPanel";
import RarityBadge from "../components/RarityBadge";
import RouletteTutorial from "../components/RouletteTutorial";
import ToastContainer from "../components/ToastNotification";
import RecipeQuickView from "../components/RecipeQuickView";

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
  FlaskConical,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function RoulettePage() {
  const {
    drinks,
    loading,
    spinning,
    lastResult,
    logs,
    actions,
  } = useRoulette();

  const { toasts, removeToast, success, error } = useToast();

  const [viewMode, setViewMode] = useState<"playroom" | "control">("playroom");
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "logs" | "pity">("main");
  const [showAddDrinkModal, setShowAddDrinkModal] = useState(false);

  // Estadísticas por rareza para el Playroom
  const rarityStats = useMemo(() => {
    const active = drinks.filter((d) => d && d.active);
    const totalW = active.reduce((s, d) => s + (d.weight || 0), 0) || 1;
    const tiers = ["COMMON", "RARE", "EPIC", "LEGENDARY"] as const;
    return tiers.map((r) => {
      const group = active.filter((d) => d.rarity === r);
      const prob  = group.reduce((s, d) => s + (d.weight || 0), 0) / totalW * 100;
      return { rarity: r, count: group.length, probability: +prob.toFixed(1) };
    });
  }, [drinks]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
        <p className="text-[10px] font-black text-gold uppercase tracking-[0.5em] animate-pulse">Iniciando Smart Roulette Engine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-fade-in p-2 md:p-8">

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
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Sync Active</span>
          </div>
        </div>

        <button
          onClick={() => setShowTutorial(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl border border-gold/20 transition-all text-[9px] font-black uppercase tracking-widest"
        >
          <BookOpen size={14} />
          Tutorial
        </button>

        {/* View Toggle */}
        <div className="flex bg-surface-3/30 p-1.5 rounded-2xl border border-white/5 w-full xl:w-auto overflow-x-auto">
          {(
            [
              { mode: "playroom", tab: "main",  icon: <Tv size={12} />,             label: "Playroom Mode" },
              { mode: "control",  tab: "main",  icon: <SlidersHorizontal size={12} />, label: "Control Deck" },
              { mode: "playroom", tab: "logs",  icon: <History size={12} />,         label: "Logs"         },
              { mode: "playroom", tab: "pity",  icon: <Zap size={12} />,             label: "Pity Tracker" },
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
            <div key={rarity} className="glass-royale rounded-2xl p-4 border border-white/5 flex flex-col gap-1">
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
            <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Historial de Actividad</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            <RouletteLogs logs={logs} />
          </div>
        </div>
      ) : activeTab === "pity" ? (
        <div className="glass-royale rounded-[3rem] p-10 border border-white/5 animate-fadeIn">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <Zap size={20} className="text-gold" />
            <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Sistema de Pity</h3>
          </div>
          <PityTrackerPanel />
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
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Live Royale Visualizer</span>
              </div>
              {spinning && (
                <div className="px-4 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20 text-[8px] font-black uppercase tracking-widest animate-pulse">
                  MOTOR GIRANDO
                </div>
              )}
            </div>
            <div className="relative mt-8 transform hover:scale-102 transition-transform duration-700">
              <RoulettePreview drinks={drinks} result={lastResult?.result} spinning={spinning} />
            </div>
            <div className="mt-8 w-full max-w-md p-6 rounded-2xl bg-surface-3/20 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Estado de la Ruleta</p>
                <p className="text-sm font-black text-ivory uppercase tracking-tighter">
                  {spinning ? "Seleccionando trago..." : "Esperando lanzamiento"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${spinning ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
                <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                  {spinning ? "Active" : "Ready"}
                </span>
              </div>
            </div>
          </div>

          {/* Resultados + receta */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">

            {/* Último ganador */}
            <div className="glass-royale rounded-[3.5rem] p-8 border border-white/5 flex-1 flex flex-col justify-between relative overflow-hidden min-h-[280px]">
              <div className="absolute -right-10 -top-10 text-[100px] font-black text-white/5 pointer-events-none select-none uppercase tracking-tighter">ROYALE</div>
              <div>
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] block mb-5">ÚLTIMO GANADOR</span>
                {lastResult && !spinning ? (
                  <div className="animate-fade-in space-y-5">
                    <div className="flex items-center gap-5">
                      {/* Imagen del producto si existe */}
                      {lastResult.result.product && typeof lastResult.result.product === "object" && lastResult.result.product.image ? (
                        <img
                          src={lastResult.result.product.image}
                          alt={lastResult.result.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-gold/20"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gold flex items-center justify-center text-3xl shadow-gold-glow animate-bounce-subtle">
                          🍸
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <RarityBadge rarity={lastResult.result.rarity} size="lg" />
                          <span className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">{lastResult.result.category}</span>
                        </div>
                        <h2 className="text-2xl font-black text-ivory tracking-tighter uppercase leading-tight capitalize">{lastResult.result.name}</h2>
                        {lastResult.result.product && typeof lastResult.result.product === "object" && lastResult.result.product.description && (
                          <p className="text-[9px] text-muted mt-1 line-clamp-2">{lastResult.result.product.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">PROBABILIDAD</p>
                        <span className="text-2xl font-black text-grad-gold tracking-tighter">{(lastResult.result.probability || 0).toFixed(1)}%</span>
                      </div>
                      <div>
                        <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">TIRADAS</p>
                        <span className="text-lg font-black text-ivory tracking-tight">{lastResult.result.totalSpins || 0}</span>
                      </div>
                      {lastResult.result.product && typeof lastResult.result.product === "object" && lastResult.result.product.dynamicPrice != null && (
                        <div>
                          <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">PRECIO</p>
                          <span className="text-lg font-black text-ivory tracking-tight">
                            ${lastResult.result.product.dynamicPrice.toLocaleString("es-AR")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl text-muted/40 mb-3 border border-white/5">🎰</div>
                    <h3 className="text-xs font-black text-muted uppercase tracking-widest">Sin resultados aún</h3>
                    <p className="text-[9px] text-muted/50 uppercase tracking-wider mt-2 max-w-[220px]">
                      Lanzá la ruleta para ver el ganador
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={actions.spin}
                  disabled={spinning}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] bg-grad-gold text-bg shadow-gold-glow hover:scale-102 active:scale-98 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
                >
                  <Zap size={18} className={spinning ? "animate-spin" : ""} />
                  {spinning ? "GIRANDO LA RULETA..." : "LANZAR RULETA"}
                </button>
              </div>
            </div>

            {/* Receta del último ganador */}
            {lastResult?.result?.recipe && !spinning && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <FlaskConical size={13} className="text-gold/60" />
                  <span className="text-[9px] font-black text-muted uppercase tracking-widest">Receta del trago ganador</span>
                </div>
                <RecipeQuickView
                  recipe={lastResult.result.recipe}
                  drinkName={lastResult.result.name}
                  defaultOpen
                />
              </div>
            )}

            {/* Pool de tragos activos */}
            <div className="glass-royale rounded-[3rem] p-7 border border-white/5 max-h-[260px] overflow-hidden flex flex-col">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] block mb-3">POOL ACTIVO</span>
              <div className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
                {drinks.filter((d) => d && d.active).map((drink) => (
                  <div key={drink._id} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm flex-shrink-0">🍸</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-ivory uppercase tracking-tight truncate capitalize">{drink.name}</p>
                        <p className="text-[8px] text-muted uppercase tracking-widest">{drink.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <RarityBadge rarity={drink.rarity} size="sm" />
                      <span className="text-[10px] font-black text-grad-gold">{(drink.probability ?? 0).toFixed(1)}%</span>
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
          <div className="col-span-12 xl:col-span-9 space-y-6">
            <ProbabilityEngine
              drinks={drinks}
              onUpdate={actions.update}
              onAutoBalance={actions.autoBalance}
              onRemove={actions.remove}
            />
          </div>
          <div className="col-span-12 xl:col-span-3">
            <div className="glass-royale rounded-[2.5rem] p-8 border border-white/5 animate-fade-in h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <LayoutDashboard size={18} className="text-gold" />
                <div>
                  <h3 className="text-lg font-black text-ivory tracking-tighter uppercase">Añadir Trago</h3>
                  <p className="text-[8px] text-muted uppercase tracking-[0.2em] mt-1">Inventario POS</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDrinkModal(true)}
                className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-gold/10 hover:bg-gold/20 border-2 border-dashed border-gold/30 hover:border-gold/50 rounded-2xl transition-all group"
              >
                <div className="p-4 rounded-full bg-gold/20 group-hover:bg-gold/30 transition-all">
                  <Plus size={32} className="text-gold" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-ivory uppercase tracking-tight mb-1">Abrir Selector</p>
                  <p className="text-[8px] text-muted uppercase tracking-widest">Busca y añade tragos</p>
                </div>
              </button>
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
                  <h2 className="text-lg font-black text-ivory tracking-tighter uppercase">Añadir Trago</h2>
                  <p className="text-[9px] text-muted uppercase tracking-[0.2em] mt-0.5">Inventario POS</p>
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

