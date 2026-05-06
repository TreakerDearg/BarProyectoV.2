import { CalendarDays } from "lucide-react";
import styles from "../Reservas.module.css";

export function ReservationHeader() {
  return (
    <header className={styles.pageHeader}>

      {/* ICONO */}
      <div className={styles.pageIcon}>
        <CalendarDays className="h-6 w-6" />
      </div>

      {/* TITULO */}
      <h1 className={`${styles.pageTitle} font-display`}>
        Reservá tu mesa en{" "}
        <span className="bg-[linear-gradient(135deg,#d4a340,#fbbf24)] bg-clip-text text-transparent">
          Nebula
        </span>
      </h1>

      {/* SUBTITULO */}
      <p className={styles.pageSubtitle}>
        Elegí el horario, la cantidad de personas y asegurá tu experiencia
        gastronómica con disponibilidad en tiempo real.
      </p>

      {/* DECORACIÓN SUTIL */}
      <div className="mt-4 flex justify-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
      </div>
    </header>
  );
}