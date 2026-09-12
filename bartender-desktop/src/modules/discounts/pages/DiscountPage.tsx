"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Save, Loader2, CheckCircle2, X,
  RefreshCw, TrendingDown, AlertTriangle, Zap,
  Receipt, Tag,
} from "lucide-react";

import OrderList          from "../components/OrderList";
import OrderDetails       from "../components/OrderDetails";
import DiscountKeypad     from "../components/DiscountKeypad";
import DiscountReasonForm from "../components/DiscountReasonForm";
import DiscountStats      from "../components/DiscountStats";

import { useDiscount }     from "../hooks/useDiscount";
import { discountService } from "../services/discountService";
import TourGuide           from "../components/TourGuide";
import type { TourStep }   from "../components/TourGuide";
import type { Order, SelectedItem } from "../types/discounts";

/* ── Skeleton ──────────────────────────────────────────────────── */
const Sk = ({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg bg-white/6 animate-pulse`} />
);

/* ── Componente principal ──────────────────────────────────────── */
export default function NebulaDiscountPage() {
  const [mode,          setMode]          = useState<"simple" | "advanced">(() => {
    try { return localStorage.getItem("nebula_discount_mode") === "advanced" ? "advanced" : "simple"; }
    catch { return "simple"; }
  });
  const [tourOpen,      setTourOpen]      = useState(false);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [items,         setItems]         = useState<SelectedItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingApply,  setLoadingApply]  = useState(false);
  const [loadingStats,  setLoadingStats]  = useState(false);
  const [feedback,      setFeedback]      = useState<string | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [pasoActual,    setPasoActual]    = useState<1 | 2 | 3>(1);
  const [busqueda,      setBusqueda]      = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState<"todas" | "en-curso" | "completadas">("todas");
  const [stats,         setStats]         = useState({ todayTotal: 0, averagePercent: 0, appliedCount: 0 });
  const [dailyLimit,    setDailyLimit]    = useState<{
    remainingAmount: number; remainingCount: number; maxAmount: number; maxCount: number;
  } | null>(null);

  const discountPresets = { PERCENT: [10, 15, 20, 25, 50], FLAT: [10, 20, 50, 100] };
  const discount = useDiscount({ items });

  useEffect(() => {
    try { localStorage.setItem("nebula_discount_mode", mode); } catch {}
  }, [mode]);

  const tourSteps: TourStep[] = [
    { target: "[data-tour='orders-list']",    title: "Órdenes",           content: "Seleccioná la orden a la que querés aplicar el descuento.", position: "right" },
    { target: "[data-tour='order-details']",  title: "Ítems",             content: "Marcá los ítems sobre los que aplica el descuento.",        position: "left"  },
    { target: "[data-tour='discount-keypad']",title: "Calculadora",       content: "Ingresá el valor del descuento (% o monto fijo).",          position: "left"  },
    { target: "[data-tour='discount-reason']",title: "Motivo",            content: "Seleccioná el motivo del descuento.",                       position: "left"  },
    { target: "[data-tour='apply-btn']",      title: "Aplicar",           content: "Confirmá y aplicá el descuento a la orden.",               position: "top"   },
  ];

  /* ── Carga ─────────────────────────────────────────────────── */
  const cargarOrdenes = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingOrders(true);
      const datos = await discountService.getActiveOrders(signal);
      setOrders(datos);
      setSelectedOrder((prev) =>
        !prev ? datos[0] ?? null : datos.find((o) => o._id === prev._id) ?? datos[0] ?? null
      );
    } catch (e: any) { if (e.name !== "AbortError") setError(e.message || "Error al cargar órdenes"); }
    finally { setLoadingOrders(false); }
  }, []);

  const cargarEstadisticas = useCallback(async (signal?: AbortSignal) => {
    try { setLoadingStats(true); setStats(await discountService.getTodayStats(signal)); }
    catch {}
    finally { setLoadingStats(false); }
  }, []);

  const cargarLimite = useCallback(async (signal?: AbortSignal) => {
    try { const r = await discountService.getDailyLimitRemaining(signal); setDailyLimit(r.remaining); }
    catch {}
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    cargarOrdenes(ctrl.signal);
    cargarEstadisticas(ctrl.signal);
    cargarLimite(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (!selectedOrder) { setPasoActual(1); setItems([]); return; }
    setItems(selectedOrder.items.map((i) => ({ ...i, selected: false })));
    setPasoActual(1);
    discount.reset();
  }, [selectedOrder?._id]);

  /* ── Acciones ──────────────────────────────────────────────── */
  const aplicarRapido = useCallback(async (pct: number) => {
    if (!selectedOrder) return;
    setItems(items.map((i) => ({ ...i, selected: true })));
    discount.setType("PERCENT"); discount.setValue(pct.toString()); discount.setReason("COMP");
    setPasoActual(3);
  }, [selectedOrder, items, discount]);

  const reiniciar = useCallback(() => { discount.reset(); setPasoActual(1); setError(null); setFeedback(null); }, [discount]);

  const aplicar = async () => {
    if (!selectedOrder || !discount.isValid) { setError(discount.errors[0] || "Datos inválidos"); return; }
    try {
      setLoadingApply(true); setError(null); setFeedback(null);
      await discountService.applyDiscount(discount.buildPayload(selectedOrder._id));
      setFeedback("Descuento aplicado correctamente");
      discount.reset(); setPasoActual(1);
      await Promise.all([cargarOrdenes(), cargarEstadisticas()]);
    } catch (e: any) { setError(e.message || "Error al aplicar descuento"); }
    finally { setLoadingApply(false); }
  };

  /* ── Filtrado ──────────────────────────────────────────────── */
  const ordenesFiltradas = orders.filter((o) => {
    const q = busqueda.toLowerCase();
    const matchSearch = !q || o.table.toString().toLowerCase().includes(q) ||
      o.items.some((i) => i.name.toLowerCase().includes(q));
    const matchEstado = filtroEstado === "todas" ||
      (filtroEstado === "en-curso"    && o.status !== "completed") ||
      (filtroEstado === "completadas" && o.status === "completed");
    return matchSearch && matchEstado;
  });

  /* ── Pasos ─────────────────────────────────────────────────── */
  const STEPS = [
    { n: 1, label: "Seleccionar", ok: !!selectedOrder },
    { n: 2, label: "Calcular",    ok: items.some((i) => i.selected) && Number(discount.valueInput) > 0 },
    { n: 3, label: "Aplicar",     ok: discount.isValid },
  ];

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="w-full space-y-4">

      {/* ── Toolbar superior ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-white/8 bg-white/3">

        {/* Modo simple/avanzado */}
        <div className="flex items-center gap-0.5 p-1 bg-white/5 border border-white/8 rounded-xl">
          {(["simple", "advanced"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all capitalize ${
                mode === m ? "bg-gold/15 text-gold border border-gold/25" : "text-muted hover:text-ivory"
              }`}>
              {m === "simple" ? "Simple" : "Avanzado"}
            </button>
          ))}
        </div>

        {/* Acciones rápidas */}
        <button type="button" onClick={() => aplicarRapido(10)} disabled={!selectedOrder}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold/8 border border-gold/15 text-gold text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all">
          <Zap size={13} /> -10%
        </button>
        <button type="button" onClick={() => aplicarRapido(15)} disabled={!selectedOrder}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/8 border border-violet-500/15 text-violet-300 text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all">
          <Zap size={13} /> -15%
        </button>
        <button type="button" onClick={() => { cargarOrdenes(); cargarEstadisticas(); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-muted hover:text-ivory text-xs transition-colors">
          <RefreshCw size={13} className={(loadingOrders || loadingStats) ? "animate-spin" : ""} />
        </button>

        {/* Límite diario (modo avanzado) */}
        {mode === "advanced" && dailyLimit && (
          <div className="flex-1 min-w-[200px] flex items-center gap-3 px-3 py-2 rounded-xl border border-white/8 bg-white/3">
            <TrendingDown size={14} className="text-gold flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-muted">Límite diario</span>
                <span className={`font-bold ${dailyLimit.remainingAmount < 100 ? "text-red-400" : dailyLimit.remainingAmount < 300 ? "text-amber-400" : "text-emerald-400"}`}>
                  ${dailyLimit.remainingAmount.toFixed(0)} / ${dailyLimit.maxAmount}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/8">
                <div className={`h-full rounded-full transition-all ${
                  dailyLimit.remainingAmount < 100 ? "bg-red-500" : dailyLimit.remainingAmount < 300 ? "bg-amber-400" : "bg-emerald-500"
                }`} style={{ width: `${(dailyLimit.remainingAmount / dailyLimit.maxAmount) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        <button type="button" onClick={() => setTourOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 text-muted hover:text-ivory text-xs transition-colors">
          Ayuda
        </button>
      </div>

      {/* ── Stepper (modo avanzado) ────────────────────────────── */}
      {mode === "advanced" && (
        <div className="flex items-center gap-2">
          {STEPS.map(({ n, label, ok }, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 transition-all ${
                pasoActual >= n
                  ? "bg-gold/10 border-gold/25 text-gold"
                  : "bg-white/3 border-white/8 text-muted"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  pasoActual > n ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" :
                  pasoActual === n ? "bg-gold/20 border border-gold/30 text-gold" :
                  "bg-white/5 border border-white/10 text-muted"
                }`}>
                  {pasoActual > n ? <CheckCircle2 size={11} /> : n}
                </div>
                <span className="text-[11px] font-semibold hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-4 rounded-full flex-shrink-0 ${pasoActual > n ? "bg-gold/40" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Mensajes ──────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <div className="flex items-center gap-2"><AlertTriangle size={14} />{error}</div>
          <button type="button" onClick={() => setError(null)}><X size={13} /></button>
        </div>
      )}
      {feedback && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <div className="flex items-center gap-2"><CheckCircle2 size={14} />{feedback}</div>
          <button type="button" onClick={() => setFeedback(null)}><X size={13} /></button>
        </div>
      )}

      {/* ── Layout 3 columnas ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── Col izquierda: órdenes ─────────────────────────── */}
        <div className="lg:col-span-3" data-tour="orders-list">
          <div className="rounded-2xl border border-white/8 bg-surface-3/40 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Receipt size={14} className="text-gold" />
                </div>
                <h3 className="text-sm font-bold text-ivory">Órdenes</h3>
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold">
                {ordenesFiltradas.length}
              </span>
            </div>

            <div className="p-3 space-y-2">
              <input type="text" placeholder="Buscar por mesa…" value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-ivory placeholder:text-muted/40 focus:outline-none focus:border-gold/35 transition-colors" />
              <div className="flex gap-1">
                {(["todas", "en-curso", "completadas"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFiltroEstado(f)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                      filtroEstado === f ? "bg-gold/15 text-gold border border-gold/20" : "bg-white/4 text-muted hover:text-ivory"
                    }`}>
                    {f === "todas" ? "Todas" : f === "en-curso" ? "Activas" : "Compl."}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <OrderList orders={ordenesFiltradas} selectedOrderId={selectedOrder?._id}
                loading={loadingOrders}
                onSelectOrder={(o) => { setSelectedOrder(o); setPasoActual(1); }} />
            </div>
          </div>
        </div>

        {/* ── Col centro: detalles + calculadora ────────────────── */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Detalles de orden */}
          <div className="rounded-2xl border border-white/8 bg-surface-3/40" data-tour="order-details">
            <div className="flex items-center justify-between p-4 border-b border-white/6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Tag size={14} className="text-violet-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ivory">Ítems de la orden</h3>
                  {selectedOrder && (
                    <p className="text-[10px] text-muted mt-0.5">
                      Mesa {typeof selectedOrder.table === "object" ? selectedOrder.table?.number : selectedOrder.table}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4">
              {selectedOrder ? (
                <OrderDetails order={selectedOrder} items={items}
                  setItems={(updated) => {
                    setItems(updated);
                    if (updated.some((i) => i.selected) && pasoActual === 1) setPasoActual(2);
                  }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Receipt size={32} className="text-muted/20 mb-3" />
                  <p className="text-sm font-semibold text-muted">Seleccioná una orden</p>
                  <p className="text-xs text-muted/50 mt-1">Elegí una orden de la lista de la izquierda</p>
                </div>
              )}
            </div>
          </div>

          {/* Teclado */}
          {selectedOrder && (
            <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-4" data-tour="discount-keypad">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles size={14} className="text-emerald-300" />
                </div>
                <h3 className="text-sm font-bold text-ivory">Calculadora de descuento</h3>
              </div>
              <DiscountKeypad type={discount.type}
                setType={(t) => { discount.setType(t); if (pasoActual === 1) setPasoActual(2); }}
                value={discount.value} valueInput={discount.valueInput}
                appendNumber={discount.appendNumber} removeLast={discount.removeLast}
                presets={discountPresets} />
            </div>
          )}
        </div>

        {/* ── Col derecha: resumen + motivo + acciones ───────────── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Resumen */}
          {selectedOrder && (
            <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <TrendingDown size={14} className="text-cyan-300" />
                </div>
                <h3 className="text-sm font-bold text-ivory">Resumen</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-bold text-ivory">${discount.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Descuento</span>
                  <span className={`font-bold ${discount.type === "PERCENT" ? "text-gold" : "text-violet-300"}`}>
                    −${discount.discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-white/8" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-ivory">Total</span>
                  <span className="text-xl font-extrabold text-gold">${discount.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Motivo */}
          {selectedOrder && (
            <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-4" data-tour="discount-reason">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Tag size={14} className="text-gold" />
                </div>
                <h3 className="text-sm font-bold text-ivory">Motivo</h3>
              </div>
              <DiscountReasonForm reason={discount.reason}
                setReason={(r) => { discount.setReason(r); if (pasoActual === 2) setPasoActual(3); }}
                note={discount.note} setNote={discount.setNote} />
            </div>
          )}

          {/* Errores de validación */}
          {!discount.isValid && discount.valueInput && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-4 space-y-2">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Corrige:</p>
              {discount.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-300 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{e}
                </p>
              ))}
            </div>
          )}

          {/* Botones de acción */}
          {selectedOrder && (
            <div className="space-y-2" data-tour="apply-btn">
              <button type="button" onClick={aplicar}
                disabled={!discount.isValid || loadingApply}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-bg font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_14px_rgba(212,163,64,0.22)]">
                {loadingApply
                  ? <><Loader2 size={16} className="animate-spin" />Aplicando…</>
                  : <><Save size={16} />Aplicar descuento</>
                }
              </button>
              <button type="button" onClick={reiniciar}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-muted hover:text-ivory hover:bg-white/5 text-xs font-semibold transition-colors">
                <X size={14} />Cancelar
              </button>
            </div>
          )}

          {/* Estadísticas (modo avanzado) */}
          {mode === "advanced" && (
            <div className="rounded-2xl border border-white/8 bg-surface-3/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles size={14} className="text-emerald-300" />
                </div>
                <h3 className="text-sm font-bold text-ivory">Estadísticas del día</h3>
              </div>
              <DiscountStats data={stats} loading={loadingStats} />
            </div>
          )}
        </div>
      </div>

      <TourGuide steps={tourSteps} isOpen={tourOpen}
        onClose={() => setTourOpen(false)} storageKey="nebula_discount_tour_v1" />
    </div>
  );
}
