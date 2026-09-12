"use client";

import { Percent, TrendingUp, Megaphone, Calendar, HelpCircle } from "lucide-react";

type DiscountView = "manual" | "dynamic-pricing" | "promotions" | "events";

interface Props {
  title:          string;
  subtitle:       string;
  currentView:    string;
  onViewChange:   (view: DiscountView) => void;
  onOpenTutorial: () => void;
}

const VIEWS: { id: DiscountView; label: string; icon: React.ElementType }[] = [
  { id: "manual",          label: "Manual",           icon: Percent    },
  { id: "dynamic-pricing", label: "Precios dinámicos", icon: TrendingUp },
  { id: "promotions",      label: "Promociones",       icon: Megaphone  },
  { id: "events",          label: "Eventos",           icon: Calendar   },
];

export default function DiscountsSuiteHeader({
  currentView, onViewChange, onOpenTutorial,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 flex-shrink-0">
      {/* Tabs de navegación */}
      <div className="flex items-center gap-1 p-1 bg-white/4 border border-white/8 rounded-2xl overflow-x-auto scrollbar-none">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              currentView === id
                ? "bg-gold/15 text-gold border border-gold/25 shadow-[0_2px_8px_rgba(212,163,64,0.12)]"
                : "text-muted hover:text-ivory hover:bg-white/5"
            }`}
          >
            <Icon size={13} className={currentView === id ? "text-gold" : "text-muted"} />
            {label}
          </button>
        ))}
      </div>

      {/* Ayuda */}
      <button
        type="button"
        onClick={onOpenTutorial}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 text-xs text-muted hover:text-ivory hover:border-white/14 transition-colors flex-shrink-0"
      >
        <HelpCircle size={13} />
        <span className="hidden sm:inline">Ayuda</span>
      </button>
    </div>
  );
}
