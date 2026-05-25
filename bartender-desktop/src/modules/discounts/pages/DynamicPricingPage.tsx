import { useState, useEffect } from "react";
import { pricingService } from "../services/pricingService";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";
import { Activity, TrendingUp, TrendingDown, Target, Zap, ChevronRight, AlertTriangle, Flame } from "lucide-react";

export default function NebulaDynamicPricingPage() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [multValue, prods] = await Promise.all([
        pricingService.getGlobalMultiplier(),
        getProducts()
      ]);
      setMultiplier(multValue);
      // Simular los "top" productos tomando algunos al azar o los primeros
      setTopProducts(prods.slice(0, 5));
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin shadow-[0_0_30px_rgba(251,191,36,0.3)]"></div>
      <p className="text-gold font-black uppercase tracking-[0.2em] animate-pulse">Iniciando Motor Algorítmico...</p>
    </div>
  );

  const isHighDemand = multiplier > 1.2;
  const isSurge = multiplier >= 2.0;
  const isLowDemand = multiplier < 0.8;

  // Determine thermal color
  const themeColor = isSurge ? 'text-rose-500' : isHighDemand ? 'text-orange-500' : isLowDemand ? 'text-blue-400' : 'text-lime';
  const themeBg = isSurge ? 'bg-rose-500' : isHighDemand ? 'bg-orange-500' : isLowDemand ? 'bg-blue-400' : 'bg-lime';
  const themeBorder = isSurge ? 'border-rose-500/30' : isHighDemand ? 'border-orange-500/30' : isLowDemand ? 'border-blue-400/30' : 'border-lime/30';

  return (
    <div className="space-y-6 p-8 relative overflow-hidden animate-fade-in">
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] -z-10 pointer-events-none transition-colors duration-1000 ${themeBg} opacity-10`} />

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between relative z-10 animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className={`absolute inset-0 ${themeBg} blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-2xl`} />
            <div className={`relative p-5 glass-card border ${themeBorder} rounded-2xl`}>
              <Activity className={themeColor} size={36} />
            </div>
          </div>
          <div>
            <p className={`text-[10px] ${themeColor} font-black uppercase tracking-[0.4em] mb-1 drop-shadow-lg`}>
              Motor de Demanda Algorítmica
            </p>
            <h1 className="text-4xl font-black text-ivory tracking-tighter uppercase leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Precios <span className={themeColor}>Dinámicos Nebula</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 relative z-10">
        {/* ================= MULTIPLIER CONTROL ================= */}
        <section className="col-span-12 xl:col-span-6 relative group p-[1px] rounded-3xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-${themeBg}/20 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-1000 blur-xl rounded-3xl`} />
          <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-royale h-full flex flex-col justify-between">
            
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-sm font-black text-ivory tracking-[0.2em] uppercase flex items-center gap-3">
                <Zap size={18} className="text-gold" />
                Multiplicador Base
              </h2>
              <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border flex items-center gap-2 ${themeBorder} ${themeColor} ${themeBg}/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {isSurge ? <Flame size={14} className="animate-pulse" /> : isHighDemand ? <TrendingUp size={14} /> : isLowDemand ? <TrendingDown size={14} /> : <Target size={14} />}
                {isSurge ? 'SURGE PRICING' : isHighDemand ? 'ALTA DEMANDA' : isLowDemand ? 'BAJA DEMANDA' : 'ESTABLE'}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 relative">
              {isSurge && <div className="absolute inset-0 bg-rose-500/5 rounded-full blur-3xl animate-pulse" />}
              <div className={`text-[6rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 relative z-10 drop-shadow-2xl`}>
                {multiplier.toFixed(2)}<span className={`text-3xl ml-2 ${themeColor}`}>x</span>
              </div>
              <p className="text-xs text-white/40 font-bold tracking-widest uppercase mt-6 relative z-10">Impacto directo en catálogo completo</p>
            </div>

            <div className="mt-auto px-4 relative z-10">
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.05" 
                value={multiplier} 
                onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
                className="w-full appearance-none bg-[#12121a] h-3 rounded-full outline-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, ${
                    isSurge ? '#f43f5e' : isHighDemand ? '#f97316' : isLowDemand ? '#60a5fa' : '#a3e635'
                  } ${(multiplier - 0.5) / 2.5 * 100}%, rgba(255,255,255,0.05) ${(multiplier - 0.5) / 2.5 * 100}%)`,
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}
              />
              <div className="flex justify-between text-[10px] font-black text-white/30 mt-4 uppercase tracking-widest">
                <span>0.5x<br/>Liq.</span>
                <span className="text-center">1.0x<br/>Base</span>
                <span className="text-right">3.0x<br/>Surge</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= METRICS ================= */}
        <section className="col-span-12 xl:col-span-6 grid grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* INGRESO PROYECTADO */}
          <div className="bg-[#0a0a0f]/80 border border-white/5 rounded-3xl p-8 flex flex-col justify-between group hover:border-lime/30 transition-all relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-lime/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start relative z-10">
              <h2 className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Proyección de Ingresos</h2>
              <div className="p-3 bg-lime/10 rounded-xl group-hover:scale-110 group-hover:bg-lime/20 transition-all">
                <TrendingUp size={18} className="text-lime" />
              </div>
            </div>
            <div className="relative z-10 mt-6">
              <p className="text-4xl font-black text-ivory tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>+$12,450</p>
              <p className="text-[9px] text-lime font-black tracking-widest uppercase mt-3 bg-lime/10 border border-lime/20 w-fit px-3 py-1 rounded-md shadow-inner">+14.2% respecto a ayer</p>
            </div>
          </div>

          {/* SATURACION */}
          <div className="bg-[#0a0a0f]/80 border border-white/5 rounded-3xl p-8 flex flex-col justify-between group hover:border-orange-500/30 transition-all relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start relative z-10">
              <h2 className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">Nivel de Saturación</h2>
              <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 group-hover:bg-orange-500/20 transition-all">
                <AlertTriangle size={18} className="text-orange-500" />
              </div>
            </div>
            <div className="relative z-10 mt-6">
              <p className="text-4xl font-black text-ivory tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>84<span className="text-2xl text-white/30 ml-1">%</span></p>
              <p className="text-[9px] text-orange-500 font-black tracking-widest uppercase mt-3 bg-orange-500/10 border border-orange-500/20 w-fit px-3 py-1 rounded-md shadow-inner">Tráfico Elevado</p>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS REALES */}
          <div className="col-span-2 bg-[#0a0a0f]/90 border border-white/5 rounded-3xl p-8 shadow-royale">
            <h2 className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
              <ChevronRight size={14} className={themeColor} /> Muestra de Impacto en Catálogo Real
            </h2>
            
            <div className="space-y-2">
              <div className="grid grid-cols-12 text-[10px] font-black text-white/40 uppercase tracking-widest px-5 py-3 bg-white/5 rounded-xl border border-white/5">
                <span className="col-span-6">Producto</span>
                <span className="col-span-3 text-center">Precio Base</span>
                <span className="col-span-3 text-right">Aplicado ({multiplier}x)</span>
              </div>
              
              {topProducts.length === 0 ? (
                 <p className="text-xs text-white/40 p-4 text-center">No hay productos en el inventario.</p>
              ) : (
                topProducts.map((prod) => (
                  <div key={prod._id} className="grid grid-cols-12 text-sm items-center px-5 py-3.5 bg-[#12121a] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                    <span className="col-span-6 text-ivory font-bold truncate pr-4 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${themeBg} shadow-[0_0_8px_currentColor] opacity-50`} />
                      {prod.name}
                    </span>
                    <span className="col-span-3 text-center text-white/50 font-medium">${prod.price.toFixed(2)}</span>
                    <span className={`col-span-3 text-right font-black ${themeColor} drop-shadow-md`}>
                      ${(prod.price * multiplier).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
