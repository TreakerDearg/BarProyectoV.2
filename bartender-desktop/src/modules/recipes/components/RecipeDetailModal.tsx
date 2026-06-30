"use client";

import {
  X,
  Martini,
  Utensils,
  Zap,
  CheckCircle2,
  Activity,
  Box,
  TrendingUp,
  Edit
} from "lucide-react";
import type { Recipe } from "../types/recipe";

interface Props {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (recipe: Recipe) => void;
}

export default function RecipeDetailModal({
  recipe,
  open,
  onClose,
  onEdit,
}: Props) {
  if (!open || !recipe) return null;

  const isDrink = recipe.type === "drink";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* ATMOSPHERIC GLOWS */}
      <div className={`fixed -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] -z-10 ${isDrink ? 'bg-gold/10' : 'bg-emerald-400/10'}`} />
      <div className={`fixed -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] -z-10 opacity-50 ${isDrink ? 'bg-brand/10' : 'bg-gold/10'}`} />

      <div className={`
        relative w-full max-w-5xl bg-surface-2 rounded-[3rem] overflow-hidden border border-white/5 shadow-royale animate-float my-auto
        ${isDrink ? 'border-gold/20' : 'border-emerald-400/20'}
      `}>

        {/* TOP ACCENT */}
        <div className={`h-1.5 w-full ${isDrink ? 'bg-grad-gold shadow-gold-glow' : 'bg-emerald-400 shadow-emerald-glow'}`} />

        <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
          
          {/* LEFT COLUMN: HERO & INFO */}
          <div className="lg:w-2/5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5 space-y-10 bg-surface-3/30">
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`p-8 rounded-[2.5rem] ${isDrink ? 'bg-gold/10 text-gold shadow-gold-glow' : 'bg-emerald-400/10 text-emerald-400 shadow-emerald-glow'} scale-110`}>
                {isDrink ? <Martini size={64} /> : <Utensils size={64} />}
              </div>
              
              <div className="space-y-3">
                <div className={`badge ${isDrink ? 'badge-gold' : 'badge-emerald'} text-[10px] px-6 py-2 rounded-2xl font-black tracking-[0.4em] mb-4`}>
                  {recipe.type?.toUpperCase()}
                </div>
                <h2 className="text-4xl font-black text-ivory tracking-tighter uppercase leading-tight drop-shadow-2xl">
                  {recipe.product?.name || "Fórmula Umbra"}
                </h2>
                <p className="text-[10px] text-muted font-black uppercase tracking-[0.6em]">
                  {recipe.category || "General"} · Auditoría v2.5
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-4 p-6 rounded-3xl border border-white/5 text-center space-y-2">
                <p className="text-[9px] text-muted font-black uppercase tracking-widest">COSTO BASE</p>
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <TrendingUp size={16} />
                  <p className="text-xl font-black font-mono">${recipe.totalCost?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
              <div className="bg-surface-4 p-6 rounded-3xl border border-white/5 text-center space-y-2">
                <p className="text-[9px] text-muted font-black uppercase tracking-widest">COMPLEJIDAD</p>
                <div className="flex items-center justify-center gap-2 text-gold">
                  <Activity size={16} />
                  <p className="text-xl font-black uppercase tracking-tighter">NIVEL {(recipe.steps?.length || 0) > 5 ? 'A+' : 'B'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Zap size={14} className="text-gold" />
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Método Principal</p>
              </div>
              <p className="text-sm font-bold text-ivory italic leading-relaxed">
                "{recipe.method || "Sin método específico registrado."}"
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS & STEPS */}
          <div className="lg:w-3/5 flex flex-col overflow-hidden">
            
            {/* CLOSE BUTTON */}
            <div className="absolute top-8 right-8 z-20">
              <button onClick={onClose} className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted hover:text-gold hover:border-gold/30 transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
              
              {/* INGREDIENTS */}
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
                  <h3 className="text-lg font-black text-ivory uppercase tracking-widest">Ingeniería de Insumos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recipe.ingredients.map((i, idx) => (
                    <div key={idx} className="bg-surface-3/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold opacity-50 group-hover:opacity-100 transition-opacity">
                          <Box size={18} />
                        </div>
                        <p className="text-xs font-black text-ivory uppercase">{i.inventoryItem?.name || "Ingrediente"}</p>
                      </div>
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest">{i.quantity} {i.unit}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* STEPS */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-gold rounded-full shadow-gold-glow" />
                  <h3 className="text-lg font-black text-ivory uppercase tracking-widest">Secuencia Técnica</h3>
                </div>
                <div className="space-y-6">
                  {recipe.steps?.map((s, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-surface-4 border border-gold/20 flex items-center justify-center text-xs font-black text-gold shadow-gold-glow group-hover:scale-110 transition-transform">
                          {s.stepNumber}
                        </div>
                        {idx < ((recipe.steps?.length || 0) - 1) && <div className="w-px flex-1 bg-white/5 my-3" />}
                      </div>
                      <div className="flex-1 pt-3">
                        <p className="text-sm font-bold text-ivory leading-relaxed group-hover:text-gold transition-colors">
                          {s.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* MODAL FOOTER */}
            <div className="p-8 md:p-10 bg-surface-3 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Certificación Umbra</p>
                  <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Estándar de calidad verificado</p>
                </div>
              </div>
              <div className="flex gap-4">
                {onEdit && (
                  <button
                    onClick={() => { onEdit(recipe); onClose(); }}
                    className="px-8 h-16 rounded-[1.5rem] bg-gold/10 border border-gold/20 text-[10px] font-black uppercase tracking-[0.4em] text-gold hover:bg-gold/20 hover:border-gold/30 transition-all flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                )}
                <button onClick={onClose} className="px-10 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-muted hover:text-ivory hover:border-white/20 transition-all">
                  Cerrar Protocolo
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}