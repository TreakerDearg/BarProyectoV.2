"use client";

import { Wand2, Sparkles, TrendingUp, Filter, Settings2 } from "lucide-react";
import type { RouletteDrink, RouletteRarity } from "../types/roulette";
import RarityBadge from "./RarityBadge";

interface Props {
  drinks: RouletteDrink[];
  onUpdate: (id: string, data: Partial<RouletteDrink>) => void;
  onAutoBalance: (mode: "equal" | "smooth" | "smart") => void;
}

export default function ProbabilityEngine({
  drinks,
  onUpdate,
  onAutoBalance,
}: Props) {
  const maxWeight = Math.max(...drinks.map((d) => d.weight || 1), 1);

  return (
    <div className="relative glass-royale border border-white/5 rounded-[2.5rem] p-10 shadow-royale overflow-hidden">
      
      {/* GLOW DE FONDO */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-ivory tracking-tighter uppercase flex items-center gap-4">
            <TrendingUp size={24} className="text-gold" />
            Probability <span className="text-grad-gold">Engine</span>
          </h2>
          <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mt-1">
            Sistema Adaptativo de Pesos y Rarezas
          </p>
        </div>

        <div className="flex bg-surface-3/30 p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => onAutoBalance("smart")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest text-gold hover:bg-gold/10 transition-all"
          >
            <Wand2 size={14} /> SMART
          </button>
          <button
            onClick={() => onAutoBalance("smooth")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest text-emerald-400 hover:bg-emerald-400/10 transition-all"
          >
            SMOOTH
          </button>
          <button
            onClick={() => onAutoBalance("equal")}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest text-muted hover:bg-white/5 transition-all"
          >
            EQUAL
          </button>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-6 custom-scrollbar relative z-10">
        {drinks.map((drink) => {
          const percent = drink.probability ?? 0;
          const dominance = drink.weight / maxWeight;
          const isDominant = dominance > 0.75;

          return (
            <div
              key={drink._id}
              className={`
                group relative p-8 rounded-3xl border transition-all duration-500
                bg-surface-3/20
                ${
                  drink.active
                    ? "border-white/5 hover:border-white/10 hover:bg-surface-3/40"
                    : "border-gray-900 opacity-30 grayscale"
                }
                ${isDominant && drink.active ? "border-gold/20 shadow-gold-glow/5" : ""}
              `}
            >
              {/* HEADER DE ITEM */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-surface-3 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      🍸
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-ivory tracking-tighter uppercase group-hover:text-gold transition-colors">
                        {drink.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                         <RarityBadge rarity={drink.rarity} size="sm" />
                         <span className="text-[9px] text-muted font-black uppercase tracking-widest">
                           {drink.category}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-4">
                      <select 
                        value={drink.rarity}
                        onChange={(e) => onUpdate(drink._id, { rarity: e.target.value as RouletteRarity })}
                        className="bg-surface-3 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-black text-ivory uppercase tracking-widest focus:outline-none focus:border-gold/50"
                      >
                         <option value="COMMON">Common</option>
                         <option value="RARE">Rare</option>
                         <option value="EPIC">Epic</option>
                         <option value="LEGENDARY">Legendary</option>
                      </select>
                      <div className="flex flex-col items-end">
                         <span className="text-2xl font-black text-grad-gold tracking-tighter leading-none">
                            {percent.toFixed(1)}%
                         </span>
                         <span className="text-[8px] text-muted font-black uppercase tracking-widest mt-1">PROBABILIDAD</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* CONTROL DE PESO */}
              <div className="flex items-center gap-6">
                 <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-4">
                       <span className="text-[8px] font-black text-muted uppercase tracking-widest">Peso: {drink.weight}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={drink.weight}
                      onChange={(e) => onUpdate(drink._id, { weight: Number(e.target.value) })}
                      className="premium-slider w-full"
                    />
                 </div>
                 <button 
                  onClick={() => onUpdate(drink._id, { active: !drink.active })}
                  className={`p-3 rounded-xl border transition-all ${drink.active ? 'border-emerald-400/20 text-emerald-400 bg-emerald-400/5' : 'border-red/20 text-red bg-red/5'}`}
                 >
                    <Settings2 size={16} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex justify-between items-center mt-10 pt-10 border-t border-white/5 relative z-10">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-emerald-400/50" />
            <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Engine v4.5 • Operational Intelligence Active</span>
         </div>
         <div className="bg-emerald-400/10 text-emerald-400 px-6 py-2 rounded-full border border-emerald-400/20 text-[10px] font-black tracking-widest">
            STABLE 100%
         </div>
      </div>
    </div>
  );
}