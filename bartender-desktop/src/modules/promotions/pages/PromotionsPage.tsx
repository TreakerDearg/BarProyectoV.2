"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, RefreshCcw, Tag, Sparkles, ToggleLeft, ToggleRight,
  Pencil, Trash2, X, Check, AlertTriangle, Clock, Calendar,
  Percent, DollarSign, ShoppingBag, Loader2, ChevronDown, ChevronUp,
  Search,
} from "lucide-react";

import {
  getPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
} from "../services/promotionService";
import type { Promotion, PromotionType } from "../types/promotion";
import { PROMOTION_TYPE_LABELS, DAYS_OF_WEEK, DAYS_ES } from "../types/promotion";
import "../../../styles/nebula-theme.css";

// ── Helpers ───────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function promoValueLabel(p: Promotion) {
  if (p.type === "PERCENT") return `${p.value}% off`;
  if (p.type === "FLAT")    return `$${p.value} off`;
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

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  scheduled: "bg-gold/15 border-gold/30 text-gold",
  expired:   "bg-white/8 border-white/15 text-muted",
  inactive:  "bg-white/5 border-white/10 text-muted/60",
};

const STATUS_LABELS: Record<string, string> = {
  active:    "Activa",
  scheduled: "Programada",
  expired:   "Expirada",
  inactive:  "Inactiva",
};

// ── Formulario vacío ──────────────────────────────────────────────

