"use client";

/**
 * DiscountPage — Vista de descuentos manuales.
 * REDISEÑO v3.0 — Slate Elegante
 *
 * Flujo: Orden (dorado) → Ítems (verde) → Aplicar (verde).
 * Layout 3 columnas: órdenes | detalles+keypad | resumen+motivo+acciones.
 */
import { useState, useEffect, useCallback } from "react";
import {
  Save, Loader2, CheckCircle2, X,
  RefreshCw, TrendingDown, AlertTriangle, Zap,
  Receipt, Tag, MessageSquare,
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

/* ── Skeleton ──────────────────────────────────────────────── */
const Sk = ({ w = "w-full", h = "h-4" }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} rounded-lg animate-pulse`} style={{ background: "#21283A" }} />
);

/* ── Componente principal ──────────────────────────────────── */
export default function DiscountPage() {
  const [mode, setMode] = useState<"simple" | "advanced">(() => {
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
  const discount        = useDiscount({ items });

  useEffect(() => {
    try { localStorage.setItem("nebula_discount_mode", mode); } catch {}
  }, [mode]);

  const tourSteps: TourStep[] = [
    { target: "[data-tour='orders-list']",    title: "Órdenes",     content: "Seleccioná la orden a la que querés aplicar el descuento.", position: "right" },
    { target: "[data-tour='order-details']",  title: "Ítems",       content: "Marcá los ítems sobre los que aplica el descuento.",        position: "left"  },
    { target: "[data-tour='discount-keypad']",title: "Calculadora", content: "Ingresá el valor del descuento (% o monto fijo).",          position: "left"  },
    { target: "[data-tour='discount-reason']",title: "Motivo",      content: "Seleccioná el motivo del descuento.",                       position: "left"  },
    { target: "[data-tour='apply-btn']",      title: "Aplicar",     content: "Confirmá y aplicá el descuento a la orden.",               position: "top"   },
  ];

  /* ── Carga ─────────────────────────────────────────────── */
  const cargarOrdenes = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingOrders(true);
      const datos = await discountService.getActiveOrders(signal);
      setOrders(datos);
      setSelectedOrder((prev) =>
        !prev ? datos[0] ?? null : datos.find((o) => o._id === prev._id) ?? datos[0] ?? null
      );
    } catch (e: any) {
      if (e.name !== "AbortError") setError(e.message || "Error al cargar órdenes");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const cargarEstadisticas = useCallback(async (signal?: AbortSignal) => {
    try { setLoadingStats(true); setStats(await discountService.getTodayStats(signal)); }
    catch {}
    finally { setLoadingStats(false); }
  }, []);

  const cargarLimite = useCallback(async (signal?: AbortSignal) => {
    try {
      const r = await discountService.getDailyLimitRemaining(signal);
      setDailyLimit(r.remaining);
    } catch {}
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

  /* ── Acciones ──────────────────────────────────────────── */
  const aplicarRapido = useCallback(async (pct: number) => {
    if (!selectedOrder) return;
    setItems(items.map((i) => ({ ...i, selected: true })));
    discount.setType("PERCENT");
    discount.setValue(pct.toString());
    discount.setReason("COMP");
    setPasoActual(3);
  }, [selectedOrder, items, discount]);

  const reiniciar = useCallback(() => {
    discount.reset(); setPasoActual(1); setError(null); setFeedback(null);
  }, [discount]);

  const aplicar = async () => {
    if (!selectedOrder || !discount.isValid) { setError(discount.errors[0] || "Datos inválidos"); return; }
    try {
      setLoadingApply(true); setError(null); setFeedback(null);
      await discountService.applyDiscount(discount.buildPayload(selectedOrder._id));
      setFeedback("Descuento aplicado correctamente");
      discount.reset(); setPasoActual(1);
      await Promise.all([cargarOrdenes(), cargarEstadisticas()]);
    } catch (e: any) {
      setError(e.message || "Error al aplicar descuento");
    } finally {
      setLoadingApply(false);
    }
  };

  /* ── Filtrado ──────────────────────────────────────────── */
  const ordenesFiltradas = orders.filter((o) => {
    const q = busqueda.toLowerCase();
    const matchSearch = !q ||
      o.table.toString().toLowerCase().includes(q) ||
      o.items.some((i) => i.name.toLowerCase().includes(q));
    const matchEstado =
      filtroEstado === "todas" ||
      (filtroEstado === "en-curso"    && o.status !== "completed") ||
      (filtroEstado === "completadas" && o.status === "completed");
    return matchSearch && matchEstado;
  });

  /* ── Pasos (solo modo avanzado) ────────────────────────── */
  const STEPS = [
    { n: 1, label: "Seleccionar", ok: !!selectedOrder },
    { n: 2, label: "Calcular",    ok: items.some((i) => i.selected) && Number(discount.valueInput) > 0 },
    { n: 3, label: "Aplicar",     ok: discount.isValid },
  ];

  /* ── Limit bar color ───────────────────────────────────── */
  const limitColor = dailyLimit
    ? dailyLimit.remainingAmount < 100 ? "#F85149"
    : dailyLimit.remainingAmount < 300 ? "#FF7B54"
    : "#3FB950"
    : "#3FB950";

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="p-6 space-y-4">

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-2 p-3 rounded-xl"
        style={{ background: "#161B22", border: "1px solid #30363D" }}
      >
        {/* Toggle modo */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-xl"
          style={{ background: "#1C2333", border: "1px solid #30363D" }}
        >
          {(["simple", "advanced"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
              style={{
                background: mode === m ? "rgba(240,180,41,0.15)" : "transparent",
                color:      mode === m ? "#F0B429" : "#566270",
                border:     mode === m ? "1px solid rgba(240,180,41,0.30)" : "1px solid transparent",
              }}
            >
              {m === "simple" ? "Simple" : "Avanzado"}
            </button>
          ))}
        </div>

        {/* Quick actions */}
        {([-10, -15] as const).map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => aplicarRapido(Math.abs(pct))}
            disabled={!selectedOrder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: "rgba(240,180,41,0.10)", border: "1px solid rgba(240,180,41,0.25)", color: "#F0B429" }}
          >
            <Zap size={12} /> {pct}%
          </button>
        ))}

        {/* Refresh */}
        <button
          type="button"
          onClick={() => { cargarOrdenes(); cargarEstadisticas(); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ border: "1px solid #30363D", color: "#566270" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
        >
          <RefreshCw size={12} className={(loadingOrders || loadingStats) ? "animate-spin" : ""} />
        </button>

        {/* Límite diario (avanzado) */}
        {mode === "advanced" && dailyLimit && (
          <div
            className="flex-1 min-w-[200px] flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{ border: "1px solid #30363D", background: "#1C2333" }}
          >
            <TrendingDown size={13} style={{ color: "#F0B429", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: "#566270" }}>Límite diario</span>
                <span style={{ color: limitColor, fontWeight: 700 }}>
                  ${dailyLimit.remainingAmount.toFixed(0)} / ${dailyLimit.maxAmount}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ background: "#30363D" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width:      `${(dailyLimit.remainingAmount / dailyLimit.maxAmount) * 100}%`,
                    background: limitColor,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setTourOpen(true)}
          className="ml-auto px-3 py-2 rounded-xl text-xs transition-colors"
          style={{ border: "1px solid #30363D", color: "#566270" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#566270"; }}
        >
          Ayuda
        </button>
      </div>

      {/* ── Stepper (avanzado) ────────────────────────────── */}
      {mode === "advanced" && (
        <div className="flex items-center gap-2">
          {STEPS.map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 transition-all"
                style={{
                  background:  pasoActual === n ? "rgba(240,180,41,0.12)" : pasoActual > n ? "rgba(63,185,80,0.08)" : "#1C2333",
                  border:      `1px solid ${pasoActual === n ? "rgba(240,180,41,0.30)" : pasoActual > n ? "rgba(63,185,80,0.25)" : "#30363D"}`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{
                    background:  pasoActual > n ? "rgba(63,185,80,0.20)" : pasoActual === n ? "rgba(240,180,41,0.20)" : "#21283A",
                    border:      `1px solid ${pasoActual > n ? "rgba(63,185,80,0.40)" : pasoActual === n ? "rgba(240,180,41,0.40)" : "#30363D"}`,
                    color:       pasoActual > n ? "#3FB950" : pasoActual === n ? "#F0B429" : "#566270",
                  }}
                >
                  {pasoActual > n ? <CheckCircle2 size={10} /> : n}
                </div>
                <span
                  className="text-[11px] font-semibold hidden sm:block"
                  style={{ color: pasoActual === n ? "#F0B429" : pasoActual > n ? "#3FB950" : "#566270" }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 w-4 rounded-full flex-shrink-0"
                  style={{ background: pasoActual > n ? "rgba(63,185,80,0.35)" : "#30363D" }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Banners ──────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: "rgba(248,81,73,0.10)", border: "1px solid rgba(248,81,73,0.30)", color: "#FF6B63" }}
        >
          <div className="flex items-center gap-2"><AlertTriangle size={13} /> {error}</div>
          <button type="button" onClick={() => setError(null)}>
            <X size={12} />
          </button>
        </div>
      )}
      {feedback && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.25)", color: "#3FB950" }}
        >
          <div className="flex items-center gap-2"><CheckCircle2 size={13} /> {feedback}</div>
          <button type="button" onClick={() => setFeedback(null)}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Layout 3 columnas ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── Col izquierda: órdenes ───────────────────── */}
        <div className="lg:col-span-3" data-tour="orders-list">
          <div
            className="rounded-xl overflow-hidden flex flex-col"
            style={{ background: "#161B22", border: "1px solid #30363D", minHeight: 400 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: "#0D1117", borderBottom: "1px solid #30363D" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
                >
                  <Receipt size={13} style={{ color: "#F0B429" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Órdenes</h3>
              </div>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)", color: "#F0B429" }}
              >
                {ordenesFiltradas.length}
              </span>
            </div>

            {/* Búsqueda y filtros */}
            <div className="p-3 space-y-2 flex-shrink-0" style={{ borderBottom: "1px solid #30363D" }}>
              <input
                type="text"
                placeholder="Buscar por mesa…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none transition-colors"
                style={{ background: "#21283A", border: "1px solid #30363D", color: "#E6EDF3" }}
                onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(240,180,41,0.50)"; }}
                onBlur={(e)  => { (e.currentTarget as HTMLInputElement).style.borderColor = "#30363D"; }}
              />
              <div className="flex gap-1">
                {(["todas", "en-curso", "completadas"] as const).map((f) => {
                  const isActive = filtroEstado === f;
                  const label = f === "todas" ? "Todas" : f === "en-curso" ? "Activas" : "Compl.";
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFiltroEstado(f)}
                      className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                      style={{
                        background:  isActive ? "rgba(240,180,41,0.15)" : "#21283A",
                        color:       isActive ? "#F0B429" : "#566270",
                        border:      isActive ? "1px solid rgba(240,180,41,0.30)" : "1px solid #30363D",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de órdenes */}
            <div className="flex-1 p-3 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(240,180,41,0.3) transparent" }}>
              <OrderList
                orders={ordenesFiltradas}
                selectedOrderId={selectedOrder?._id}
                loading={loadingOrders}
                onSelectOrder={(o) => { setSelectedOrder(o); setPasoActual(1); }}
              />
            </div>
          </div>
        </div>

        {/* ── Col centro: detalles + keypad ───────────────── */}
        <div className="lg:col-span-6 flex flex-col gap-4">

          {/* Panel ítems */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "#161B22", border: "1px solid #30363D" }}
            data-tour="order-details"
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ background: "#0D1117", borderBottom: "1px solid #30363D" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(163,113,247,0.12)", border: "1px solid rgba(163,113,247,0.25)" }}
              >
                <Tag size={13} style={{ color: "#A371F7" }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Ítems de la orden</h3>
                {selectedOrder && (
                  <p className="text-[10px]" style={{ color: "#566270" }}>
                    Mesa {typeof selectedOrder.table === "object"
                      ? (selectedOrder.table as any)?.number
                      : selectedOrder.table}
                  </p>
                )}
              </div>
            </div>

            {selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                items={items}
                setItems={(updated) => {
                  setItems(updated);
                  if (updated.some((i) => i.selected) && pasoActual === 1) setPasoActual(2);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-2" style={{ opacity: 0.40 }}>
                <Receipt size={30} style={{ color: "#566270" }} />
                <p className="text-sm font-semibold" style={{ color: "#566270" }}>Seleccioná una orden</p>
                <p className="text-xs" style={{ color: "#3D444D" }}>Elegí una orden de la lista de la izquierda</p>
              </div>
            )}
          </div>

          {/* Keypad */}
          {selectedOrder && (
            <div
              className="rounded-xl p-5"
              style={{ background: "#161B22", border: "1px solid #30363D" }}
              data-tour="discount-keypad"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(63,185,80,0.12)", border: "1px solid rgba(63,185,80,0.25)" }}
                >
                  <MessageSquare size={13} style={{ color: "#3FB950" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Calculadora de descuento</h3>
              </div>
              <DiscountKeypad
                type={discount.type}
                setType={(t) => { discount.setType(t); if (pasoActual === 1) setPasoActual(2); }}
                value={discount.value}
                valueInput={discount.valueInput}
                appendNumber={discount.appendNumber}
                removeLast={discount.removeLast}
                presets={discountPresets}
              />
            </div>
          )}
        </div>

        {/* ── Col derecha: resumen + motivo + acciones ──── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Resumen financiero */}
          {selectedOrder && (
            <div
              className="rounded-xl p-4"
              style={{ background: "#161B22", border: "1px solid #30363D" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(56,139,253,0.12)", border: "1px solid rgba(56,139,253,0.25)" }}
                >
                  <TrendingDown size={13} style={{ color: "#388BFD" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Resumen</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "#566270" }}>Subtotal</span>
                  <span className="font-bold" style={{ color: "#E6EDF3" }}>
                    ${discount.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: "#566270" }}>Descuento</span>
                  <span className="font-bold" style={{ color: discount.type === "PERCENT" ? "#F0B429" : "#388BFD" }}>
                    −${discount.discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="h-px" style={{ background: "#30363D" }} />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Total</span>
                  <span className="text-xl font-black" style={{ color: "#F0B429" }}>
                    ${discount.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Motivo */}
          {selectedOrder && (
            <div
              className="rounded-xl p-4"
              style={{ background: "#161B22", border: "1px solid #30363D" }}
              data-tour="discount-reason"
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)" }}
                >
                  <Tag size={13} style={{ color: "#F0B429" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Motivo</h3>
              </div>
              <DiscountReasonForm
                reason={discount.reason}
                setReason={(r) => { discount.setReason(r); if (pasoActual === 2) setPasoActual(3); }}
                note={discount.note}
                setNote={discount.setNote}
              />
            </div>
          )}

          {/* Errores de validación */}
          {!discount.isValid && discount.valueInput !== "0" && discount.valueInput !== "" && (
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#F85149" }}>Corrige:</p>
              {discount.errors.map((e, i) => (
                <p key={i} className="text-xs flex items-center gap-2" style={{ color: "#FF6B63" }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#F85149" }} />
                  {e}
                </p>
              ))}
            </div>
          )}

          {/* Botones de acción */}
          {selectedOrder && (
            <div className="space-y-2" data-tour="apply-btn">
              <button
                type="button"
                onClick={aplicar}
                disabled={!discount.isValid || loadingApply}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#3FB950",
                  color:      "#0D1117",
                  boxShadow:  "0 4px 16px rgba(63,185,80,0.25)",
                }}
                onMouseEnter={(e) => { if (!loadingApply) (e.currentTarget as HTMLButtonElement).style.background = "#56D364"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3FB950"; }}
              >
                {loadingApply
                  ? <><Loader2 size={15} className="animate-spin" /> Aplicando…</>
                  : <><Save size={15} /> Aplicar descuento</>
                }
              </button>
              <button
                type="button"
                onClick={reiniciar}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: "#21283A", border: "1px solid #30363D", color: "#8B949E" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#E6EDF3"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8B949E"; }}
              >
                <X size={13} /> Cancelar
              </button>
            </div>
          )}

          {/* Estadísticas (avanzado) */}
          {mode === "advanced" && (
            <div
              className="rounded-xl p-4"
              style={{ background: "#161B22", border: "1px solid #30363D" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(63,185,80,0.12)", border: "1px solid rgba(63,185,80,0.25)" }}
                >
                  <CheckCircle2 size={13} style={{ color: "#3FB950" }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: "#E6EDF3" }}>Estadísticas del día</h3>
              </div>
              <DiscountStats data={stats} loading={loadingStats} />
            </div>
          )}
        </div>
      </div>

      <TourGuide steps={tourSteps} isOpen={tourOpen} onClose={() => setTourOpen(false)} storageKey="nebula_discount_tour_v1" />
    </div>
  );
}
