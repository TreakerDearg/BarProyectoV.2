"use client";

import { motion } from "framer-motion";
import { Users, User, Phone, Mail, MessageSquare, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import ui from "../../cliente-ui.module.css";

interface ReservationFormProps {
  values: {
    name: string;
    phone: string;
    email?: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  loading: boolean;
}

interface FieldError {
  name?: string;
  phone?: string;
  email?: string;
}

export function ReservationForm({
  values,
  onChange,
  onSubmit,
  loading,
}: ReservationFormProps) {
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "El nombre es requerido";
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
        return undefined;
      case "phone":
        if (!value.trim()) return "El teléfono es requerido";
        if (value.trim().length < 6) return "El teléfono debe tener al menos 6 caracteres";
        return undefined;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Email inválido";
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    onChange(name, value);
    if (touched.has(name)) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <form onSubmit={onSubmit} className={ui.reservationForm} noValidate>

      {/* HEADER */}
      <div className={ui.reservationFormHeader}>
        <Users className={ui.reservationFormIcon} />
        <div>
          <h3 className={ui.reservationFormTitle}>Tus Datos</h3>
          <p className={ui.reservationFormSubtitle}>
            Completá la información para confirmar tu reserva
          </p>
        </div>
      </div>

      {/* FORM GRID */}
      <div className={ui.reservationFormGrid}>

        {/* NOMBRE */}
        <div className={ui.reservationFormField}>
          <label className={ui.reservationFormLabel}>
            Nombre completo
          </label>
          <div className={ui.reservationFormInputWrapper}>
            <User className={ui.reservationFormInputIcon} />
            <input
              type="text"
              required
              minLength={2}
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={(e) => handleBlur("name", e.target.value)}
              placeholder="Ej: Juan Pérez"
              className={`${ui.reservationFormInput} ${
                touched.has("name") && errors.name ? ui.reservationFormInputError : ""
              } ${
                touched.has("name") && !errors.name && values.name ? ui.reservationFormInputSuccess : ""
              }`}
            />
            {touched.has("name") && errors.name && (
              <AlertCircle className={ui.reservationFormErrorIcon} />
            )}
            {touched.has("name") && !errors.name && values.name && (
              <Check className={ui.reservationFormSuccessIcon} />
            )}
          </div>
          {touched.has("name") && errors.name && (
            <motion.p
              className={ui.reservationFormError}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.name}
            </motion.p>
          )}
        </div>

        {/* TELÉFONO */}
        <div className={ui.reservationFormField}>
          <label className={ui.reservationFormLabel}>
            Teléfono
          </label>
          <div className={ui.reservationFormInputWrapper}>
            <Phone className={ui.reservationFormInputIcon} />
            <input
              type="tel"
              required
              minLength={6}
              value={values.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onBlur={(e) => handleBlur("phone", e.target.value)}
              placeholder="Ej: 3764 123456"
              className={`${ui.reservationFormInput} ${
                touched.has("phone") && errors.phone ? ui.reservationFormInputError : ""
              } ${
                touched.has("phone") && !errors.phone && values.phone ? ui.reservationFormInputSuccess : ""
              }`}
            />
            {touched.has("phone") && errors.phone && (
              <AlertCircle className={ui.reservationFormErrorIcon} />
            )}
            {touched.has("phone") && !errors.phone && values.phone && (
              <Check className={ui.reservationFormSuccessIcon} />
            )}
          </div>
          {touched.has("phone") && errors.phone && (
            <motion.p
              className={ui.reservationFormError}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.phone}
            </motion.p>
          )}
        </div>

        {/* EMAIL */}
        <div className={ui.reservationFormField}>
          <label className={ui.reservationFormLabel}>
            Email (opcional)
          </label>
          <div className={ui.reservationFormInputWrapper}>
            <Mail className={ui.reservationFormInputIcon} />
            <input
              type="email"
              value={values.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              placeholder="tu@email.com"
              className={`${ui.reservationFormInput} ${
                touched.has("email") && errors.email ? ui.reservationFormInputError : ""
              } ${
                touched.has("email") && !errors.email && values.email ? ui.reservationFormInputSuccess : ""
              }`}
            />
            {touched.has("email") && errors.email && (
              <AlertCircle className={ui.reservationFormErrorIcon} />
            )}
            {touched.has("email") && !errors.email && values.email && (
              <Check className={ui.reservationFormSuccessIcon} />
            )}
          </div>
          {touched.has("email") && errors.email && (
            <motion.p
              className={ui.reservationFormError}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* NOTAS */}
        <div className={`${ui.reservationFormField} ${ui.reservationFormFieldFull}`}>
          <label className={ui.reservationFormLabel}>
            Notas especiales (opcional)
          </label>
          <div className={ui.reservationFormTextareaWrapper}>
            <MessageSquare className={ui.reservationFormTextareaIcon} />
            <textarea
              rows={3}
              value={values.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Cumpleaños, alergias, ubicación preferida, ocasión especial..."
              className={ui.reservationFormTextarea}
            />
          </div>
          <p className={ui.reservationFormHint}>
            Máximo 200 caracteres
          </p>
        </div>

      </div>

      {/* CTA */}
      <motion.button
        type="submit"
        disabled={loading || hasErrors}
        className={ui.reservationFormSubmit}
        whileHover={!loading && !hasErrors ? { scale: 1.02 } : {}}
        whileTap={!loading && !hasErrors ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <span className={ui.reservationFormLoading}>
            <span className={ui.reservationFormSpinner} />
            Confirmando reserva...
          </span>
        ) : (
          <span className={ui.reservationFormSubmitText}>
            Confirmar Reserva
          </span>
        )}
      </motion.button>

    </form>
  );
}