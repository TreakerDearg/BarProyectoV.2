"use client";

import { motion } from "framer-motion";
import ui from "../../cliente-ui.module.css";

interface NewReservationFormProps {
  values: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes: string;
  };
  onChange: (field: "customerName" | "customerPhone" | "customerEmail" | "notes", value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function NewReservationForm({ values, onChange, onSubmit, loading }: NewReservationFormProps) {
  return (
    <div className={ui.newReservationForm}>
      <div className={ui.newReservationFormTitle}>Tus Datos</div>
      <p className={ui.newReservationFormSubtitle}>
        Completá la información para confirmar tu reserva
      </p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className={ui.newFormField}>
          <label className={ui.newFormFieldLabel} htmlFor="name">
            Nombre *
          </label>
          <input
            id="name"
            type="text"
            value={values.customerName}
            onChange={(e) => onChange("customerName", e.target.value)}
            placeholder="Tu nombre completo"
            className={ui.newFormFieldInput}
            required
          />
        </div>

        <div className={ui.newFormField}>
          <label className={ui.newFormFieldLabel} htmlFor="phone">
            Teléfono *
          </label>
          <input
            id="phone"
            type="tel"
            value={values.customerPhone}
            onChange={(e) => onChange("customerPhone", e.target.value)}
            placeholder="Tu número de teléfono"
            className={ui.newFormFieldInput}
            required
          />
        </div>

        <div className={ui.newFormField}>
          <label className={ui.newFormFieldLabel} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={values.customerEmail}
            onChange={(e) => onChange("customerEmail", e.target.value)}
            placeholder="tu@email.com"
            className={ui.newFormFieldInput}
          />
        </div>

        <div className={ui.newFormField}>
          <label className={ui.newFormFieldLabel} htmlFor="notes">
            Comentario opcional
          </label>
          <textarea
            id="notes"
            value={values.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Alguna preferencia especial..."
            className={ui.newFormFieldInput}
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={ui.newReservationSummaryButton}
        >
          {loading ? "Procesando..." : "Continuar al resumen"}
        </button>
      </motion.form>
    </div>
  );
}
