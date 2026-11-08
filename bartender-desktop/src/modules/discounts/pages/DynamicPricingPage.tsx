"use client";

/**
 * DynamicPricingPage — Multiplicador global de precios.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Colores dinámicos según el valor del multiplicador:
 *   < 0.8x  → Azul   (demanda baja)
 *   0.8-1.2x → Verde (estable)
 *   1.2-2.0x → Naranja (alta demanda)
 *   ≥ 2.0x  → Rojo   (surge — alerta)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Zap, TrendingUp, Target, Activity, AlertTriangle,
  RefreshCw, Info, Package,
} from "lucide-react";
import { pricingService } from "../services/pricingService";
import { getProducts }    from "../../products/services/productService";
import type { Product }   from "../../../types/product";

/* ── Helpers ───────────────────────────────────────────────── */
function multLabel(m: number) {
  if (m >= 2.0) return "SURGE";
  if (m >= 1.2) return "ALTA";
  if (m <  0.8) return "BAJA";
  return "ESTABLE";
}

function multColors(m: number) {
  if (m >= 2.0) return { text: "#F85149", border: "rgba(248,81,73,0.25)",   bg: "rgba(248,81,73,0.06)",  bar: "#F85149", glow: "rgba(248,81,73,0.12)"  };
  if (m >= 1.2) return { text: "#FF7B54", border: "rgba(255,123,84,0.25)",  bg: "rgba(255,123,84,0.06)", bar: "#FF7B54", glow: "rgba(255,123,84,0.10)" };
  if (m <  0.8) return { text: "#388BFD", border: "rgba(56,139,253,0.25)",  bg: "rgba(56,139,253,0.06)", bar: "#388BFD", glow: "rgba(56,139,253,0.10)" };
  return           { text: "#3FB950", border: "rgba(63,185,80,0.25)",   bg: "rgba(63,185,80,0.06)",  bar: "#3FB950", glow: "rgba(63,185,80,0.10)"  };
}

