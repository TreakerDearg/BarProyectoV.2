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
  action: () => void;
}

function MiniBar({ weights, colors }: { weights: number[]; colors: string[] }) {
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  return (
    <div className="flex h-2 w-full rounded-full overflow-hidden gap-px bg-surface-3">
      {weights.map((w, i) => (
        <div
          key={i}
          className="h-full rounded-xs transition-all duration-300"
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

  const currentWeights = activeDrinks.map((d) => d.weight || 1);
  const equalWeights = activeDrinks.map(() => 10);

  const profitWeights: number[] = (() => {
    if (activeDrinks.length === 0) return [];
    const sorted = [...activeDrinks].sort((a, b) => {
      const priceA =
        a.product && typeof a.product === "object" ? (a.product.dynamicPrice ?? 0) : 0;
      const priceB =
        b.product && typeof b.product === "object" ? (b.product.dynamicPrice ?? 0) : 0;
      return priceB - priceA;
    });
    const n = sorted.length;
    return activeDrinks.map((drink) => {
      const rank = sorted.findIndex((s) => s._id === drink._id);
      return n === 1 ? 80 : Math.round(80 - ((80 - 10) / (n - 1)) * rank);
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

  const barColors = ["#F0B429", "#3FB950", "#388BFD", "#A371F7", "#FF7B54"];

  const presets: PresetCard[] = [
    {
      id: "happy-hour",
      title: "Happy Hour",
      subtitle: "Distribución equitativa",
      description: "Igual probabilidad para todos los cócteles activos.",
      icon: <Star size={16} />,
      color: "#F0B429",
      action: () => onAutoBalance("equal"),
    },
    {
      id: "inventory-pusher",
      title: "Inventory Pusher",
      subtitle: "Prioriza alto stock",
      description: "Ajuste dinámico según existencias y rarezas en bodega.",
      icon: <TrendingUp size={16} />,
      color: "#3FB950",
      action: () => onAutoBalance("smart"),
    },
    {
      id: "profit-maximizer",
      title: "Profit Maximizer",
      subtitle: "Mayor margen comercial",
      description: "Asigna mayores probabilidades a los tragos de mayor precio.",
      icon: <Wand2 size={16} />,
      color: "#A371F7",
      action: handleProfitMaximizer,
    },
  ];

  const projectedWeightsByPreset: Record<string, number[]> = {
    "happy-hour": equalWeights,
    "inventory-pusher": currentWeights,
    "profit-maximizer": profitWeights,
  };

  return (
    <div className="bg-surface-2 border border-border rounded-2xl p-5 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div className="flex items-center gap-2.5">
          <Wand2 size={16} className="text-gold" />
          <div>
            <h4 className="text-xs font-black text-ivory tracking-wider uppercase">
              Smart Presets
            </h4>
            <p className="text-xs text-muted">
              Estrategias de balanceo preconfiguradas
            </p>
          </div>
        </div>
        <span className="text-xs text-muted font-bold uppercase">
          {activeDrinks.length} activos
        </span>
      </div>

      {/* Preset Cards */}
      <div className="space-y-3">
        {presets.map((preset) => {
          const projWeights = projectedWeightsByPreset[preset.id] ?? currentWeights;

          return (
            <div
              key={preset.id}
              className="p-4 rounded-xl border border-border bg-surface-3/50 hover:bg-surface-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl border border-border"
                    style={{ background: `${preset.color}15`, color: preset.color }}
                  >
                    {preset.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-ivory tracking-wider">
                      {preset.title}
                    </h5>
                    <p className="text-xs text-muted font-bold">
                      {preset.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={preset.action}
                  disabled={activeDrinks.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-4 active:scale-95"
                  style={{ color: preset.color, borderColor: `${preset.color}40` }}
                >
                  <span>Aplicar</span>
                  <ChevronRight size={12} />
                </button>
              </div>

              <p className="text-xs text-muted/80 mb-3 leading-relaxed">
                {preset.description}
              </p>

              {/* Distribution bars */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted w-14">Actual</span>
                  <div className="flex-1">
                    <MiniBar weights={currentWeights} colors={barColors} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold w-14" style={{ color: preset.color }}>
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
