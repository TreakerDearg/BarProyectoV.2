"use client";

import { useRoulette } from "../hooks/useRoulette";
import RoulettePreview from "../components/RoulettePreview/RoulettePreview";
import ProductSelector from "../components/ProductSelector";
import RouletteLogs from "../components/RouletteLogs";
import RouletteStats from "../components/RouletteStats";
import ProbabilityEngine from "../components/ProbabilityEngine";
import RarityBadge from "../components/RarityBadge";

import { 
  Shuffle, 
  Zap, 
  Settings2, 
  History, 
  LayoutDashboard,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function RoulettePage() {
  const {
    drinks,
    loading,
    spinning,
    lastResult,
    totalWeight,
    logs,
    actions,
  } = useRoulette();

  const [showConfig, setShowConfig] = useState(false);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
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
               Operational Gamification Protocol v5.0
             </p>
             <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Sync Active</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowConfig(!showConfig)}
             className={`p-4 rounded-2xl border transition-all ${showConfig ? 'bg-gold text-bg border-gold shadow-gold-glow' : 'bg-surface-3/30 border-white/5 text-muted hover:text-ivory'}`}
           >
              <Settings2 size={20} />
           </button>
           <button
             onClick={actions.spin}
             disabled={spinning}
             className="flex items-center gap-4 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-grad-gold text-bg shadow-gold-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
           >
             <Zap size={18} className={spinning ? 'animate-bounce' : ''} />
             {spinning ? "Spining..." : "Ejecutar Spin"}
           </button>
        </div>
      </div>

      {/* ================= STATS ROW ================= */}
      <RouletteStats
        drinks={drinks}
        lastResult={lastResult}
        totalWeight={totalWeight}
      />

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* PANEL IZQUIERDO: CONFIGURACIÓN Y PROBABILIDADES */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
           
           {/* WINNER HIGHLIGHT (Si hay resultado) */}
           {lastResult && !spinning && (
              <div className="glass-royale rounded-[3rem] p-10 border border-gold/30 bg-gold/5 animate-bounce-subtle flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-gold-glow/10">
                 <div className="absolute -left-10 -top-10 text-[120px] font-black text-gold/5 pointer-events-none select-none uppercase tracking-tighter">WINNER</div>
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-[2rem] bg-gold flex items-center justify-center text-5xl shadow-gold-glow">
                       🍸
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <RarityBadge rarity={lastResult.result.rarity} size="lg" />
                          <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">{lastResult.result.category}</span>
                       </div>
                       <h2 className="text-4xl font-black text-ivory tracking-tighter uppercase">{lastResult.result.name}</h2>
                       <p className="text-xs font-black text-gold uppercase tracking-[0.2em] mt-2">Premio desbloqueado con éxito</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-2 relative z-10">
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">Probabilidad de Drop</span>
                    <span className="text-4xl font-black text-grad-gold tracking-tighter">{(lastResult.result.probability || 0).toFixed(1)}%</span>
                 </div>
              </div>
           )}

           <ProbabilityEngine
             drinks={drinks}
             onUpdate={actions.update}
             onAutoBalance={actions.autoBalance}
           />

           {showConfig && (
              <div className="glass-royale rounded-[3rem] p-10 border border-white/5 animate-fade-in">
                 <div className="flex items-center gap-4 mb-8">
                    <LayoutDashboard size={20} className="text-gold" />
                    <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Gestión de Inventario de Ruleta</h3>
                 </div>
                 <ProductSelector
                   onSelect={(product) =>
                     actions.create({
                       name: product.name,
                       weight: 10,
                       color: "#D4A340",
                       category: "general",
                       rarity: "COMMON",
                       product: product._id
                     })
                   }
                 />
              </div>
           )}
        </div>

        {/* PANEL DERECHO: VISUAL Y LOGS */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           
           {/* ROULETTE VISUAL PREVIEW */}
           <div className="glass-royale rounded-[3rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-10">
                 <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-gold" />
                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.4em]">Engine Preview Visualizer</span>
                 </div>
                 {spinning && (
                    <div className="px-4 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 text-[8px] font-black uppercase tracking-widest animate-pulse">
                       MOTOR ACTIVO
                    </div>
                 )}
              </div>

              <div className="relative">
                 <RoulettePreview
                   drinks={drinks}
                   result={lastResult?.result}
                   spinning={spinning}
                 />
              </div>

              <div className="mt-10 w-full p-6 rounded-[2rem] bg-surface-3/30 border border-white/5 flex items-center justify-between">
                 <div>
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-ivory uppercase tracking-tighter">{spinning ? 'Simulating...' : 'Awaiting Execution'}</p>
                 </div>
                 <ChevronRight size={20} className="text-gold" />
              </div>
           </div>

           {/* LOGS DE ACTIVIDAD */}
           <div className="glass-royale rounded-[3rem] p-10 border border-white/5 flex-1 min-h-[500px]">
              <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                 <History size={20} className="text-gold" />
                 <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Protocol Logs</h3>
              </div>
              <RouletteLogs logs={logs} />
           </div>

        </div>

      </div>

    </div>
  );
}