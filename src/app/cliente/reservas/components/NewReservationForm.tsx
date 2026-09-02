"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, MessageSquare,
  ChevronDown, ChevronUp, Check, AlertTriangle, Users,
} from "lucide-react";
import { DIETARY_OPTIONS, type GuestDietaryEntry, type DietaryRestriction } from "@/lib/types/reservation";
import { getDietaryIcon } from "@/lib/utils/dietaryIcons";

// ── Tipos ─────────────────────────────────────────────────────────

interface NewReservationFormProps {
  values: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string;
  };
  guests: number;
  guestDietaryRestrictions: GuestDietaryEntry[];
  onChange: (field: "customerName" | "customerPhone" | "customerEmail" | "notes", value: string) => void;
  onDietaryChange: (index: number, entry: GuestDietaryEntry) => void;
  onSubmit: () => void;
  loading: boolean;
}

// ── Selector de restricciones de un invitado ──────────────────────

function GuestDietarySelector({
  index,
  entry,
  onChange,
}: {
  index: number;
  entry: GuestDietaryEntry;
  onChange: (e: GuestDietaryEntry) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleRestriction = (value: DietaryRestriction) => {
    const next = entry.restrictions.includes(value)
      ? entry.restrictions.filter((r) => r !== value)
      : [...entry.restrictions, value];
    onChange({ ...entry, restrictions: next });
  };

  const hasRestrictions = entry.restrictions.length > 0;
  const guestLabel = entry.guestName.trim() || `Invitado ${index + 1}`;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
      {/* Header del invitado */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gold">{index + 1}</span>
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold truncate">{guestLabel}</p>
            {hasRestrictions ? (
              <p className="text-xs text-gold/70 truncate flex items-center gap-1">
                <AlertTriangle size={10} />
                {entry.restrictions.length} restricción{entry.restrictions.length > 1 ? "es" : ""}
              </p>
            ) : (
              <p className="text-xs text-muted/50">Sin restricciones</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasRestrictions && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300">
              {entry.restrictions.length}
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/6">
              {/* Nombre del invitado */}
              <div className="pt-3">
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Nombre del invitado
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={entry.guestName}
                    onChange={(e) => onChange({ ...entry, guestName: e.target.value })}
                    placeholder="Ej: María, El abuelo…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface/50 border border-white/10 text-sm placeholder:text-muted/40 focus:border-gold/40 focus:ring-2 focus:ring-gold/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Grid de restricciones con iconos Lucide */}
              <div>
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-2">
                  No puede comer / beber:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DIETARY_OPTIONS.map((opt) => {
                    const selected = entry.restrictions.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleRestriction(opt.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                          selected
                            ? opt.color
                            : "bg-white/4 border-white/8 text-muted hover:bg-white/8"
                        }`}
                      >
                        <span className="flex-shrink-0">{getDietaryIcon(opt.iconName, 13)}</span>
                        <span className="truncate">{opt.label}</span>
                        {selected && <Check size={11} className="ml-auto flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nota libre */}
              <div>
                <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Nota adicional (opcional)
                </label>
                <textarea
                  value={entry.notes ?? ""}
                  onChange={(e) => onChange({ ...entry, notes: e.target.value })}
                  placeholder="Ej: alérgico severo al maní, intolerancia confirmada…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-surface/50 border border-white/10 text-sm placeholder:text-muted/40 focus:border-gold/40 focus:ring-2 focus:ring-gold/10 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export function NewReservationForm({
  values,
  guests,
  guestDietaryRestrictions,
  onChange,
  onDietaryChange,
  onSubmit,
  loading,
}: NewReservationFormProps) {
  const [showDietary, setShowDietary] = useState(false);

  const totalRestrictions = guestDietaryRestrictions.reduce(
    (sum, g) => sum + g.restrictions.length,
    0
  );
  const guestsWithRestrictions = guestDietaryRestrictions.filter((g) => g.restrictions.length > 0).length;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <h3 className="text-xl font-bold">Tus datos</h3>
        <p className="text-sm text-muted mt-0.5">Completá la información para confirmar la reserva</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4" noValidate>

        {/* Nombre */}
        <div>
          <label htmlFor="res-name" className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            Nombre completo <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="res-name"
              type="text"
              value={values.customerName}
              onChange={(e) => onChange("customerName", e.target.value)}
              placeholder="Tu nombre completo"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/10 placeholder:text-muted/40 focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="res-phone" className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            Teléfono <span className="text-gold">*</span>
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="res-phone"
              type="tel"
              value={values.customerPhone}
              onChange={(e) => onChange("customerPhone", e.target.value)}
              placeholder="+54 9 11 0000-0000"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/10 placeholder:text-muted/40 focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="res-email" className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="res-email"
              type="email"
              value={values.customerEmail}
              onChange={(e) => onChange("customerEmail", e.target.value)}
              placeholder="tu@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/10 placeholder:text-muted/40 focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label htmlFor="res-notes" className="text-[11px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
            Comentario adicional
          </label>
          <div className="relative">
            <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-muted" />
            <textarea
              id="res-notes"
              value={values.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Celebración especial, preferencia de zona…"
              rows={3}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-white/10 placeholder:text-muted/40 focus:border-gold/50 focus:ring-2 focus:ring-gold/10 outline-none transition-all text-sm resize-none"
            />
          </div>
        </div>

        {/* ── RESTRICCIONES DIETÉTICAS ─────────────────────────── */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDietary((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white/3 hover:bg-white/6 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/20">
                <AlertTriangle size={15} className="text-amber-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Restricciones dietéticas</p>
                <p className="text-xs text-muted/70">
                  {totalRestrictions > 0
                    ? `${totalRestrictions} restricción${totalRestrictions > 1 ? "es" : ""} en ${guestsWithRestrictions} invitado${guestsWithRestrictions !== 1 ? "s" : ""}`
                    : `Indicá si alguien no puede comer algo`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {totalRestrictions > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300">
                  {totalRestrictions}
                </span>
              )}
              {showDietary ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
            </div>
          </button>

          <AnimatePresence>
            {showDietary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3 border-t border-white/8">
                  <p className="text-xs text-muted/70 flex items-center gap-1.5">
                    <Users size={12} />
                    Expandí cada invitado para indicar sus restricciones
                  </p>
                  {Array.from({ length: guests }, (_, i) => (
                    <GuestDietarySelector
                      key={i}
                      index={i}
                      entry={guestDietaryRestrictions[i] ?? { guestName: "", restrictions: [], notes: "" }}
                      onChange={(entry) => onDietaryChange(i, entry)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={loading || !values.customerName || !values.customerPhone}
          className="w-full py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, var(--gold-dark,#A87C28) 0%, var(--gold,#D4A340) 50%, var(--gold-light,#E8BC5A) 100%)",
            color: "var(--bg-deep,#08090C)",
            boxShadow: "0 4px 20px rgba(212,163,64,0.3)",
          }}
        >
          {loading ? "Procesando…" : "Continuar al resumen"}
        </button>
      </form>
    </motion.div>
  );
}
