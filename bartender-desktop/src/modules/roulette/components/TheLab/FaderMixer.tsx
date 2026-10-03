"use client";

import type { RouletteDrink } from "../../types/roulette";
import { Sliders } from "lucide-react";

interface Props {
  drinks: RouletteDrink[];
  onUpdate: (id: string, updates: Partial<RouletteDrink>) => void;
}

const MAX_FADERS = 12;

export default function FaderMixer({ drinks, onUpdate }: Props) {
  // Show only active drinks, capped at 12
  const visibleDrinks = drinks.filter((d) => d && d.active).slice(0, MAX_FADERS);

  const totalWeight = visibleDrinks.reduce((sum, d) => sum + (d.weight || 0), 0) || 1;

  return (
    <div className="relative glass-royale border border-white/5 rounded-[2.5rem] p-6 shadow-royale overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 relative z-10 border-b border-white/5 pb-4">
        <Sliders size={16} className="text-gold" />
        <div>
          <h3 className="text-sm font-black text-ivory tracking-tighter uppercase">
            Fader <span className="text-grad-gold">Mixer</span>
          </h3>
          <p className="text-[8px] text-muted font-black uppercase tracking-[0.35em] mt-0.5">
            Control Visual de Pesos
          </p>
        </div>
        <div className="ml-auto text-[8px] text-muted font-black uppercase tracking-widest">
          {visibleDrinks.length}/{MAX_FADERS} activos
        </div>
      </div>

      {/* Faders */}
      <div className="relative z-10">
        {visibleDrinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Sliders size={24} className="text-muted/30 mb-2" />
            <p className="text-[9px] text-muted font-black uppercase tracking-widest">
              Sin tragos activos
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div
              className="flex gap-4 min-w-max"
              style={{ minHeight: "180px" }}
            >
              {visibleDrinks.map((drink) => {
                const weight = drink.weight || 1;
                const probability = ((weight / totalWeight) * 100).toFixed(1);
                const isActive = drink.active;

                // Truncate name to 8 chars for vertical display
                const shortName = drink.name.length > 8
                  ? drink.name.slice(0, 8)
                  : drink.name;

                return (
                  <div
                    key={drink._id}
                    className="flex flex-col items-center gap-2"
                    style={{ width: "48px" }}
                  >
                    {/* Drink name — rotated vertical */}
                    <div
                      className="text-[7px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden"
                      style={{
                        transform: "rotate(-90deg) translateX(-50%)",
                        transformOrigin: "left center",
                        width: "72px",
                        height: "12px",
                        marginBottom: "28px",
                        color: isActive ? "var(--color-gold, #D4A340)" : "var(--color-muted, #6B6B6B)",
                      }}
                      title={drink.name}
                    >
                      {shortName}
                    </div>

                    {/* Vertical fader track */}
                    <div className="relative flex items-center justify-center" style={{ height: "120px" }}>
                      {/* Track background */}
                      <div
                        className="absolute rounded-full border border-white/10"
                        style={{
                          width: "6px",
                          height: "120px",
                          background: "rgba(255,255,255,0.05)",
                        }}
                      />
                      {/* Fill level */}
                      <div
                        className="absolute bottom-0 rounded-full transition-all duration-300"
                        style={{
                          width: "6px",
                          height: `${(weight / 100) * 120}px`,
                          maxHeight: "120px",
                          background: isActive
                            ? "linear-gradient(to top, #D4A340, #F0C060)"
                            : "rgba(107,107,107,0.3)",
                        }}
                      />
                      {/* Slider input — rotated */}
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={weight}
                        disabled={!isActive}
                        onChange={(e) =>
                          onUpdate(drink._id, { weight: Number(e.target.value) })
                        }
                        className="absolute opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          width: "120px",
                          height: "24px",
                          transform: "rotate(-90deg)",
                          transformOrigin: "center center",
                          WebkitAppearance: "slider-vertical",
                        }}
                        title={`${drink.name}: ${weight}`}
                      />
                    </div>

                    {/* Probability label */}
                    <span
                      className="text-[8px] font-black tracking-widest"
                      style={{
                        color: isActive ? "var(--color-gold, #D4A340)" : "rgba(107,107,107,0.5)",
                      }}
                    >
                      {probability}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