const EMPTY_FORM: Omit<Promotion, "_id" | "createdAt" | "updatedAt" | "createdBy"> = {
  name:                  "",
  description:           "",
  type:                  "PERCENT",
  value:                 10,
  isActive:              true,
  applicableProducts:    [],
  applicableCategories:  [],
  schedule: {
    daysOfWeek: [],
    startTime:  "",
    endTime:    "",
    startDate:  null,
    endDate:    null,
  },
};

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
    if (form.value <= 0)    { setError("El valor debe ser mayor a 0"); return; }
    setError(null);
    await onSave(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full"
      noValidate
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/8 shrink-0">
        <h2 className="text-xl font-bold text-ivory">
          {initial.name ? "Editar promoción" : "Nueva promoción"}
        </h2>
        <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/8 text-muted transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Nombre */}
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej: Happy Hour Cócteles"
            maxLength={80}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
            Descripción
          </label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Descripción visible para el cliente…"
            rows={2}
            maxLength={200}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory text-sm focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all resize-none"
          />
        </div>

        {/* Tipo + Valor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
              Tipo
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as PromotionType)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory text-sm focus:border-gold/50 outline-none transition-all"
            >
              {(Object.entries(PROMOTION_TYPE_LABELS) as [PromotionType, string][]).map(
                ([v, l]) => <option key={v} value={v}>{l}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
              Valor <span className="text-muted/50 font-normal">({form.type === "PERCENT" ? "%" : form.type === "FLAT" ? "$" : "—"})</span>
            </label>
            <input
              type="number"
              min={0}
              step={form.type === "PERCENT" ? 1 : 0.01}
              value={form.value}
              onChange={(e) => set("value", Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory text-sm font-mono focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all"
              disabled={form.type === "2X1" || form.type === "CUSTOM"}
            />
          </div>
        </div>

        {/* Categorías aplicables */}
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
            Categorías aplicables <span className="text-muted/40 font-normal normal-case">(separar con comas)</span>
          </label>
          <input
            value={(form.applicableCategories ?? []).join(", ")}
            onChange={(e) =>
              set(
                "applicableCategories",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="Ej: Cócteles, Gin, Vinos"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory text-sm focus:border-gold/50 outline-none transition-all"
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/8">
          <div>
            <p className="text-sm font-semibold text-ivory">Estado activo</p>
            <p className="text-[11px] text-muted">Visible para los clientes cuando esté activa</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() => set("isActive", !form.isActive)}
            className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40 ${
              form.isActive ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Programación (colapsable) */}
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSchedule((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-text-dim">
              <Calendar size={15} />
              Programación (opcional)
            </div>
            {showSchedule ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
          </button>

          {showSchedule && (
            <div className="p-4 border-t border-white/6 space-y-4">
              {/* Días de la semana */}
              <div>
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-2">Días activos</p>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const active = (form.schedule?.daysOfWeek ?? []).includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                          active
                            ? "bg-gold/20 border-gold/40 text-gold"
                            : "bg-white/5 border-white/10 text-muted hover:border-white/20"
                        }`}
                      >
                        {DAYS_ES[d]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={form.schedule?.startTime ?? ""}
                    onChange={(e) => setSchedule("startTime", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-ivory text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={form.schedule?.endTime ?? ""}
                    onChange={(e) => setSchedule("endTime", e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-ivory text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    value={form.schedule?.startDate ?? ""}
                    onChange={(e) => setSchedule("startDate", e.target.value || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-ivory text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    value={form.schedule?.endDate ?? ""}
                    onChange={(e) => setSchedule("endDate", e.target.value || null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-ivory text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 p-6 border-t border-white/8 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-muted hover:text-ivory text-sm font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-bg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-105 active:scale-[0.98] shadow-[0_4px_16px_rgba(212,163,64,0.25)]"
          style={{
            background: "linear-gradient(135deg,#8F7020 0%,#D4AF37 55%,#E6C766 100%)",
            color: "#09090B",
          }}
        >
          {saving ? <><Loader2 size={15} className="animate-spin" />Guardando…</> : <><Check size={15} />Guardar</>}
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

  return (
    <div className={`rounded-2xl border bg-surface-3/60 transition-all hover:border-gold/25 ${
      group === "active" ? "border-emerald-500/20" :
      group === "expired" ? "border-white/5 opacity-70" :
      "border-white/10"
    }`}>
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${STATUS_STYLES[group]}`}>
                {group === "active"    && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                {STATUS_LABELS[group]}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-muted uppercase tracking-wider">
                {TYPE_ICON[promo.type]}
                {PROMOTION_TYPE_LABELS[promo.type]}
              </span>
            </div>
            <h3 className="text-base font-bold text-ivory truncate">{promo.name}</h3>
            {promo.description && (
              <p className="text-xs text-muted mt-0.5 line-clamp-2">{promo.description}</p>
            )}
          </div>

          {/* Valor */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-gold leading-none">{promoValueLabel(promo)}</p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="space-y-1">
          {(promo.applicableCategories?.length ?? 0) > 0 && (
            <p className="text-[11px] text-muted flex items-center gap-1">
              <Tag size={11} />
              {promo.applicableCategories!.join(", ")}
            </p>
          )}
          {promo.schedule?.startTime && promo.schedule?.endTime && (
            <p className="text-[11px] text-muted flex items-center gap-1">
              <Clock size={11} />
              {promo.schedule.startTime} – {promo.schedule.endTime}
              {(promo.schedule.daysOfWeek?.length ?? 0) > 0 && (
                <> · {promo.schedule.daysOfWeek!.map((d) => DAYS_ES[d]?.slice(0, 3)).join(", ")}</>
              )}
            </p>
          )}
          {(promo.schedule?.startDate || promo.schedule?.endDate) && (
            <p className="text-[11px] text-muted flex items-center gap-1">
              <Calendar size={11} />
              {fmtDate(promo.schedule.startDate) ?? "—"} → {fmtDate(promo.schedule.endDate) ?? "sin fecha límite"}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/6">
          {/* Toggle activo/inactivo */}
          <button
            type="button"
            onClick={() => onToggle(promo._id!)}
            disabled={isToggling}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              promo.isActive
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
            } disabled:opacity-40`}
          >
            {isToggling
              ? <Loader2 size={12} className="animate-spin" />
              : promo.isActive
                ? <><ToggleRight size={14} />Activa</>
                : <><ToggleLeft size={14} />Inactiva</>}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(promo)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gold/20 bg-gold/8 text-gold/70 hover:bg-gold/15 text-xs font-semibold transition-all"
            >
              <Pencil size={12} /> Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(promo._id!)}
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-red-500/15 bg-red-500/8 text-red-400/60 hover:bg-red-500/15 transition-all"
              aria-label="Eliminar promoción"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────

export default function PromotionsPage() {
  const [promotions, setPromotions]     = useState<Promotion[]>([]);
  const [loading,    setLoading]        = useState(true);
  const [error,      setError]          = useState<string | null>(null);
  const [search,     setSearch]         = useState("");
  const [filterTab,  setFilterTab]      = useState<"all" | "active" | "scheduled" | "expired" | "inactive">("all");
  const [formOpen,   setFormOpen]       = useState(false);
  const [editing,    setEditing]        = useState<Promotion | null>(null);
  const [saving,     setSaving]         = useState(false);
  const [togglingId, setTogglingId]     = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPromotions(await getPromotions());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

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

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     promotions.length,
    active:    promotions.filter((p) => promoStatusGroup(p) === "active").length,
    scheduled: promotions.filter((p) => promoStatusGroup(p) === "scheduled").length,
    expired:   promotions.filter((p) => promoStatusGroup(p) === "expired").length,
    inactive:  promotions.filter((p) => promoStatusGroup(p) === "inactive").length,
  }), [promotions]);

  // ── CRUD ───────────────────────────────────────────────────────
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
    if (!window.confirm("¿Eliminar esta promoción permanentemente?")) return;
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

  const TABS: { key: typeof filterTab; label: string; count: number }[] = [
    { key: "all",       label: "Todas",      count: stats.total     },
    { key: "active",    label: "Activas",    count: stats.active    },
    { key: "scheduled", label: "Programadas",count: stats.scheduled },
    { key: "expired",   label: "Expiradas",  count: stats.expired   },
    { key: "inactive",  label: "Inactivas",  count: stats.inactive  },
  ];

  return (
    <div className="nebula-dashboard-root flex flex-col h-full min-h-0 gap-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="nebula-aurora" />
      </div>

      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-gold/30 to-amber-500/20 border border-gold/20 shadow-[0_0_24px_rgba(212,163,64,0.15)]">
            <Sparkles className="text-gold" size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ivory">
              Promociones
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {stats.total} total · {stats.active} activas · {stats.scheduled} programadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="h-9 pl-8 pr-3 rounded-xl bg-white/5 border border-white/10 text-xs text-ivory placeholder:text-muted/50 focus:outline-none focus:border-gold/40 w-40"
            />
          </div>
          <button
            type="button"
            onClick={fetchPromotions}
            className="flex items-center px-2.5 py-2 rounded-xl border border-white/10 text-xs text-muted hover:text-ivory hover:border-white/20 transition-colors"
            title="Actualizar"
          >
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => { setEditing(null); setFormOpen(true); }}
            className="nebula-btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Nueva</span>
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: "Total",       value: stats.total,     color: "border-white/15"           },
          { label: "Activas",     value: stats.active,    color: "border-emerald-500/25"      },
          { label: "Programadas", value: stats.scheduled, color: "border-gold/25"             },
          { label: "Inactivas",   value: stats.inactive + stats.expired, color: "border-white/10" },
        ].map((k) => (
          <div key={k.label} className={`p-4 rounded-xl border bg-surface-3/50 ${k.color}`}>
            <p className="text-[10px] text-muted uppercase tracking-widest">{k.label}</p>
            <p className="text-2xl font-bold text-ivory">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/4 border border-white/10 rounded-xl p-1 w-fit flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilterTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterTab === t.key
                ? "bg-gold/20 text-gold border border-gold/30"
                : "text-muted hover:text-ivory"
            }`}
          >
            {t.label}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              filterTab === t.key ? "bg-gold/20 text-gold" : "bg-white/8 text-muted/70"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex-shrink-0">
          <AlertTriangle size={14} />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Grid de promociones */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-0.5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
            </div>
            <p className="text-xs text-muted animate-pulse">Cargando promociones…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gold/10 to-amber-500/10 border border-gold/20">
              <Sparkles size={40} className="text-gold/40" />
            </div>
            <p className="text-sm font-semibold text-ivory/60">
              {search || filterTab !== "all" ? "Sin resultados" : "No hay promociones registradas"}
            </p>
            <button
              type="button"
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="text-xs text-gold hover:text-gold-light underline transition-colors"
            >
              Crear la primera promoción
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] text-muted mb-3 uppercase tracking-widest">
              {filtered.length} promoción{filtered.length !== 1 ? "es" : ""}
            </p>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
          </>
        )}
      </div>

      {/* Formulario lateral */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!saving) { setFormOpen(false); setEditing(null); } }}
          />
          {/* Panel */}
          <div className="w-full max-w-lg bg-surface border-l border-white/10 flex flex-col shadow-2xl">
            <PromotionForm
              initial={editing ?? EMPTY_FORM}
              onSave={handleSave}
              onClose={() => { setFormOpen(false); setEditing(null); }}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
