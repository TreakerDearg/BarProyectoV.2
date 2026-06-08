"use client";

import { useState, useEffect } from "react";
import { pricingService } from "../services/pricingService";
import { getProducts } from "../../products/services/productService";
import type { Product } from "../../../types/product";
import { Activity, TrendingUp, TrendingDown, Target, Zap, ChevronRight, AlertTriangle, Flame } from "lucide-react";
import DiscountsSuiteTutorial from "../components/DiscountsSuiteTutorial";

export default function NebulaDynamicPricingPage() {
  const [tutorialOpen, setTutorialOpen] = useState(false);
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
    <div className="discounts-root">
      <div className="discounts-shell discounts-page-frame relative overflow-hidden animate-fade-in">
      {/* ATMOSPHERIC GLOW */}
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] -z-10 pointer-events-none transition-colors duration-1000 ${themeBg} opacity-10`} />

      <div className="discounts-title-band">
        <p className="text-xs font-bold tracking-wider uppercase text-amber-200">Ajuste de precio por demanda</p>
        <p className="text-xs text-amber-100/80">Controla margen sin perder ritmo de servicio</p>
      </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 relative z-10">
        {/* =========================
            COLUMNA IZQUIERDA: CONTROL DE MULTIPLICADOR (3 columnas)
        ========================= */}
        <div className="lg:col-span-3">
          <div className="nebula-discounts-panel p-6 rounded-3xl h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className={`p-2 bg-${themeBg}/10 rounded-xl`}>
                  <Zap size={18} className={themeColor} />
                </div>
                <h3 className="text-sm font-bold text-white">Multiplicador</h3>
              </div>
              <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${themeBorder} ${themeColor} ${themeBg}/10`}>
                {isSurge ? 'SURGE' : isHighDemand ? 'ALTA' : isLowDemand ? 'BAJA' : 'ESTABLE'}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-8 relative">
              <div className={`text-5xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 relative z-10`}>
                {multiplier.toFixed(2)}<span className={`text-2xl ml-1 ${themeColor}`}>x</span>
              </div>
              <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mt-4">Impacto global</p>
            </div>

            <div className="mt-auto">
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.05" 
                value={multiplier} 
                onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
                className="w-full appearance-none bg-surface-3 h-2 rounded-full outline-none cursor-pointer" 
                style={{
                  background: `linear-gradient(to right, ${
                    isSurge ? '#f43f5e' : isHighDemand ? '#f97316' : isLowDemand ? '#60a5fa' : '#a3e635'
                  } ${(multiplier - 0.5) / 2.5 * 100}%, rgba(255,255,255,0.05) ${(multiplier - 0.5) / 2.5 * 100}%)`,
                }}
              />
              <div className="flex justify-between text-[9px] font-black text-white/30 mt-3 uppercase tracking-widest">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>3.0x</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            COLUMNA CENTRO: MÉTRICAS (6 columnas)
        ========================= */}
        <div className="lg:col-span-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* INGRESO PROYECTADO */}
            <div className="nebula-discounts-panel p-5 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Ingresos</h3>
                <div className="p-2 bg-lime/10 rounded-lg">
                  <TrendingUp size={16} className="text-lime" />
                </div>
              </div>
              <p className="text-3xl font-black text-ivory tracking-tighter">+$12,450</p>
              <p className="text-[9px] text-lime font-black uppercase mt-2 bg-lime/10 border border-lime/20 w-fit px-2 py-1 rounded">+14.2% vs ayer</p>
            </div>

            {/* SATURACION */}
            <div className="nebula-discounts-panel p-5 rounded-3xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Saturación</h3>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle size={16} className="text-orange-500" />
                </div>
              </div>
              <p className="text-3xl font-black text-ivory tracking-tighter">84<span className="text-xl text-white/30 ml-1">%</span></p>
              <p className="text-[9px] text-orange-500 font-black uppercase mt-2 bg-orange-500/10 border border-orange-500/20 w-fit px-2 py-1 rounded">Tráfico alto</p>
            </div>

            {/* IMPACTO VISUAL */}
            <div className="col-span-2 nebula-discounts-panel p-5 rounded-3xl">
              <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Estado del Mercado</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${themeBg}`}
                      style={{ width: `${((multiplier - 0.5) / 2.5) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-white/30 mt-2 uppercase">
                    <span>Liquidez</span>
                    <span>Demanda</span>
                    <span>Surge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            COLUMNA DERECHA: PRODUCTOS Y CONFIGURACIÓN (3 columnas)
        ========================= */}
        <div className="lg:col-span-3">
          <div className="nebula-discounts-panel p-5 rounded-3xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 bg-${themeBg}/10 rounded-lg`}>
                <Target size={16} className={themeColor} />
              </div>
              <h3 className="text-sm font-bold text-white">Impacto</h3>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {topProducts.length === 0 ? (
                <p className="text-xs text-white/40 p-4 text-center">Sin productos</p>
              ) : (
                topProducts.map((prod) => (
                  <div key={prod._id} className="p-3 bg-surface-3 border border-white/5 rounded-xl">
                    <p className="text-xs font-bold text-ivory truncate mb-2">{prod.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-white/50">${prod.price.toFixed(2)}</span>
                      <span className={`text-sm font-black ${themeColor}`}>
                        ${(prod.price * multiplier).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">Productos afectados</p>
                <p className="text-2xl font-bold text-white">{topProducts.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DiscountsSuiteTutorial isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      </div>
    </div>
  );
}


