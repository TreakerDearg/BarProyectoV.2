"use client";

/**
 * PromotionsPage — Sistema de Gestión de Promociones y Happy Hour.
 *
 * REDISEÑO v3.0 — Slate Elegante
 * Cumplimiento estricto de VISUAL_REDESIGN_PLAN.md:
 * - Paleta única: #0D1117 (fondo raíz), #161B22 (superficie), #1C2333 (tarjetas), #21283A (elevación/hovers)
 * - Acentos semánticos: Dorado (#F0B429), Verde (#3FB950), Azul (#388BFD), Naranja (#FF7B54), Rojo (#F85149)
 * - Bordes visibles #30363D (sin bordes fantasma)
 * - Mínimo text-xs (12px), lectura nítida
 * - Live Client Preview interactiva
 * - Activador Happy Hour Express en tiempo real con Socket.IO
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, RefreshCcw, Tag, Sparkles, ToggleLeft, ToggleRight,
  Pencil, Trash2, X, Check, AlertTriangle, Clock, Calendar,
  Percent, DollarSign, ShoppingBag, Loader2, ChevronDown, ChevronUp,
  Search, Zap, Eye, Smartphone, Globe, Radio, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
  triggerExpressHappyHour,
} from "../services/promotionService";
import type { Promotion, PromotionType } from "../types/promotion";
import { PROMOTION_TYPE_LABELS, DAYS_OF_WEEK, DAYS_ES } from "../types/promotion";
import { socketService } from "../../../services/socket";
import "../../../styles/nebula-theme.css";

// ── Helpers ───────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function promoValueLabel(p: Promotion) {
  if (p.type === "PERCENT") return `${p.value}% OFF`;
  if (p.type === "FLAT")    return `$${p.value.toLocaleString("es-AR")} OFF`;
  if (p.type === "2X1")     return "2×1";
  return `${p.value}`;
}

function promoStatusGroup(p: Promotion): "active" | "scheduled" | "expired" | "inactive" {
  if (!p.isActive) return "inactive";
  const now = new Date();
  const start = p.schedule?.startDate ? new Date(p.schedule.startDate) : null;
  const end   = p.schedule?.endDate   ? new Date(p.schedule.endDate)   : null;
  if (start && start > now) return "scheduled";
  if (end && end < now)     return "expired";
  return "active";
}

const TYPE_ICON: Record<PromotionType, React.ReactNode> = {
  PERCENT: <Percent size={14} />,
  FLAT:    <DollarSign size={14} />,
  "2X1":   <ShoppingBag size={14} />,
  CUSTOM:  <Sparkles size={14} />,
};

const STATUS_CONFIG = {
  active: {
    label: "Activa",
    badge: "bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30",
    dot: "bg-[#3FB950]",
    cardBorder: "border-[#3FB950]/30",
  },
  scheduled: {
    label: "Programada",
    badge: "bg-[#388BFD]/15 text-[#388BFD] border border-[#388BFD]/30",
    dot: "bg-[#388BFD]",
    cardBorder: "border-[#30363D]",
  },
  expired: {
    label: "Expirada",
    badge: "bg-[#8B949E]/15 text-[#8B949E] border border-[#8B949E]/30",
    dot: "bg-[#8B949E]",
    cardBorder: "border-[#30363D]/60 opacity-60",
  },
  inactive: {
    label: "Inactiva",
    badge: "bg-[#566270]/20 text-[#8B949E] border border-[#30363D]",
    dot: "bg-[#566270]",
    cardBorder: "border-[#30363D] opacity-70",
  },
} as const;

// ── Formulario vacío ──────────────────────────────────────────────

const EMPTY_FORM: Omit<Promotion, "_id" | "createdAt" | "updatedAt" | "createdBy"> = {
  name:                  "",
  description:           "",
  audience:              "both",
  type:                  "PERCENT",
  value:                 20,
  isActive:              true,
  applicableProducts:    [],
  applicableCategories:  [],
  schedule: {
    daysOfWeek: [],
    startTime:  "19:00",
    endTime:    "22:00",
    startDate:  null,
    endDate:    null,
  },
};

// ── Live Client Preview Component ─────────────────────────────────

function LiveClientPreview({ promo }: { promo: typeof EMPTY_FORM }) {
  const isPercent = promo.type === "PERCENT";
  const is2x1     = promo.type === "2X1";
  const isFlat    = promo.type === "FLAT";

  const sampleBasePrice = 6000;
  let finalPrice = sampleBasePrice;
  if (isPercent) {
    finalPrice = Math.round(sampleBasePrice * (1 - (promo.value || 0) / 100));
  } else if (isFlat) {
    finalPrice = Math.max(0, sampleBasePrice - (promo.value || 0));
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#090E14] border border-[#30363D]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-[#F0B429]" />
          <span className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">
            Vista Previa · Carta Digital Cliente
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/30">
          En vivo
        </span>
      </div>

      {/* Banner flotante de la carta si está activa */}
      {promo.isActive && (
        <div className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#F0B429]/20 via-[#F0B429]/10 to-transparent border border-[#F0B429]/35 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={14} className="text-[#F0B429] shrink-0" />
            <p className="text-xs font-bold text-[#E6EDF3] truncate">
              {promo.name || "Promoción destacada"}
            </p>
          </div>
          <span className="text-[11px] font-black text-[#F0B429] shrink-0">
            {promoValueLabel(promo as any)}
          </span>
        </div>
      )}

      {/* Tarjeta de producto de ejemplo en la carta digital */}
      <div className="rounded-xl overflow-hidden bg-[#161B22] border border-[#30363D] shadow-xl">
        {/* Mock imagen del trago */}
        <div className="h-28 bg-[#1C2333] relative flex items-center justify-center overflow-hidden border-b border-[#30363D]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#161B22] to-transparent z-10" />
          <div className="w-16 h-16 rounded-full bg-[#F0B429]/10 border border-[#F0B429]/25 flex items-center justify-center">
            <ShoppingBag size={24} className="text-[#F0B429]/70" />
          </div>

          {/* Badge de ahorro sobre la imagen */}
          <div className="absolute top-2.5 right-2.5 z-20">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#3FB950] text-[#0D1117] shadow-lg">
              {is2x1 ? "2×1" : isPercent ? `-${promo.value}%` : `-$${promo.value}`}
            </span>
          </div>

          <div className="absolute bottom-2 left-3 z-20">
            <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
              {promo.applicableCategories?.[0] || "Cóctel de Autor"}
            </span>
          </div>
        </div>

        {/* Datos del producto simulado */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#E6EDF3]">Gin Tonic Especial</p>
              <p className="text-xs text-[#8B949E] line-clamp-1 mt-0.5">
                {promo.description || "Ginebra premium, tónica botánica y garnish cítrico."}
              </p>
            </div>
          </div>

          {/* Precios: Regular tachado y Promocional */}
          <div className="flex items-baseline justify-between pt-1 border-t border-[#30363D]/60">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#F0B429]">
                ${finalPrice.toLocaleString("es-AR")}
              </span>
              {(isPercent || isFlat) && (
                <span className="text-xs text-[#566270] line-through">
                  ${sampleBasePrice.toLocaleString("es-AR")}
                </span>
              )}
              {is2x1 && (
                <span className="text-[11px] font-bold text-[#3FB950]">
                  (2da unidad gratis)
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#8B949E] font-semibold">
              Mesa QR
            </span>
          </div>
        </div>
      </div>

      {/* Info de canales */}
      <div className="flex items-center justify-between text-xs text-[#8B949E] px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <Globe size={13} className="text-[#388BFD]" />
          Audience: {promo.audience === "both" ? "Web QR + App" : promo.audience === "web" ? "Carta Web" : "App Móvil"}
        </span>
        <span className="flex items-center gap-1.5 text-[#3FB950]">
          <CheckCircle2 size={13} /> Sincronizado en tiempo real
        </span>
      </div>
    </div>
  );
}

// ── PromotionForm ─────────────────────────────────────────────────

function PromotionForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Omit<Promotion, "_id" | "createdAt" | "updatedAt" | "createdBy">;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [showSchedule, setShowSchedule] = useState(
    !!(initial.schedule?.startDate || initial.schedule?.endDate || initial.schedule?.daysOfWeek?.length)
  );
  const [error, setError] = useState<string | null>(null);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setSchedule = (field: string, value: unknown) =>
    setForm((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [field]: value },
    }));

  const toggleDay = (day: string) => {
    const days = form.schedule?.daysOfWeek ?? [];
    setSchedule(
      "daysOfWeek",
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    if (form.value <= 0 && form.type !== "2X1") {
      setError("El valor debe ser mayor a 0");
      return;
    }
    setError(null);
    await onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full bg-[#161B22] text-[#E6EDF3]"
      noValidate
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#30363D] shrink-0 bg-[#0D1117]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F0B429]/15 border border-[#F0B429]/30 text-[#F0B429]">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#E6EDF3]">
              {initial.name ? "Editar promoción" : "Nueva promoción comercial"}
            </h2>
            <p className="text-xs text-[#8B949E]">
              Configura descuentos, horarios y visualización para clientes
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body: Split en 2 columnas (Formulario a la izquierda, Preview en vivo a la derecha) */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 custom-scrollbar">
        {/* Columna Izquierda: Formulario */}
        <div className="xl:col-span-7 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
              Nombre de la promoción <span className="text-[#F85149]">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Happy Hour Cócteles Clásicos"
              maxLength={80}
              className="w-full bg-[#1C2333] border border-[#30363D] rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] placeholder:text-[#566270] focus:border-[#F0B429] outline-none transition-all"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
              Descripción comercial
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descripción visible para el cliente en la carta o app…"
              rows={2}
              maxLength={200}
              className="w-full bg-[#1C2333] border border-[#30363D] rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] placeholder:text-[#566270] focus:border-[#F0B429] outline-none transition-all resize-none"
            />
          </div>

          {/* Tipo + Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                Mecánica
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as PromotionType)}
                className="w-full bg-[#1C2333] border border-[#30363D] rounded-xl px-3 py-2.5 text-sm text-[#E6EDF3] focus:border-[#F0B429] outline-none transition-all"
              >
                {(Object.entries(PROMOTION_TYPE_LABELS) as [PromotionType, string][]).map(
                  ([v, l]) => <option key={v} value={v}>{l}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                Valor {form.type === "PERCENT" ? "(%)" : form.type === "FLAT" ? "($)" : "(2×1)"}
              </label>
              <input
                type="number"
                min={0}
                step={form.type === "PERCENT" ? 1 : 100}
                value={form.value}
                onChange={(e) => set("value", Number(e.target.value))}
                className="w-full bg-[#1C2333] border border-[#30363D] rounded-xl px-4 py-2.5 text-sm font-bold text-[#E6EDF3] focus:border-[#F0B429] outline-none transition-all disabled:opacity-50"
                disabled={form.type === "2X1" || form.type === "CUSTOM"}
              />
            </div>
          </div>

          {/* Audiencia */}
          <div>
            <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
              Canal de publicación
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "both", label: "Web + App", icon: <Globe size={14} /> },
                { id: "web",  label: "Solo Carta QR", icon: <Radio size={14} /> },
                { id: "app",  label: "Solo App", icon: <Smartphone size={14} /> },
              ].map((aud) => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => set("audience", aud.id)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    form.audience === aud.id
                      ? "bg-[#F0B429]/15 text-[#F0B429] border-[#F0B429]/40"
                      : "bg-[#1C2333] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                  }`}
                >
                  {aud.icon}
                  <span>{aud.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categorías aplicables */}
          <div>
            <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
              Categorías aplicables <span className="text-[#566270] font-normal">(separar por comas)</span>
            </label>
            <input
              value={(form.applicableCategories ?? []).join(", ")}
              onChange={(e) =>
                set(
                  "applicableCategories",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="Ej: Cócteles, Gin, Cervezas, Tragos de Autor"
              className="w-full bg-[#1C2333] border border-[#30363D] rounded-xl px-4 py-2.5 text-sm text-[#E6EDF3] placeholder:text-[#566270] focus:border-[#F0B429] outline-none transition-all"
            />
          </div>

          {/* Toggle Programación Horaria */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#1C2333] border border-[#30363D] text-xs font-bold text-[#E6EDF3] hover:bg-[#21283A] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#F0B429]" />
                <span>Horarios y Días de Happy Hour</span>
              </div>
              {showSchedule ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSchedule && (
              <div className="p-4 mt-2 rounded-xl bg-[#1C2333]/70 border border-[#30363D] space-y-4">
                {/* Días de la semana */}
                <div>
                  <p className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">
                    Días activos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const active = (form.schedule?.daysOfWeek ?? []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            active
                              ? "bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/40"
                              : "bg-[#21283A] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]"
                          }`}
                        >
                          {(DAYS_ES[day] || "").slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] mb-1">
                      Hora inicio
                    </label>
                    <input
                      type="time"
                      value={form.schedule?.startTime ?? ""}
                      onChange={(e) => setSchedule("startTime", e.target.value)}
                      className="w-full bg-[#21283A] border border-[#30363D] rounded-xl px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-[#F0B429]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] mb-1">
                      Hora fin
                    </label>
                    <input
                      type="time"
                      value={form.schedule?.endTime ?? ""}
                      onChange={(e) => setSchedule("endTime", e.target.value)}
                      className="w-full bg-[#21283A] border border-[#30363D] rounded-xl px-3 py-2 text-sm text-[#E6EDF3] outline-none focus:border-[#F0B429]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Activo */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1C2333] border border-[#30363D]">
            <div>
              <p className="text-sm font-bold text-[#E6EDF3]">Habilitar inmediatamente</p>
              <p className="text-xs text-[#8B949E]">
                Estará activa y visible para los clientes según el horario programado
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`p-1 rounded-lg transition-colors ${
                form.isActive ? "text-[#3FB950]" : "text-[#566270]"
              }`}
            >
              {form.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F85149]/12 border border-[#F85149]/30 text-[#FF6B63] text-xs">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Columna Derecha: Live Preview para el Cliente */}
        <div className="xl:col-span-5 space-y-4">
          <LiveClientPreview promo={form} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 p-6 border-t border-[#30363D] bg-[#0D1117] shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21283A] text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#F0B429] text-[#0D1117] text-xs font-black uppercase tracking-wider hover:bg-[#F5C842] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(240,180,41,0.2)]"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : <><Check size={16} /> Guardar Promoción</>}
        </button>
      </div>
    </form>
  );
}

// ── PromotionCard ─────────────────────────────────────────────────

function PromotionCard({
  promo,
  onEdit,
  onDelete,
  onToggle,
  togglingId,
}: {
  promo: Promotion;
  onEdit: (p: Promotion) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  togglingId: string | null;
}) {
  const group = promoStatusGroup(promo);
  const isToggling = togglingId === promo._id;
  const cfg = STATUS_CONFIG[group];

  return (
    <div className={`rounded-2xl border bg-[#1C2333] transition-all hover:border-[#F0B429]/40 hover:bg-[#21283A] ${cfg.cardBorder} flex flex-col justify-between`}>
      <div className="p-5 space-y-4">
        {/* Top badges + Valor */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.badge}`}>
                {group === "active" && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />}
                {cfg.label}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-[#21283A] border-[#30363D] text-[#8B949E] uppercase tracking-wider">
                {TYPE_ICON[promo.type]}
                {PROMOTION_TYPE_LABELS[promo.type]}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#E6EDF3] truncate pt-1">{promo.name}</h3>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-black text-[#F0B429] leading-none">
              {promoValueLabel(promo)}
            </p>
          </div>
        </div>

        {/* Descripción */}
        {promo.description && (
          <p className="text-xs text-[#8B949E] line-clamp-2 leading-relaxed">
            {promo.description}
          </p>
        )}

        {/* Metadatos (Horarios, Días, Categorías) */}
        <div className="space-y-2 pt-2 border-t border-[#30363D]">
          {/* Horario de Happy Hour */}
          {promo.schedule?.startTime && promo.schedule?.endTime && (
            <div className="flex items-center gap-2 text-xs text-[#8B949E]">
              <Clock size={13} className="text-[#F0B429] shrink-0" />
              <span>
                {promo.schedule.startTime} – {promo.schedule.endTime}
                {(promo.schedule.daysOfWeek?.length ?? 0) > 0 && (
                  <span className="text-[#566270]">
                    {" "}· {promo.schedule.daysOfWeek!.map((d) => (DAYS_ES[d] || "").slice(0, 3)).filter(Boolean).join(", ")}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Categorías */}
          {(promo.applicableCategories?.length ?? 0) > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#8B949E]">
              <Tag size={13} className="text-[#388BFD] shrink-0" />
              <span className="truncate">{promo.applicableCategories!.join(", ")}</span>
            </div>
          )}

          {/* Fechas de vigencia */}
          {(promo.schedule?.startDate || promo.schedule?.endDate) && (
            <div className="flex items-center gap-2 text-xs text-[#566270]">
              <Calendar size={13} className="shrink-0" />
              <span>
                {fmtDate(promo.schedule.startDate) ?? "Hoy"} → {fmtDate(promo.schedule.endDate) ?? "Indefinido"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer de Acciones */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#30363D] bg-[#161B22]/50 rounded-b-2xl">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
            {promo.audience === "app" ? "App Móvil" : promo.audience === "web" ? "Carta QR" : "Web + App"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Activar/Desactivar */}
          <button
            type="button"
            onClick={() => onToggle(promo._id!)}
            disabled={isToggling}
            title={promo.isActive ? "Desactivar promoción" : "Activar promoción"}
            className={`p-1.5 rounded-lg border transition-colors ${
              promo.isActive
                ? "bg-[#3FB950]/15 border-[#3FB950]/30 text-[#3FB950]"
                : "bg-[#21283A] border-[#30363D] text-[#566270] hover:text-[#E6EDF3]"
            }`}
          >
            {isToggling ? <Loader2 size={16} className="animate-spin" /> : promo.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>

          {/* Editar */}
          <button
            type="button"
            onClick={() => onEdit(promo)}
            className="p-2 rounded-lg border border-[#30363D] bg-[#21283A] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
            title="Editar promoción"
          >
            <Pencil size={14} />
          </button>

          {/* Eliminar */}
          <button
            type="button"
            onClick={() => onDelete(promo._id!)}
            className="p-2 rounded-lg border border-[#30363D] bg-[#21283A] text-[#8B949E] hover:text-[#F85149] hover:border-[#F85149]/40 transition-colors"
            title="Eliminar promoción"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal PromotionsPage ────────────────────────────

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filterTab, setFilterTab]   = useState<"all" | "active" | "scheduled" | "expired" | "inactive">("all");
  const [formOpen, setFormOpen]     = useState(false);
  const [editing, setEditing]       = useState<Promotion | null>(null);
  const [saving, setSaving]         = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expressLoading, setExpressLoading] = useState(false);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // ── Sincronización en tiempo real vía WebSocket ─────────────────
  useEffect(() => {
    const handleSocketUpdate = () => {
      fetchPromotions();
    };

    socketService.on("promotion:update", handleSocketUpdate);
    socketService.on("promotion:change", handleSocketUpdate);

    return () => {
      socketService.off("promotion:update", handleSocketUpdate);
      socketService.off("promotion:change", handleSocketUpdate);
    };
  }, [fetchPromotions]);

  // ── Filtrado ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = promotions;
    if (filterTab !== "all") list = list.filter((p) => promoStatusGroup(p) === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.applicableCategories?.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [promotions, filterTab, search]);

  // ── Estadísticas para KPI Strip ─────────────────────────────────
  const stats = useMemo(() => ({
    total:     promotions.length,
    active:    promotions.filter((p) => promoStatusGroup(p) === "active").length,
    scheduled: promotions.filter((p) => promoStatusGroup(p) === "scheduled").length,
    expired:   promotions.filter((p) => promoStatusGroup(p) === "expired").length,
    inactive:  promotions.filter((p) => promoStatusGroup(p) === "inactive").length,
  }), [promotions]);

  // ── CRUD Actions ───────────────────────────────────────────────
  const handleSave = async (data: typeof EMPTY_FORM) => {
    setSaving(true);
    try {
      if (editing?._id) {
        const updated = await updatePromotion(editing._id, data);
        setPromotions((prev) => prev.map((p) => p._id === updated._id ? updated : p));
      } else {
        const created = await createPromotion(data);
        setPromotions((prev) => [created, ...prev]);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditing(promo);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta promoción comercial?")) return;
    try {
      await deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p._id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const { isActive } = await togglePromotion(id);
      setPromotions((prev) =>
        prev.map((p) => p._id === id ? { ...p, isActive } : p)
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleExpressHappyHour = async () => {
    setExpressLoading(true);
    try {
      await triggerExpressHappyHour({ durationMinutes: 45, discountPercent: 25 });
      await fetchPromotions();
    } catch (e: any) {
      setError(e.message || "Error al disparar Happy Hour Express");
    } finally {
      setExpressLoading(false);
    }
  };

  const TABS: { key: typeof filterTab; label: string; count: number }[] = [
    { key: "all",       label: "Todas",       count: stats.total     },
    { key: "active",    label: "Activas",     count: stats.active    },
    { key: "scheduled", label: "Programadas", count: stats.scheduled },
    { key: "expired",   label: "Expiradas",   count: stats.expired   },
    { key: "inactive",  label: "Inactivas",   count: stats.inactive  },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 gap-4 overflow-hidden bg-[#0D1117] text-[#E6EDF3] p-6">

      {/* ── HEADER PRINCIPAL ─────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#F0B429]/15 border border-[#F0B429]/30 shadow-[0_0_20px_rgba(240,180,41,0.12)]">
            <Sparkles className="text-[#F0B429]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#E6EDF3]">
              Gestor de Promociones & Happy Hour
            </h1>
            <p className="text-xs text-[#8B949E] mt-0.5">
              {stats.active} promociones activas en vivo para clientes en Carta Digital QR y App
            </p>
          </div>
        </div>

        {/* Acciones del Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Disparador Happy Hour Express */}
          <button
            type="button"
            onClick={handleExpressHappyHour}
            disabled={expressLoading}
            title="Activar 45 min de Happy Hour al 25% OFF en vivo para todos los clientes"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#F0B429]/40 bg-[#F0B429]/15 text-[#F0B429] text-xs font-black uppercase tracking-wider hover:bg-[#F0B429]/25 transition-all disabled:opacity-50"
          >
            {expressLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            <span>Happy Hour Express (45m)</span>
          </button>

          {/* Buscador */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#566270] pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar promoción…"
              className="h-10 pl-9 pr-3 rounded-xl bg-[#1C2333] border border-[#30363D] text-xs text-[#E6EDF3] placeholder:text-[#566270] focus:border-[#F0B429] outline-none w-44"
            />
          </div>

          {/* Refresco */}
          <button
            type="button"
            onClick={fetchPromotions}
            className="flex items-center justify-center p-2.5 rounded-xl border border-[#30363D] bg-[#1C2333] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#3D444D] transition-colors"
            title="Actualizar listado"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Botón Crear */}
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0B429] text-[#0D1117] text-xs font-black uppercase tracking-wider hover:bg-[#F5C842] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(240,180,41,0.2)]"
          >
            <Plus size={16} />
            <span>Nueva Promo</span>
          </button>
        </div>
      </header>

      {/* ── KPI STRIP ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        {[
          {
            label: "Total Registradas",
            value: stats.total,
            desc:  "en catálogo comercial",
            color: "text-[#E6EDF3]",
            border: "border-[#30363D]",
            bg:    "bg-[#1C2333]",
          },
          {
            label: "Activas en Vivo",
            value: stats.active,
            desc:  "impactando en carta QR",
            color: "text-[#3FB950]",
            border: "border-[#3FB950]/30",
            bg:    "bg-[#3FB950]/8",
          },
          {
            label: "Programadas",
            value: stats.scheduled,
            desc:  "por activarse automáticamente",
            color: "text-[#388BFD]",
            border: "border-[#388BFD]/30",
            bg:    "bg-[#388BFD]/8",
          },
          {
            label: "Inactivas / Expiradas",
            value: stats.inactive + stats.expired,
            desc:  "fuera de circulación",
            color: "text-[#8B949E]",
            border: "border-[#30363D]",
            bg:    "bg-[#1C2333]",
          },
        ].map((k) => (
          <div key={k.label} className={`p-5 rounded-2xl border ${k.border} ${k.bg} flex flex-col justify-between`}>
            <p className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">{k.label}</p>
            <p className={`text-3xl font-black ${k.color} my-1`}>{k.value}</p>
            <p className="text-[11px] text-[#566270]">{k.desc}</p>
          </div>
        ))}
      </div>

      {/* ── TABS DE FILTRADO ─────────────────────────────────────── */}
      <div className="flex gap-1 bg-[#161B22] border border-[#30363D] rounded-xl p-1 w-fit flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilterTab(t.key)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterTab === t.key
                ? "bg-[#21283A] text-[#E6EDF3] border border-[#3D444D] shadow-sm"
                : "text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            {t.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              filterTab === t.key ? "bg-[#F0B429]/20 text-[#F0B429]" : "bg-[#21283A] text-[#8B949E]"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── ERROR BANNER ─────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F85149]/12 border border-[#F85149]/30 text-[#FF6B63] text-xs flex-shrink-0">
          <AlertTriangle size={15} />
          <span className="flex-1 font-semibold">{error}</span>
          <button type="button" onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── GRID DE PROMOCIONES ──────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-0.5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="text-[#F0B429] animate-spin" />
            <p className="text-xs text-[#8B949E]">Sincronizando promociones…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center border border-[#30363D] rounded-2xl bg-[#161B22]/50 p-8">
            <div className="p-4 rounded-2xl bg-[#F0B429]/10 border border-[#F0B429]/20 text-[#F0B429]">
              <Sparkles size={32} />
            </div>
            <p className="text-sm font-bold text-[#E6EDF3]">
              {search || filterTab !== "all" ? "No se encontraron promociones con ese filtro" : "No hay promociones registradas en el catálogo"}
            </p>
            <p className="text-xs text-[#8B949E]">
              Crea promociones para atraer clientes a la carta web o lanza un Happy Hour Express.
            </p>
            <button
              type="button"
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="mt-2 text-xs font-bold text-[#F0B429] hover:underline"
            >
              Crear primera promoción
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((promo) => (
              <PromotionCard
                key={promo._id}
                promo={promo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                togglingId={togglingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL / DRAWER LATERAL (Con Live Client Preview) ───────── */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => { if (!saving) { setFormOpen(false); setEditing(null); } }}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-4xl bg-[#161B22] border-l border-[#30363D] shadow-2xl flex flex-col z-10"
            >
              <PromotionForm
                initial={editing ?? EMPTY_FORM}
                onSave={handleSave}
                onClose={() => { setFormOpen(false); setEditing(null); }}
                saving={saving}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
