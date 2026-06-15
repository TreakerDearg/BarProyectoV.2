/**
 * DashboardPricingPanel
 * Componente simplificado que muestra el estado actual del Dynamic Pricing
 */

import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, Target } from "lucide-react";
import { pricingService } from "../../discounts/services/pricingService";
import "../../../styles/dashboard-theme.css";

export default function DashboardPricingPanel() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMultiplier();
  }, []);

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

  const isHighDemand = multiplier > 1.2;
  const isLowDemand = multiplier < 0.8;

  if (loading) {
    return (
      <div className="glass-royale rounded-[2rem] p-6 border border-white/5 animate-pulse">
        <div className="h-20 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={`dashboard-glass-card rounded-[2rem] p-6 border transition-all duration-500 ${
      isHighDemand ? 'border-red/30 bg-red/5 dashboard-neon-glow' : isLowDemand ? 'border-blue-400/30 bg-blue-400/5 dashboard-neon-glow' : 'border-lime/30 bg-lime/5 dashboard-neon-glow'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors duration-500 ${
            isHighDemand ? 'bg-red/10 text-red' : isLowDemand ? 'bg-blue-400/10 text-blue-400' : 'bg-lime/10 text-lime'
          }`}>
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wide">Precios dinámicos</p>
            <p className="text-xs font-semibold text-ivory">Multiplicador global</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border flex items-center gap-2 ${
          isHighDemand ? 'bg-red/10 text-red border-red/30' : isLowDemand ? 'bg-blue-400/10 text-blue-400 border-blue-400/30' : 'bg-lime/10 text-lime border-lime/30'
        }`}>
          {isHighDemand ? <TrendingUp size={12} /> : isLowDemand ? <TrendingDown size={12} /> : <Target size={12} />}
          {isHighDemand ? 'Alta' : isLowDemand ? 'Baja' : 'Estable'}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black leading-none tracking-tighter ${
          isHighDemand ? 'text-red' : isLowDemand ? 'text-blue-400' : 'text-lime'
        }`}>
          {multiplier.toFixed(2)}
        </span>
        <span className="text-lg font-black text-muted">x</span>
      </div>

      <p className="text-[10px] text-muted font-bold tracking-widest uppercase mt-2">
        {isHighDemand ? 'Demanda elevada' : isLowDemand ? 'Demanda baja' : 'Demanda normal'}
      </p>
    </div>
  );
}
