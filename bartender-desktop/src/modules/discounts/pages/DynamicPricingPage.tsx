"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap, TrendingUp, Target, Activity, AlertTriangle,
  RefreshCw, Info, Package,
} from "lucide-react";
import { pricingService } from "../services/pricingService";
import { getProducts }    from "../../products/services/productService";
import type { Product }   from "../../../types/product";

/* ── helpers ──────────────────────────────────────────────────── */
function multLabel(m: number) {
  if (m >= 2.0) return "SURGE";
  if (m >= 1.2) return "ALTA";
  if (m <  0.8) return "BAJA";
  return "ESTABLE";
}
function multColors(m: number) {
  if (m >= 2.0) return { text: "text-red-400",    border: "border-red-500/25",    bg: "bg-red-500/8",    bar: "bg-red-500",    glow: "rgba(239,68,68,0.12)"   };
  if (m >= 1.2) return { text: "text-amber-400",  border: "border-amber-500/25",  bg: "bg-amber-500/8",  bar: "bg-amber-400",  glow: "rgba(245,158,11,0.10)"  };
  if (m <  0.8) return { text: "text-sky-400",    border: "border-sky-500/25",    bg: "bg-sky-500/8",    bar: "bg-sky-400",    glow: "rgba(56,189,248,0.10)"  };
  return           { text: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/8", bar: "bg-emerald-500", glow: "rgba(52,211,153,0.10)"  };
}

/* ── skeleton ─────────────────────────────────────────────────── */
const Sk = ({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/6 animate-pulse`} />
);

/* ── componente ───────────────────────────────────────────────── */
export default function NebulaDynamicPricingPage() {
  const [multiplier,   setMultiplier]   = useState(1.0);
  const [products,     setProducts]     = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── carga ─────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mult, prods] = await Promise.all([
        pricingService.getGlobalMultiplier(),
        getProducts(),
      ]);
      setMultiplier(mult);
      setProducts((prods || []).slice(0, 8));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── slider con debounce de 400ms ─────────────────────────── */
  const handleSlider = (val: number) => {
    setMultiplier(val);
    setSaveError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try { await pricingService.updateGlobalMultiplier(val); }
      catch { setSaveError("Error al guardar el multiplicador"); }
      finally { setSaving(false); }
    }, 400);
  };

  const colors = multColors(multiplier);
  const sliderPct = ((multiplier - 0.5) / 2.5) * 100;

  /* ── KPI calculados ─────────────────────────────────────────── */
  const avgOriginal = products.length
    ? products.reduce((s, p) => s + p.price, 0) / products.length
    : 0;
  const avgAdjusted = avgOriginal * multiplier;
  const totalImpact = products.reduce((s, p) => s + (p.price * multiplier - p.price), 0);

  /* ── render ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-surface-3/40 p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Sk key={i} h="h-8" />)}
          </div>
          <div className="lg:col-span-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => <Sk key={i} h="h-28" />)}
          </div>
          <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-surface-3/40 p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Sk key={i} h="h-12" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">

      {/* ── Atmósfera sutil ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-20 transition-colors duration-700"
        style={{ background: `radial-gradient(ellipse 60% 40% at 70% 20%, ${colors.glow}, transparent)` }}
      />

      {/* ── Grid principal ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── COL 1: control del multiplicador ───────────────────── */}
        <div className="lg:col-span-3">
          <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 flex flex-col gap-5 h-full`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                  <Zap size={15} className={colors.text} />
                </div>
                <span className="text-sm font-bold text-ivory">Multiplicador</span>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors.border} ${colors.text}`}>
                {multLabel(multiplier)}
              </div>
            </div>

            {/* Valor central */}
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <span className="text-6xl font-extrabold text-ivory tracking-tight">
                  {multiplier.toFixed(2)}
                </span>
                <span className={`text-2xl font-black ml-1 ${colors.text}`}>x</span>
              </div>
              <p className="text-[10px] text-muted/50 uppercase tracking-widest mt-2">Impacto global</p>
              {saving  && <p className="text-[10px] text-gold mt-1 animate-pulse">Guardando…</p>}
              {saveError && <p className="text-[10px] text-red-400 mt-1">{saveError}</p>}
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <input
                type="range" min="0.5" max="3" step="0.05"
                value={multiplier}
                onChange={(e) => handleSlider(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full outline-none cursor-pointer appearance-none"
                style={{
                  background: `linear-gradient(to right, ${
                    multiplier >= 2.0 ? "#ef4444" : multiplier >= 1.2 ? "#f59e0b" : multiplier < 0.8 ? "#38bdf8" : "#34d399"
                  } ${sliderPct}%, rgba(255,255,255,0.06) ${sliderPct}%)`,
                }}
              />
              <div className="flex justify-between text-[9px] font-bold text-muted/40 uppercase tracking-widest">
                <span>0.5x</span><span>1.0x</span><span>1.5x</span><span>2x</span><span>3x</span>
              </div>
            </div>

            {/* Presets rápidos */}
            <div className="grid grid-cols-3 gap-1.5">
              {[0.8, 1.0, 1.2, 1.5, 2.0, 2.5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSlider(p)}
                  className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    Math.abs(multiplier - p) < 0.02
                      ? `${colors.bg} ${colors.border} ${colors.text}`
                      : "bg-white/4 border-white/8 text-muted hover:text-ivory hover:bg-white/8"
                  }`}
                >
                  {p}x
                </button>
              ))}
            </div>

            {/* Nota */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/4 border border-white/7">
              <Info size={12} className="text-muted/50 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted/60 leading-relaxed">
                El multiplicador se aplica al precio base de todos los productos en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* ── COL 2: métricas ───────────────────────────────────── */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Precio promedio ajustado */}
            <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Precio prom. ajustado</p>
                <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <TrendingUp size={13} className="text-gold" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-ivory tracking-tight">${avgAdjusted.toFixed(2)}</p>
              <p className="text-[10px] text-muted/60 mt-1.5">
                Original: ${avgOriginal.toFixed(2)} · Δ{((multiplier - 1) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Impacto total */}
            <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>Impacto en muestra</p>
                <div className={`w-7 h-7 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                  <Activity size={13} className={colors.text} />
                </div>
              </div>
              <p className={`text-3xl font-extrabold tracking-tight ${totalImpact >= 0 ? colors.text : "text-red-400"}`}>
                {totalImpact >= 0 ? "+" : ""}${totalImpact.toFixed(2)}
              </p>
              <p className="text-[10px] text-muted/60 mt-1.5">
                {products.length} productos · vs. precios base
              </p>
            </div>
          </div>

          {/* Barra de estado del mercado */}
          <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 space-y-3">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Estado del mercado</p>
            <div className="flex items-center gap-4">
              {[
                { label: "Liquidez",    pct: Math.max(10, 100 - sliderPct * 0.6) },
                { label: "Demanda",     pct: Math.min(98, sliderPct * 0.85) },
                { label: "Carga",       pct: Math.min(95, sliderPct) },
              ].map(({ label, pct }) => (
                <div key={label} className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted">{label}</span>
                    <span className="font-bold text-ivory">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zona de advertencias */}
          {multiplier >= 2.0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 flex items-start gap-3">
              <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-300">Modo Surge activo</p>
                <p className="text-[11px] text-muted/70 mt-0.5">
                  Los precios superan 2x el valor base. Considerá el impacto en la satisfacción de los clientes.
                </p>
              </div>
            </div>
          )}
          {multiplier < 0.8 && (
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/8 p-4 flex items-start gap-3">
              <Info size={15} className="text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-sky-300">Precios reducidos</p>
                <p className="text-[11px] text-muted/70 mt-0.5">
                  Modo demanda baja. Útil para promociones, pero verificá el margen de ganancia.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── COL 3: lista de productos afectados ─────────────────── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Target size={14} className="text-violet-300" />
                </div>
                <span className="text-sm font-bold text-ivory">Impacto por producto</span>
              </div>
              <button
                type="button"
                onClick={load}
                className="p-1.5 rounded-lg hover:bg-white/8 text-muted hover:text-ivory transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <Package size={28} className="text-muted/20 mb-2" />
                <p className="text-xs text-muted/50">Sin productos cargados</p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {products.map((prod) => {
                  const adjusted = prod.price * multiplier;
                  const delta    = adjusted - prod.price;
                  const isUp     = delta >= 0;
                  return (
                    <div key={prod._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:border-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-ivory truncate">{prod.name}</p>
                        <p className="text-[10px] text-muted mt-0.5">${prod.price.toFixed(2)} base</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-extrabold ${colors.text}`}>${adjusted.toFixed(2)}</p>
                        <p className={`text-[9px] font-bold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                          {isUp ? "+" : ""}{delta.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resumen pie */}
            <div className={`p-3 rounded-xl border ${colors.border} ${colors.bg}`}>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Productos afectados</p>
              <p className={`text-2xl font-extrabold ${colors.text}`}>{products.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
