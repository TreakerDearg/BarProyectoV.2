/**
 * RecipeQuickView — Desktop Roulette
 *
 * Muestra la receta vinculada a un RouletteDrink de forma compacta.
 * Usable como tooltip expandible o panel lateral.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Beaker,
  ListOrdered,
  DollarSign,
} from "lucide-react";
import type { DrinkRecipe } from "../types/roulette";

// ─── Helpers ─────────────────────────────────────────────────────

const METHOD_LABEL: Record<string, string> = {
  shake:  "Coctelera",
  stir:   "Mezclado / Stirred",
  build:  "Directo / Built",
  blend:  "Licuadora",
  muddle: "Macerado",
};

const UNIT_ABBREV: Record<string, string> = {
  ml:      "ml",
  l:       "l",
  g:       "g",
  kg:      "kg",
  oz:      "oz",
  unit:    "u",
  portion: "porción",
};

// ─── Props ────────────────────────────────────────────────────────

interface RecipeQuickViewProps {
  recipe:      DrinkRecipe;
  drinkName?:  string;
  className?:  string;
  /** Si true, arranca expandido */
  defaultOpen?: boolean;
}

// ─── Component ───────────────────────────────────────────────────

export default function RecipeQuickView({
  recipe,
  drinkName,
  className = "",
  defaultOpen = false,
}: RecipeQuickViewProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl border border-white/5 bg-surface-3/20 overflow-hidden ${className}`}>
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-all"
        aria-expanded={open}
      >
        <BookOpen size={14} className="text-gold flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-ivory uppercase tracking-widest truncate">
            {drinkName ?? "Receta"}
          </p>
          {recipe.method && (
            <p className="text-[8px] font-black text-muted uppercase tracking-widest mt-0.5">
              {METHOD_LABEL[recipe.method] ?? recipe.method}
              {recipe.totalCost != null && (
                <span className="ml-2 text-gold/70">· ${recipe.totalCost.toFixed(2)} costo</span>
              )}
            </p>
          )}
        </div>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gold/60 flex-shrink-0"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-white/5">

              {/* Ingredientes */}
              {(recipe.ingredients?.length ?? 0) > 0 && (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Beaker size={12} className="text-gold" />
                    <span className="text-[9px] font-black text-gold uppercase tracking-[0.3em]">
                      Ingredientes
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold/40 flex-shrink-0" />
                          <span className="text-[10px] font-semibold text-ivory/80 capitalize">
                            {ing.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-gold whitespace-nowrap">
                          {ing.quantity} {UNIT_ABBREV[ing.unit] ?? ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pasos */}
              {(recipe.steps?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <ListOrdered size={12} className="text-gold" />
                    <span className="text-[9px] font-black text-gold uppercase tracking-[0.3em]">
                      Preparación
                    </span>
                  </div>
                  <div className="space-y-3">
                    {recipe.steps.map((step) => (
                      <div key={step.stepNumber} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[8px] font-black text-gold">{step.stepNumber}</span>
                        </div>
                        <p className="text-[10px] text-ivory/70 leading-relaxed flex-1">
                          {step.instruction}
                          {step.time != null && step.time > 0 && (
                            <span className="ml-1.5 text-muted text-[8px]">({step.time}s)</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Costo */}
              {recipe.totalCost != null && recipe.totalCost > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} className="text-gold/60" />
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest">
                      Costo estimado
                    </span>
                  </div>
                  <span className="text-sm font-black text-gold">
                    ${recipe.totalCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
