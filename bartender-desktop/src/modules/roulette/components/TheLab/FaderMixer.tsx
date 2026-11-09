"use client";

import type { RouletteDrink } from "../../types/roulette";
import { Sliders } from "lucide-react";

interface Props {
  drinks: RouletteDrink[];
  onUpdate: (id: string, updates: Partial<RouletteDrink>) => void;
}

const MAX_FADERS = 10;

export default function FaderMixer({ drinks, onUpdate }: Props) {
  const visibleDrinks = drinks.filter((d) => d && d.active).slice(0, MAX_FADERS);
  const totalWeight = visibleDrinks.reduce((sum, d) => sum + (d.weight || 0), 0) || 1;

  return (
    <div className="bg-surface-2 border border-border rounded-2xl p-5 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div className="flex items-center gap-2.5">
          <Sliders size={16} className="text-gold" />
          <div>
            <h4 className="text-xs font-black text-ivory tracking-wider uppercase">
              Fader Mixer
            </h4>
            <p className="text-xs text-muted">
              Ecualizador de pesos activos
            </p>
          </div>
        </div>
        <span className="text-xs text-muted font-bold uppercase">
          {visibleDrinks.length}/{MAX_FADERS}
        </span>
      </div>

      {/* Faders */}
      {visibleDrinks.length === 0 ? (
        <div className="py-8 text-center text-muted">
          <Sliders size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-xs font-bold uppercase tracking-wider">
            Sin tragos activos
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex gap-4 min-w-max items-end py-2" style={{ minHeight: "180px" }}>
            {visibleDrinks.map((drink) => {
              const weight = drink.weight || 1;
              const probability = ((weight / totalWeight) * 100).toFixed(1);
              const isActive = drink.active;
              const shortName = drink.name.length > 9 ? `${drink.name.slice(0, 8)}.` : drink.name;

              return (
                <div key={drink._id} className="flex flex-col items-center gap-2 w-14">
                  {/* Probability */}
                  <span className="text-xs font-black text-gold">
                    {probability}%
                  </span>

                  {/* Vertical fader track */}
                  <div className="relative flex items-center justify-center h-28">
                    {/* Track background */}
                    <div className="w-2 h-28 rounded-full bg-surface-3 border border-border" />
                    {/* Fill level */}
                    <div
                      className="absolute bottom-0 w-2 rounded-full bg-gradient-to-t from-gold-dark to-gold transition-all duration-200"
                      style={{
                        height: `${Math.min(100, Math.max(5, (weight / 100) * 112))}px`,
                      }}
                    />
                    {/* Range input */}
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={weight}
                      disabled={!isActive}
                      onChange={(e) => onUpdate(drink._id, { weight: Number(e.target.value) })}
                      className="absolute opacity-0 cursor-pointer w-28 h-8 -rotate-90"
                      title={`${drink.name}: peso ${weight}`}
                    />
                  </div>

                  {/* Weight value */}
                  <span className="text-xs font-bold text-ivory/80">
                    {weight}
                  </span>

                  {/* Drink name */}
                  <span
                    className="text-xs font-bold uppercase text-muted text-center truncate max-w-full"
                    title={drink.name}
                  >
                    {shortName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