/* ── Skeleton ──────────────────────────────────────────────── */
const Sk = ({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg animate-pulse`} style={{ background: "#21283A" }} />
);

/* ── Componente ────────────────────────────────────────────── */
export default function DynamicPricingPage() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const colors    = multColors(multiplier);
  const sliderPct = ((multiplier - 0.5) / 2.5) * 100;

  const avgOriginal = products.length
    ? products.reduce((s, p) => s + (p.price ?? 0), 0) / products.length
    : 0;
  const avgAdjusted = avgOriginal * multiplier;
  const totalImpact = products.reduce((s, p) => s + ((p.price ?? 0) * multiplier - (p.price ?? 0)), 0);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 rounded-xl p-5 space-y-4" style={{ background: "#161B22", border: "1px solid #30363D" }}>
            {Array.from({ length: 4 }).map((_, i) => <Sk key={i} h="h-8" />)}
          </div>
          <div className="lg:col-span-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => <Sk key={i} h="h-28" />)}
          </div>
          <div className="lg:col-span-3 rounded-xl p-5 space-y-3" style={{ background: "#161B22", border: "1px solid #30363D" }}>
            {Array.from({ length: 5 }).map((_, i) => <Sk key={i} h="h-12" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 relative">

      {/* Atmósfera dinámica según multiplicador */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-15 transition-colors duration-700"
        style={{ background: `radial-gradient(ellipse 60% 40% at 70% 20%, ${colors.glow}, transparent)` }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── COL 1: control del multiplicador ─────────── */}
        <div className="lg:col-span-3">
          <div
            className="rounded-xl p-5 flex flex-col gap-5 h-full"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <Zap size={14} style={{ color: colors.text }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Multiplicador</span>
              </div>
              <div
                className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={{ border: `1px solid ${colors.border}`, color: colors.text }}
              >
                {multLabel(multiplier)}
              </div>
            </div>

            {/* Valor central */}
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <span className="text-6xl font-extrabold tracking-tight" style={{ color: "#E6EDF3" }}>
                  {multiplier.toFixed(2)}
                </span>
                <span className="text-2xl font-black ml-1" style={{ color: colors.text }}>x</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest mt-2" style={{ color: "#566270" }}>
                Impacto global
              </p>
              {saving    && <p className="text-[10px] mt-1 animate-pulse" style={{ color: "#F0B429" }}>Guardando…</p>}
              {saveError && <p className="text-[10px] mt-1" style={{ color: "#F85149" }}>{saveError}</p>}
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <input
                type="range" min="0.5" max="3" step="0.05"
                value={multiplier}
                onChange={(e) => handleSlider(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full outline-none cursor-pointer appearance-none"
                style={{
                  background: `linear-gradient(to right, ${colors.bar} ${sliderPct}%, #30363D ${sliderPct}%)`,
                }}
              />
              <div
                className="flex justify-between text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "#566270" }}
              >
                <span>0.5x</span><span>1.0x</span><span>1.5x</span><span>2x</span><span>3x</span>
              </div>
            </div>

            {/* Presets rápidos */}
            <div className="grid grid-cols-3 gap-1.5">
              {[0.8, 1.0, 1.2, 1.5, 2.0, 2.5].map((p) => {
                const isActive = Math.abs(multiplier - p) < 0.02;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleSlider(p)}
                    className="py-1.5 rounded-xl text-[11px] font-bold transition-all"
                    style={{
                      background:  isActive ? colors.bg   : "#21283A",
                      border:      `1px solid ${isActive ? colors.border : "#30363D"}`,
                      color:       isActive ? colors.text : "#566270",
                    }}
                  >
                    {p}x
                  </button>
                );
              })}
            </div>

            {/* Nota */}
            <div
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: "#21283A", border: "1px solid #30363D" }}
            >
              <Info size={11} style={{ color: "#566270", flexShrink: 0, marginTop: 1 }} />
              <p className="text-[10px] leading-relaxed" style={{ color: "#566270" }}>
                El multiplicador se aplica al precio base de todos los productos en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* ── COL 2: métricas ──────────────────────────── */}
        <div className="lg:col-span-6 flex flex-col gap-4">

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Precio promedio ajustado */}
            <div
              className="rounded-xl p-5"
              style={{ background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.20)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#566270" }}>
                  Precio prom. ajustado
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.30)" }}
                >
                  <TrendingUp size={12} style={{ color: "#F0B429" }} />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: "#E6EDF3" }}>
                ${avgAdjusted.toFixed(2)}
              </p>
              <p className="text-[10px] mt-1.5" style={{ color: "#566270" }}>
                Original: ${avgOriginal.toFixed(2)} · Δ{((multiplier - 1) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Impacto total */}
            <div
              className="rounded-xl p-5"
              style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.text }}>
                  Impacto en muestra
                </p>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                >
                  <Activity size={12} style={{ color: colors.text }} />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight" style={{ color: totalImpact >= 0 ? colors.text : "#F85149" }}>
                {totalImpact >= 0 ? "+" : ""}${totalImpact.toFixed(2)}
              </p>
              <p className="text-[10px] mt-1.5" style={{ color: "#566270" }}>
                {products.length} productos · vs. precios base
              </p>
            </div>
          </div>

          {/* Estado del mercado */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: "#161B22", border: "1px solid #30363D" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#566270" }}>
              Estado del mercado
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: "Liquidez", pct: Math.max(10, 100 - sliderPct * 0.6) },
                { label: "Demanda",  pct: Math.min(98, sliderPct * 0.85) },
                { label: "Carga",    pct: Math.min(95, sliderPct) },
              ].map(({ label, pct }) => (
                <div key={label} className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span style={{ color: "#566270" }}>{label}</span>
                    <span className="font-bold" style={{ color: "#E6EDF3" }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full" style={{ background: "#30363D" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: colors.bar }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advertencias contextuales */}
          {multiplier >= 2.0 && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)" }}
            >
              <AlertTriangle size={14} style={{ color: "#F85149", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#F85149" }}>Modo Surge activo</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#566270" }}>
                  Los precios superan 2x el valor base. Considerá el impacto en la satisfacción.
                </p>
              </div>
            </div>
          )}
          {multiplier < 0.8 && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "rgba(56,139,253,0.06)", border: "1px solid rgba(56,139,253,0.20)" }}
            >
              <Info size={14} style={{ color: "#388BFD", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#388BFD" }}>Precios reducidos</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#566270" }}>
                  Modo demanda baja. Verificá el margen de ganancia antes de continuar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── COL 3: productos afectados ───────────────── */}
        <div className="lg:col-span-3">
          <div
            className="rounded-xl p-5 flex flex-col gap-4 h-full"
            style={{ background: "#161B22", border: "1px solid #30363D" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(163,113,247,0.12)", border: "1px solid rgba(163,113,247,0.25)" }}
                >
                  <Target size={13} style={{ color: "#A371F7" }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Impacto por producto</span>
              </div>
              <button
                type="button"
                onClick={load}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#566270" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-2" style={{ opacity: 0.40 }}>
                <Package size={24} style={{ color: "#566270" }} />
                <p className="text-xs" style={{ color: "#566270" }}>Sin productos cargados</p>
              </div>
            ) : (
              <div
                className="space-y-1.5 flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}
              >
                {products.map((prod) => {
                  const basePrice = prod.price ?? 0;
                  const adjusted  = basePrice * multiplier;
                  const delta     = adjusted - basePrice;
                  const isUp      = delta >= 0;
                  return (
                    <div
                      key={prod._id}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                      style={{ background: "#21283A", border: "1px solid #30363D" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#3D444D"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#30363D"; }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#E6EDF3" }}>{prod.name}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "#566270" }}>${basePrice.toFixed(2)} base</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold" style={{ color: colors.text }}>
                          ${adjusted.toFixed(2)}
                        </p>
                        <p className="text-[9px] font-bold" style={{ color: isUp ? "#3FB950" : "#F85149" }}>
                          {isUp ? "+" : ""}{delta.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Resumen */}
            <div
              className="p-3 rounded-xl"
              style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#566270" }}>
                Productos afectados
              </p>
              <p className="text-2xl font-extrabold" style={{ color: colors.text }}>{products.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
