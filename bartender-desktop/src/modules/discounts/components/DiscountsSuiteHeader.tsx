"use client";

import { HelpCircle, Sparkles } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenTutorial: () => void;
}

export default function DiscountsSuiteHeader({ 
  title, 
  subtitle, 
  currentView, 
  onViewChange, 
  onOpenTutorial 
}: Props) {
  const views = [
    { id: "manual", label: "Manual" },
    { id: "dynamic-pricing", label: "Precios Dinámicos" },
    { id: "promotions", label: "Promociones" },
    { id: "events", label: "Eventos" },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-400/20 shadow-[0_0_24px_rgba(139,92,246,0.15)]">
          <Sparkles className="text-violet-200" size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
            {title}
          </h1>
          <p className="text-xs text-muted mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentView === view.id
                  ? "bg-cyan text-black shadow-lg"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenTutorial}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-muted hover:text-violet-200 hover:border-violet-400/30 transition-colors"
          title="Tutorial"
        >
          <HelpCircle size={16} />
          Tutorial
        </button>
      </div>
    </div>
  );
}
