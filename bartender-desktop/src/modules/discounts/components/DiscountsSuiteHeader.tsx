"use client";

/**
 * DiscountsSuiteHeader — Solo tabs de navegación, sin título duplicado.
 * REDISEÑO v3.0 — Slate Elegante
 */
import { Percent, TrendingUp, Megaphone, Calendar, HelpCircle } from "lucide-react";

type DiscountView = "manual" | "dynamic-pricing" | "promotions" | "events";

interface Props {
  title:          string;  // mantenido por compatibilidad, no renderizado
  subtitle:       string;  // mantenido por compatibilidad, no renderizado
  currentView:    string;
  onViewChange:   (view: DiscountView) => void;
  onOpenTutorial: () => void;
}

const VIEWS: { id: DiscountView; label: string; icon: React.ElementType }[] = [
  { id: "manual",          label: "Manual",            icon: Percent    },
  { id: "dynamic-pricing", label: "Precios dinámicos", icon: TrendingUp },
  { id: "promotions",      label: "Promociones",        icon: Megaphone  },
  { id: "events",          label: "Eventos",            icon: Calendar   },
];

export default function DiscountsSuiteHeader({
  currentView, onViewChange, onOpenTutorial,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ background: "#161B22", border: "1px solid #30363D" }}
      >
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
              style={{
                background:  isActive ? "rgba(240,180,41,0.15)" : "transparent",
                color:       isActive ? "#F0B429" : "#566270",
                border:      isActive ? "1px solid rgba(240,180,41,0.30)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#8B949E";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "#566270";
              }}
            >
              <Icon size={13} style={{ color: isActive ? "#F0B429" : "inherit" }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Ayuda */}
      <button
        type="button"
        onClick={onOpenTutorial}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors flex-shrink-0"
        style={{ border: "1px solid #30363D", color: "#566270" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
      >
        <HelpCircle size={13} />
        <span className="hidden sm:inline">Ayuda</span>
      </button>
    </div>
  );
}
