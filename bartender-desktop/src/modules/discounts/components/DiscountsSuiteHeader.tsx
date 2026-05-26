import { Link, useLocation } from "react-router-dom";
import { HelpCircle, Sparkles } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  onOpenTutorial: () => void;
};

const tabs = [
  { to: "/discounts", label: "Descuentos" },
  { to: "/discounts/dynamic-pricing", label: "Precios" },
  { to: "/discounts/promotions", label: "Promociones" },
  { to: "/discounts/events", label: "Eventos" },
];

export default function DiscountsSuiteHeader({ title, subtitle, onOpenTutorial }: Props) {
  const location = useLocation();

  return (
    <div className="discounts-panel p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gold/20 text-gold">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-ivory">{title}</h1>
            <p className="text-[11px] text-muted uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onOpenTutorial}
          className="px-3 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm font-semibold flex items-center gap-2"
        >
          <HelpCircle size={16} />
          Tutorial global
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                active
                  ? "bg-gold text-black"
                  : "bg-white/5 text-muted hover:text-ivory hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
