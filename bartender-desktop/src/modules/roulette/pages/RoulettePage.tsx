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
  Plus
} from "lucide-react";
import { useState } from "react";

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
               Operational Gamification Protocol v5.0
             </p>
             <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Live Sync Active</span>
          </div>
        </div>

        {/* Tutorial Button */}
        <button
          onClick={() => setShowTutorial(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl border border-gold/20 transition-all text-[9px] font-black uppercase tracking-widest"
        >
          <BookOpen size={14} />
          Tutorial
        </button>

        {/* Premium View Toggle Switcher */}
        <div className="flex bg-surface-3/30 p-1.5 rounded-2xl border border-white/5 w-full xl:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setViewMode("playroom");
              setActiveTab("main");
            }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              viewMode === "playroom" && activeTab === "main"
                ? "bg-gold/15 text-gold border border-gold/10 shadow-gold-glow/5" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <Tv size={12} /> Playroom Mode
          </button>
          <button
            onClick={() => {
              setViewMode("control");
              setActiveTab("main");
            }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              viewMode === "control" && activeTab === "main"
                ? "bg-gold/15 text-gold border border-gold/10 shadow-gold-glow/5" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <SlidersHorizontal size={12} /> Control Deck
          </button>
          <button
            onClick={() => {
              setActiveTab("logs");
              setViewMode("playroom");
            }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "logs" 
                ? "bg-gold/15 text-gold border border-gold/10 shadow-gold-glow/5" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <History size={12} /> Logs
          </button>
          <button
            onClick={() => {
              setActiveTab("pity");
              setViewMode("playroom");
            }}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === "pity" 
                ? "bg-gold/15 text-gold border border-gold/10 shadow-gold-glow/5" 
                : "text-muted hover:text-ivory"
            }`}
          >
            <Zap size={12} /> Pity Tracker
          </button>
        </div>
      </div>

      {/* ================= STATS ROW ================= */}
      <RouletteStats
        drinks={drinks}
        lastResult={lastResult}
      />

      {/* ================= DUAL VIEW MODES ================= */}
      {activeTab === "logs" ? (
        /* LOGS VIEW: Solo muestra logs para reducir sobrecarga */
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
        /* PITY TRACKER VIEW: Solo muestra pity tracker */
        <div className="glass-royale rounded-[3rem] p-10 border border-white/5 animate-fadeIn">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
            <Zap size={20} className="text-gold" />
            <h3 className="text-xl font-black text-ivory tracking-tighter uppercase">Sistema de Pity</h3>
          </div>
          <PityTrackerPanel />
        </div>
      ) : viewMode === "playroom" ? (
        /* PLAYROOM MODE: CENTRADA, ENFOCADA EN LA RULETA E INTERACTIVA */
        <div className="grid grid-cols-12 gap-8 items-stretch animate-fadeIn">
          
          {/* Visual Roulette Wheel Card */}
          <div className="col-span-12 lg:col-span-7 glass-royale rounded-[3.5rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
            {/* Ambient gold glow */}
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
               <RoulettePreview
                 drinks={drinks}
                 result={lastResult?.result}
                 spinning={spinning}
               />
            </div>

            <div className="mt-8 w-full max-w-md p-6 rounded-2xl bg-surface-3/20 border border-white/5 flex items-center justify-between">
               <div>
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Estado de la Ruleta</p>
                  <p className="text-sm font-black text-ivory uppercase tracking-tighter">
                    {spinning ? 'Seleccionando trago...' : 'Esperando lanzamiento'}
                  </p>
               </div>
               <div className="flex items-center gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${spinning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                 <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                   {spinning ? 'Active' : 'Ready'}
                 </span>
               </div>
            </div>
          </div>

          {/* Winner and Action Card */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
            
            {/* Last Winner Banner */}
            <div className="glass-royale rounded-[3.5rem] p-10 border border-white/5 flex-1 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
              <div className="absolute -right-10 -top-10 text-[100px] font-black text-white/5 pointer-events-none select-none uppercase tracking-tighter">ROYALE</div>
              
              <div>
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] block mb-6">ÚLTIMO GANADOR</span>
                
                {lastResult && !spinning ? (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-gold flex items-center justify-center text-4xl shadow-gold-glow animate-bounce-subtle">
                         🍸
                      </div>
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <RarityBadge rarity={lastResult.result.rarity} size="lg" />
                            <span className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">{lastResult.result.category}</span>
                         </div>
                         <h2 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-tight">{lastResult.result.name}</h2>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <div>
                        <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">PROBABILIDAD DE DROP</p>
                        <span className="text-3xl font-black text-grad-gold tracking-tighter">{(lastResult.result.probability || 0).toFixed(1)}%</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-muted font-black uppercase tracking-widest mb-1">TIRADAS REGISTRADAS</p>
                        <span className="text-lg font-black text-ivory tracking-tight">{lastResult.result.totalSpins || 0} veces</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl text-muted/40 mb-4 border border-white/5">
                      🎰
                    </div>
                    <h3 className="text-xs font-black text-muted uppercase tracking-widest">A la espera de un lanzamiento</h3>
                    <p className="text-[9px] text-muted/50 uppercase tracking-wider mt-2 max-w-[250px]">
                      ¡Pulsa el botón de abajo para hacer girar la ruleta y conseguir un premio especial!
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/5">
                <button
                  onClick={actions.spin}
                  disabled={spinning}
                  className="w-full flex items-center justify-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] bg-grad-gold text-bg shadow-gold-glow hover:scale-102 active:scale-98 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer animate-pulse-subtle"
                >
                  <Zap size={18} className={spinning ? 'animate-spin' : ''} />
                  {spinning ? "GIRANDO LA RULETA..." : "LANZAR RULETA"}
                </button>
              </div>
            </div>

            {/* List of Available Items */}
            <div className="glass-royale rounded-[3.5rem] p-10 border border-white/5 flex-1 flex flex-col justify-between max-h-[300px]">
              <div>
                <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] block mb-4">RECOMPENSAS EN EL POOL</span>
                <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {drinks.filter(d => d && d.active).map(drink => (
                    <div key={drink._id} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-base">🍸</span>
                        <div>
                          <p className="text-[10px] font-black text-ivory uppercase tracking-tight">{drink.name}</p>
                          <p className="text-[8px] text-muted uppercase tracking-widest mt-0.5">{drink.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <RarityBadge rarity={drink.rarity} size="sm" />
                        <span className="text-[10px] font-black text-grad-gold">{(drink.probability ?? 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* CONTROL DECK MODE: COMPLETO CONTROL DE PESOS, CRUD DE INVENTARIO Y SIMULACIONES */
        <div className="grid grid-cols-12 gap-6 animate-fadeIn">
          
          {/* Left Column: Main engine settings */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            <ProbabilityEngine
              drinks={drinks}
              onUpdate={actions.update}
              onAutoBalance={actions.autoBalance}
              onRemove={actions.remove}
            />
          </div>

          {/* Right Column: Inventory panel */}
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

      {/* Tutorial Modal */}
      <RouletteTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />

      {/* Add Drink Modal */}
      {showAddDrinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-gold/20 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
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

            {/* Content */}
            <div className="p-6">
              <ProductSelector
                onSelect={async (product, config) => {
                  const result = await actions.create({
                    name: product.name,
                    weight: config.weight,
                    color: "#D4A340",
                    category: "general",
                    rarity: config.rarity,
                    product: product._id
                  });
                  
                  if (result.success) {
                    setShowAddDrinkModal(false);
                    success("Trago Añadido", `${product.name} ha sido añadido a la ruleta`);
                  } else {
                    if (result.error === "duplicate") {
                      error("Error", `El trago "${product.name}" ya está en la ruleta`);
                    } else if (result.error === "missing_name") {
                      error("Error", "El nombre del trago es requerido");
                    } else if (result.error === "invalid_weight") {
                      error("Error", "El peso debe estar entre 1 y 1000");
                    } else {
                      error("Error", `No se pudo añadir el trago: ${result.error}`);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

    </div>
  );
}