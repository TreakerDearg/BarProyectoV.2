/**
 * DashboardPricingPanel — Estado del Dynamic Pricing.
 *
 * REDISEÑO v3.0 — Slate Elegante
 */
import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, Target } from "lucide-react";
import { pricingService } from "../../discounts/services/pricingService";

export default function DashboardPricingPanel() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { loadMultiplier(); }, []);

  const loadMultiplier = async () => {
    try {
      const value = await pricingService.getGlobalMultiplier();
      setMultiplier(value);
    } catch (error) {
      console.error("Error cargando multiplicador:", error);
    } finally {
      setLoading(false);
    }
  };

  const isHigh = multiplier > 1.2;
  const isLow  = multiplier < 0.8;

  /* Estilos según demanda */
  const config = isHigh
    ? { border: "border-[#F85149]/25", bg: "bg-[#F85149]/6",  color: "#F85149", label: "Alta",   icon: <TrendingUp size={13} /> }
    : isLow
    ? { border: "border-[#388BFD]/25", bg: "bg-[#388BFD]/6",  color: "#388BFD", label: "Baja",   icon: <TrendingDown size={13} /> }
    : { border: "border-[#3FB950]/25", bg: "bg-[#3FB950]/6",  color: "#3FB950", label: "Estable", icon: <Target size={13} /> };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#30363D] bg-[#1C2333]/50 p-6 animate-pulse">
        <div className="h-20 bg-[#21283A] rounded-xl" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 transition-all duration-500`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: `${config.color}20`, color: config.color }}
          >
            <Activity size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#566270] uppercase tracking-wider">
              Precios dinámicos
            </p>
            <p className="text-sm font-semibold text-[#E6EDF3]">Multiplicador global</p>
          </div>
        </div>

        {/* Badge de estado */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
          style={{
            color:       config.color,
            borderColor: `${config.color}40`,
            background:  `${config.color}15`,
          }}
        >
          {config.icon}
          {config.label}
        </div>
      </div>

      {/* Valor */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black leading-none" style={{ color: config.color }}>
          {multiplier.toFixed(2)}
        </span>
        <span className="text-xl font-black text-[#566270]">x</span>
      </div>

      <p className="text-xs text-[#566270] font-medium uppercase tracking-wider mt-2">
        {isHigh ? "Demanda elevada" : isLow ? "Demanda baja" : "Demanda normal"}
      </p>
    </div>
  );
}
