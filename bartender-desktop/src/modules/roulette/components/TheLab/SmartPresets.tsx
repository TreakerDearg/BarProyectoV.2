"use client";

import type { RouletteDrink } from "../../types/roulette";
import { Wand2, TrendingUp, Star, ChevronRight } from "lucide-react";

interface Props {
  onAutoBalance: (mode: "equal" | "smooth" | "smart") => void;
  drinks: RouletteDrink[];
  onUpdate: (id: string, updates: Partial<RouletteDrink>) => void;
}

interface PresetCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  accentClass: string;
  borderClass: string;
  action: () => void;
}

/** Mini horizontal distribution bar showing an array of normalized weights */
function MiniBar({ weights, colors }: { weights: number[]; colors: string[] }) {
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden gap-px bg-surface-3/30">
      {weights.map((w, i) => (
        <div
          key={i}
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${(w / total) * 100}%`,
            background: colors[i % colors.length],
          }}
        />
      ))}
    </div>
  );
}

export default function SmartPresets({ onAutoBalance, drinks, onUpdate }: Props) {
  const activeDrinks = drinks.filter((d) => d && d.active);

  // Current distribution for mini bars
  const currentWeights = activeDrinks.map((d) => d.weight || 1);

  // Projected: equal distribution
  const equalWeights = activeDrinks.map(() => 10);

  // Projected: smart distribution (highest price = highest weight, scale 10-80)
  const profitWeights: number[] = (() => {
    if (activeDrinks.length === 0) return [];
    const sorted = [...activeDrinks].sort((a, b) => {
      const priceA =
        a.product && typeof a.product === "object" ? (a.product.dynamicPrice ?? 0) : 0;
      const priceB =
        b.product && typeof b.product === "object" ? (b.product.dynamicPrice ?? 0) : 0;
      return priceB - priceA; // desc
    });
    const n = sorted.length;
    // rank: highest price → rank 0 (highest weight), lowest → rank n-1
    return activeDrinks.map((drink) => {
      const rank = sorted.findIndex((s) => s._id === drink._id);
      // weight = 80 for rank 0, 10 for rank n-1
      const weight = n === 1 ? 80 : Math.round(80 - ((80 - 10) / (n - 1)) * rank);
      return weight;
    });
  })();

  const handleProfitMaximizer = () => {
    if (activeDrinks.length === 0) return;
    const n = activeDrinks.length;
    const sorted = [...activeDrinks].sort((a, b) => {
      const priceA =
        a.product && typeof a.product === "object" ? (a.product.dynamicPrice ?? 0) : 0;
      const priceB =
        b.product && typeof b.product === "object" ? (b.product.dynamicPrice ?? 0) : 0;
      return priceB - priceA;
    });

    activeDrinks.forEach((drink) => {
      const rank = sorted.findIndex((s) => s._id === drink._id);
      const weight = n === 1 ? 80 : Math.round(80 - ((80 - 10) / (n - 1)) * rank);
      onUpdate(drink._id, { weight });
    });
  };

  const barColors = ["#D4A340", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  const presets: PresetCard[] = [
    {
      id: "happy-hour",
      title: "Happy Hour",
      subtitle: "Distribución equitativa",
      description: "Igual probabilidad para todos los tragos activos.",
      icon: <Star size={14} />,
      color: "#D4A340",
      accentClass: "text-gold",
      borderClass: "border-gold/20 hover:border-gold/40",
      action: () => onAutoBalance("equal"),
    },
    {
      id: "inventory-pusher",
      title: "Inventory Pusher",
      subtitle: "Prioriza stock alto",
      description: "Ajuste inteligente según stock y rarezas disponibles.",
      icon: <TrendingUp size={14} />,
      color: "#10B981",
      accentClass: "text-emerald-400",
      borderClass: "border-emerald-400/20 hover:border-emerald-400/40",
      action: () => onAutoBalance("smart"),
    },
    {
      id: "profit-maximizer",
      title: "Profit Maximizer",
      subtitle: "Mayor precio = más chance",
      description: "Asigna pesos proporcionales al precio dinámico de cada trago.",
      icon: <Wand2 size={14} />,
      color: "#8B5CF6",
      accentClass: "text-purple-400",
      borderClass: "border-purple-400/20 hover:border-purple-400/40",
      action: handleProfitMaximizer,
    },
  ];

  // Pick projected weights for each card
  const projectedWeightsByPreset: Record<string, number[]> = {
    "happy-hour": equalWeights,
    "inventory-pusher": currentWeights, // actual result depends on backend smart logic
    "profit-maximizer": profitWeights,
  };

  return (
    <div className="relative glass-royale border border-white/5 rounded-[2.5rem] p-6 shadow-royale overflow-hidden">
      {/* Background glow */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 relative z-10 border-b border-white/5 pb-4">
        <Wand2 size={16} className="text-gold" />
        <div>
          <h3 className="text-sm font-black text-ivory tracking-tighter uppercase">
            Smart <span className="text-grad-gold">Presets</span>
          </h3>
          <p className="text-[8px] text-muted font-black uppercase tracking-[0.35em] mt-0.5">
            Balanceo Automático
          </p>
        </div>
        <div className="ml-auto text-[8px] text-muted font-black uppercase tracking-widest">
          {activeDrinks.length} activos
        </div>
      </div>

      {/* Preset Cards */}
      <div className="relative z-10 grid grid-cols-1 gap-3">
        {presets.map((preset) => {
          const projWeights = projectedWeightsByPreset[preset.id] ?? currentWeights;

          return (
            <div
              key={preset.id}
              className={`group p-4 rounded-2xl border bg-surface-3/15 hover:bg-surface-3/25 transition-all duration-300 ${preset.borderClass}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl border border-white/5"
                    style={{ background: `${preset.color}15`, color: preset.color }}
                  >
                    {preset.icon}
                  </div>
                  <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-tight ${preset.accentClass}`}>
                      {preset.title}
                    </h4>
                    <p className="text-[7px] text-muted font-black uppercase tracking-widest mt-0.5">
                      {preset.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={preset.action}
                  disabled={activeDrinks.length === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[8px] font-black tracking-widest uppercase transition-all border disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${preset.borderClass}`}
                  style={{ color: preset.color, borderColor: `${preset.color}40` }}
                >
                  Aplicar <ChevronRight size={10} />
                </button>
              </div>

              <p className="text-[8px] text-muted/80 mb-3 leading-relaxed">{preset.description}</p>

              {/* Distribution bars: current vs projected */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[6px] font-black text-muted/60 uppercase tracking-widest w-12">Actual</span>
                  <div className="flex-1">
                    <MiniBar weights={currentWeights} colors={barColors} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[6px] font-black uppercase tracking-widest w-12" style={{ color: preset.color }}>
                    Proyect.
                  </span>
                  <div className="flex-1">
                    <MiniBar weights={projWeights} colors={[preset.color]} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
