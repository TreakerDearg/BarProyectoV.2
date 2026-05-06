import { Users } from "lucide-react";
import styles from "../Reservas.module.css";

export function ReservationForm({
  values,
  onChange,
  onSubmit,
  loading,
}: any) {
  return (
    <form onSubmit={onSubmit} className={styles.sectionContent}>

      {/* HEADER */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <Users className="h-5 w-5" />
        </div>
        <h2 className={styles.sectionTitle}>Tus datos</h2>
      </div>

      {/* FORM GRID */}
      <div className={styles.formGrid}>

        {/* NOMBRE */}
        <div className={styles.formField}>
          <label className={styles.formLabel}>Nombre</label>
          <input
            type="text"
            required
            minLength={2}
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Ej: Juan Pérez"
            className={styles.formInput}
          />
        </div>

        {/* TELÉFONO */}
        <div className={styles.formField}>
          <label className={styles.formLabel}>Teléfono</label>
          <input
            type="tel"
            required
            minLength={6}
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Ej: 3764 123456"
            className={styles.formInput}
          />
        </div>

        {/* EMAIL */}
        <div className={styles.formFieldFull}>
          <label className={styles.formLabel}>Email (opcional)</label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="tu@email.com"
            className={styles.formInput}
          />
        </div>

        {/* NOTAS */}
        <div className={styles.formFieldFull}>
          <label className={styles.formLabel}>Notas</label>
          <textarea
            rows={3}
            value={values.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Cumpleaños, alergias, ubicación preferida..."
            className={styles.formTextarea}
          />
        </div>

      </div>

      {/* CTA */}
      <button
        type="submit"
        disabled={loading}
        className={styles.submitBtn}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className={styles.spinner} />
            Confirmando...
          </span>
        ) : (
          "Confirmar reserva"
        )}
      </button>
    </form>
  );
}