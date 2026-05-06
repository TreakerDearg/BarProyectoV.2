import { useState, useEffect } from "react";
import { pricingService } from "../services/pricingService";
import { Activity, TrendingUp, TrendingDown, Target, Zap, ChevronRight, AlertTriangle } from "lucide-react";

export default function DynamicPricingPage() {
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiplierChange = async (newValue: number) => {
    setMultiplier(newValue);
    try {
      await pricingService.updateGlobalMultiplier(newValue);
    } catch (error) {
      console.error("Error al actualizar multiplicador", error);
    }
  };

  if (loading) return <div className="p-10 text-ivory text-sm">Cargando...</div>;

  const isHighDemand = multiplier > 1.2;
  const isLowDemand = multiplier < 0.8;

  return (
    <div className="space-y-6 glass-royale p-8 rounded-[3rem] shadow-royale animate-fade-in relative overflow-hidden">
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -z-10 pointer-events-none transition-colors duration-1000 ${
        isHighDemand ? 'bg-red-500/10' : isLowDemand ? 'bg-blue-500/10' : 'bg-lime-500/5'
      }`} />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className={`p-4 border border-white/5 rounded-2xl shadow-inner transition-colors duration-500 ${
            isHighDemand ? 'bg-red/10 border-red/30 text-red' : isLowDemand ? 'bg-blue-400/10 border-blue-400/30 text-blue-400' : 'bg-lime/10 border-lime/30 text-lime'
          }`}>
            <Activity size={32} />
          </div>
          <div>
            <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mb-1">
              Motor de Demanda Algorítmica
            </p>
            <h1 className="text-3xl font-black text-ivory tracking-tighter uppercase leading-none">
              Dynamic Pricing
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* ================= MULTIPLIER CONTROL ================= */}
        <section className="col-span-12 xl:col-span-6 bg-surface-3/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-royale">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-xs font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
              <Zap size={16} className="text-gold" />
              Multiplicador Base
            </h2>
            <div className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase border flex items-center gap-2 ${
              isHighDemand ? 'bg-red/10 text-red border-red/30' : isLowDemand ? 'bg-blue-400/10 text-blue-400 border-blue-400/30' : 'bg-lime/10 text-lime border-lime/30'
            }`}>
              {isHighDemand ? <TrendingUp size={12} /> : isLowDemand ? <TrendingDown size={12} /> : <Target size={12} />}
              {isHighDemand ? 'Alta Demanda' : isLowDemand ? 'Baja Demanda' : 'Estable'}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-[5rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              {multiplier.toFixed(2)}<span className="text-2xl text-muted ml-2">x</span>
            </div>
            <p className="text-xs text-muted font-bold tracking-widest uppercase mt-4">Impacto directo en precios base</p>
          </div>

          <div className="mt-8 px-4">
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.05" 
              value={multiplier} 
              onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
              className="w-full appearance-none bg-surface-2 h-2 rounded-full outline-none slider-royale" 
              style={{
                background: `linear-gradient(to right, ${
                  isHighDemand ? '#EF4444' : isLowDemand ? '#60A5FA' : '#A3E635'
                } ${(multiplier - 0.5) / 2.5 * 100}%, rgba(255,255,255,0.05) ${(multiplier - 0.5) / 2.5 * 100}%)`
              }}
            />
            <div className="flex justify-between text-[10px] font-black text-muted mt-3">
              <span>0.5x (Liquidación)</span>
              <span>1.0x (Base)</span>
              <span>3.0x (Surge)</span>
            </div>
          </div>
        </section>

        {/* ================= METRICS ================= */}
        <section className="col-span-12 xl:col-span-6 grid grid-cols-2 gap-6">
          <div className="bg-surface-2 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between group hover:border-lime/30 transition-all">
            <div className="flex justify-between items-start">
              <h2 className="text-[10px] font-black text-muted tracking-[0.2em] uppercase">Proyección de Ingresos</h2>
              <div className="p-2 bg-lime/10 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp size={16} className="text-lime" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-ivory tracking-tighter">+$12,450</p>
              <p className="text-[10px] text-lime font-bold tracking-widest uppercase mt-2 bg-lime/10 w-fit px-2 py-0.5 rounded">+14.2% respecto a ayer</p>
            </div>
          </div>

          <div className="bg-surface-2 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between group hover:border-red/30 transition-all">
            <div className="flex justify-between items-start">
              <h2 className="text-[10px] font-black text-muted tracking-[0.2em] uppercase">Nivel de Saturación</h2>
              <div className="p-2 bg-red/10 rounded-lg group-hover:scale-110 transition-transform">
                <AlertTriangle size={16} className="text-red" />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-ivory tracking-tighter">84<span className="text-2xl text-muted">%</span></p>
              <p className="text-[10px] text-red font-bold tracking-widest uppercase mt-2 bg-red/10 w-fit px-2 py-0.5 rounded">Capacidad Crítica</p>
            </div>
          </div>

          <div className="col-span-2 bg-surface-3/50 border border-white/5 rounded-[2rem] p-6">
            <h2 className="text-[10px] font-black text-muted tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <ChevronRight size={12} className="text-gold" /> Muestra de Impacto (Beta)
            </h2>
            
            <div className="space-y-1">
              <div className="grid grid-cols-12 text-[9px] font-black text-muted uppercase tracking-widest px-4 py-2 bg-black/20 rounded-t-xl">
                <span className="col-span-5">Producto</span>
                <span className="col-span-3 text-center">Base</span>
                <span className="col-span-4 text-right">Actual ({multiplier}x)</span>
              </div>
              {[
                { name: "Vintage Cabernet", base: 120 },
                { name: "Ribeye 12oz", base: 42.5 },
                { name: "Old Fashioned", base: 16 },
              ].map((row, i, arr) => (
                <div key={row.name} className={`grid grid-cols-12 text-xs items-center px-4 py-3 bg-surface-2 border-b border-white/5 ${i === arr.length - 1 ? 'rounded-b-xl border-none' : ''}`}>
                  <span className="col-span-5 text-ivory font-bold">{row.name}</span>
                  <span className="col-span-3 text-center text-muted">${row.base.toFixed(2)}</span>
                  <span className="col-span-4 text-right font-black text-gold">${(row.base * multiplier).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
