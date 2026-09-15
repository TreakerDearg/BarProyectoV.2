"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Users } from "lucide-react";
import { useDietaryRestrictions } from "@/hooks/useDietaryRestrictions";
import { getDietaryIcon } from "@/lib/utils/dietaryIcons";
import type { DietaryRestriction } from "@/lib/types/reservation";

export function DietaryRestrictionsToast() {
  const { restrictions, visible, dismiss } = useDietaryRestrictions();

  if (!restrictions || !visible) return null;

  const { tableNumber, guestDietaryRestrictions } = restrictions;

  // Agrupar restricciones por tipo
  const restrictionCounts = guestDietaryRestrictions.reduce<Record<DietaryRestriction, number>>(
    (acc, guest) => {
      guest.restrictions.forEach((r) => {
        acc[r] = (acc[r] || 0) + 1;
      });
      return acc;
    },
    {} as Record<DietaryRestriction, number>
  );

  const totalGuests = guestDietaryRestrictions.length;
  const guestsWithRestrictions = guestDietaryRestrictions.filter((g) => g.restrictions.length > 0).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -100, x: "-50%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
      >
        <div className="rounded-2xl border border-amber-500/30 bg-surface-2/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <AlertTriangle size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-300">Restricciones dietéticas</p>
                <p className="text-xs text-amber-200/70">Mesa #{tableNumber}</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-lg hover:bg-amber-500/10 transition-colors"
            >
              <X size={16} className="text-amber-400/70" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted flex items-center gap-1.5">
              <Users size={12} />
              {guestsWithRestrictions} de {totalGuests} invitados con restricciones
            </p>

            {/* Restricciones */}
            <div className="space-y-2">
              {Object.entries(restrictionCounts).map(([restriction, count]) => {
                const restrictionValue = restriction as DietaryRestriction;
                const label = {
                  vegan: "Vegano",
                  vegetarian: "Vegetariano",
                  "gluten-free": "Sin Gluten",
                  "dairy-free": "Sin Lácteos",
                  "nut-free": "Sin Frutos Secos",
                  "sugar-free": "Sin Azúcar",
                  "shellfish-free": "Sin Mariscos",
                  kosher: "Kosher",
                  halal: "Halal",
                  "low-sodium": "Bajo en Sodio",
                  other: "Otra",
                }[restrictionValue];

                return (
                  <div
                    key={restriction}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/4 border border-white/8"
                  >
                    <span className="flex-shrink-0 text-amber-400">
                      {getDietaryIcon(
                        {
                          vegan: "Leaf",
                          vegetarian: "Salad",
                          "gluten-free": "WheatOff",
                          "dairy-free": "MilkOff",
                          "nut-free": "CircleOff",
                          "sugar-free": "CandyOff",
                          "shellfish-free": "FishOff",
                          kosher: "Star",
                          halal: "Moon",
                          "low-sodium": "Droplets",
                          other: "AlertTriangle",
                        }[restrictionValue],
                        14
                      )}
                    </span>
                    <span className="text-xs font-medium flex-1">{label}</span>
                    <span className="text-xs font-bold text-amber-400">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Invitados con detalles */}
            {guestDietaryRestrictions.filter((g) => g.restrictions.length > 0).map((guest, idx) => (
              <div key={idx} className="text-xs text-muted/70">
                <span className="font-medium text-text">{guest.guestName || `Invitado ${idx + 1}`}:</span>
                <span className="ml-1">{guest.restrictions.join(", ")}</span>
                {guest.notes && <span className="ml-1 text-amber-400/80">({guest.notes})</span>}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
