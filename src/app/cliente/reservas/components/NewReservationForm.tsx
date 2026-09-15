"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, MessageSquare,
  ChevronDown, ChevronUp, Check, AlertTriangle, Users,
} from "lucide-react";
import { DIETARY_OPTIONS, type GuestDietaryEntry, type DietaryRestriction } from "@/lib/types/reservation";
import { getDietaryIcon } from "@/lib/utils/dietaryIcons";
import ui from "../../cliente-ui.module.css";

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
  const safeEntry = {
    guestName: entry?.guestName ?? "",
    restrictions: Array.isArray(entry?.restrictions) ? entry.restrictions : [],
    notes: entry?.notes ?? "",
  };

  const toggleRestriction = (value: DietaryRestriction) => {
    const next = safeEntry.restrictions.includes(value)
      ? safeEntry.restrictions.filter((r) => r !== value)
      : [...safeEntry.restrictions, value];
    onChange({ ...safeEntry, restrictions: next });
  };

  const hasRestrictions = safeEntry.restrictions.length > 0;
  const guestLabel = safeEntry.guestName.trim() || `Invitado ${index + 1}`;

  return (
    <div className={ui.reservationGuestCard}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={ui.reservationGuestHeader}
      >
        <div className={ui.reservationGuestIdentity}>
          <div className={ui.reservationGuestNumber}>
            <span>{index + 1}</span>
          </div>
          <div className={ui.reservationGuestText}>
            <p>{guestLabel}</p>
            {hasRestrictions ? (
              <span className={ui.reservationGuestWarning}>
                <AlertTriangle size={10} />
                {safeEntry.restrictions.length} restricción{safeEntry.restrictions.length > 1 ? "es" : ""}
              </span>
            ) : (
              <span className={ui.reservationGuestMuted}>Sin restricciones</span>
            )}
          </div>
        </div>
        <div className={ui.reservationGuestActions}>
          {hasRestrictions && (
            <span className={ui.reservationGuestBadge}>
              {safeEntry.restrictions.length}
            </span>
          )}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={ui.reservationGuestBody}
          >
            <div className={ui.reservationGuestBodyInner}>
              <div className={ui.reservationField}>
                <label className={ui.reservationLabel}>
                  Nombre del invitado
                </label>
                <div className={ui.reservationInputWrap}>
                  <User size={14} className={ui.reservationInputIcon} />
                  <input
                    type="text"
                    value={safeEntry.guestName}
                    onChange={(e) => onChange({ ...safeEntry, guestName: e.target.value })}
                    placeholder="Ej: María, El abuelo…"
                    className={ui.reservationInput}
                  />
                </div>
              </div>

              <div className={ui.reservationField}>
                <label className={ui.reservationLabel}>
                  No puede comer / beber:
                </label>
                <div className={ui.reservationDietaryGrid}>
                  {DIETARY_OPTIONS.map((opt) => {
                    const selected = safeEntry.restrictions.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleRestriction(opt.value)}
                        className={`${ui.reservationDietaryChip} ${
                          selected ? ui.reservationDietaryChipSelected : ""
                        }`}
                      >
                        <span>{getDietaryIcon(opt.iconName, 13)}</span>
                        <span>{opt.label}</span>
                        {selected && <Check size={11} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={ui.reservationField}>
                <label className={ui.reservationLabel}>
                  Nota adicional (opcional)
                </label>
                <textarea
                  value={safeEntry.notes}
                  onChange={(e) => onChange({ ...safeEntry, notes: e.target.value })}
                  placeholder="Ej: alérgico severo al maní, intolerancia confirmada…"
                  rows={2}
                  className={ui.reservationTextarea}
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
  const dietaryEntries = Array.isArray(guestDietaryRestrictions) ? guestDietaryRestrictions : [];
  const safeGuests = Math.max(1, Number.isFinite(guests) ? guests : 1);

  const totalRestrictions = dietaryEntries.reduce(
    (sum, g) => sum + (Array.isArray(g?.restrictions) ? g.restrictions.length : 0),
    0
  );
  const guestsWithRestrictions = dietaryEntries.filter(
    (g) => Array.isArray(g?.restrictions) && g.restrictions.length > 0
  ).length;

  return (
    <motion.div
      className={ui.reservationDataPanel}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className={ui.reservationDataHeader}>
        <div>
          <span className={ui.reservationDataEyebrow}>Paso final</span>
          <h3>Tus datos</h3>
          <p>Dejanos un contacto para identificar tu mesa y avisarle al equipo si hay una ocasión especial.</p>
        </div>
        <div className={ui.reservationDataSeal}>
          <Check size={16} />
          Reserva segura
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className={ui.reservationDataForm} noValidate>
        <div className={ui.reservationField}>
          <label htmlFor="res-name" className={ui.reservationLabel}>
            Nombre completo <span>*</span>
          </label>
          <div className={ui.reservationInputWrap}>
            <User size={16} className={ui.reservationInputIcon} />
            <input
              id="res-name"
              type="text"
              value={values.customerName}
              onChange={(e) => onChange("customerName", e.target.value)}
              placeholder="Tu nombre completo"
              required
              className={ui.reservationInput}
            />
          </div>
        </div>

        <div className={ui.reservationField}>
          <label htmlFor="res-phone" className={ui.reservationLabel}>
            Teléfono <span>*</span>
          </label>
          <div className={ui.reservationInputWrap}>
            <Phone size={16} className={ui.reservationInputIcon} />
            <input
              id="res-phone"
              type="tel"
              value={values.customerPhone}
              onChange={(e) => onChange("customerPhone", e.target.value)}
              placeholder="+54 9 11 0000-0000"
              required
              className={ui.reservationInput}
            />
          </div>
        </div>

        <div className={ui.reservationField}>
          <label htmlFor="res-email" className={ui.reservationLabel}>
            Email
          </label>
          <div className={ui.reservationInputWrap}>
            <Mail size={16} className={ui.reservationInputIcon} />
            <input
              id="res-email"
              type="email"
              value={values.customerEmail}
              onChange={(e) => onChange("customerEmail", e.target.value)}
              placeholder="tu@email.com"
              className={ui.reservationInput}
            />
          </div>
        </div>

        <div className={`${ui.reservationField} ${ui.reservationFieldWide}`}>
          <label htmlFor="res-notes" className={ui.reservationLabel}>
            Comentario adicional
          </label>
          <div className={ui.reservationInputWrap}>
            <MessageSquare size={16} className={ui.reservationTextareaIcon} />
            <textarea
              id="res-notes"
              value={values.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Celebración especial, preferencia de zona…"
              rows={3}
              className={ui.reservationTextareaWithIcon}
            />
          </div>
        </div>

        <div className={`${ui.reservationDietarySection} ${ui.reservationFieldWide}`}>
          <button
            type="button"
            onClick={() => setShowDietary((v) => !v)}
            className={ui.reservationDietaryToggle}
          >
            <div className={ui.reservationDietaryIntro}>
              <div className={ui.reservationDietaryIconBox}>
                <AlertTriangle size={16} />
              </div>
              <div>
                <p>Restricciones dietéticas</p>
                <span>
                  {totalRestrictions > 0
                    ? `${totalRestrictions} restricción${totalRestrictions > 1 ? "es" : ""} en ${guestsWithRestrictions} invitado${guestsWithRestrictions !== 1 ? "s" : ""}`
                    : `Indicá si alguien no puede comer algo`}
                </span>
              </div>
            </div>
            <div className={ui.reservationDietaryToggleRight}>
              {totalRestrictions > 0 && (
                <span className={ui.reservationDietaryCount}>
                  {totalRestrictions}
                </span>
              )}
              {showDietary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          <AnimatePresence>
            {showDietary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={ui.reservationDietaryBody}
              >
                <div className={ui.reservationDietaryBodyInner}>
                  <p className={ui.reservationDietaryHint}>
                    <Users size={12} />
                    Expandí cada invitado para indicar sus restricciones
                  </p>
                  {Array.from({ length: safeGuests }, (_, i) => (
                    <GuestDietarySelector
                      key={i}
                      index={i}
                      entry={dietaryEntries[i] ?? { guestName: "", restrictions: [], notes: "" }}
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
          className={`${ui.reservationDataSubmit} ${ui.reservationFieldWide}`}
        >
          {loading ? "Procesando…" : "Continuar al resumen"}
        </button>
      </form>
    </motion.div>
  );
}
