"use client";

import { CalendarDays, Clock3, Users } from "lucide-react";
import { AppReservationForm } from "@/components/cliente-app/AppReservationForm";
import styles from "../app-page.module.css";

export default function AppReservasPage() {
  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Reservas</span>
        <h1 className={styles.title}>Guarda tu próxima noche</h1>
        <p className={styles.description}>Reserva en pocos pasos. Te contactaremos para confirmar la disponibilidad.</p>
      </header>
      <section className={styles.panel}>
        <div className={styles.listItem}><CalendarDays size={19} color="var(--app-gold-bright)" /><span>Elige fecha y hora</span></div>
        <div className={styles.listItem}><Users size={19} color="var(--app-gold-bright)" /><span>Indica cuántas personas son</span></div>
        <div className={styles.listItem}><Clock3 size={19} color="var(--app-gold-bright)" /><span>Recibe confirmación del equipo</span></div>
      </section>
      <section className={styles.panel} aria-labelledby="reservation-form-title">
        <h2 id="reservation-form-title" className={styles.panelTitle}>Nueva reserva</h2>
        <AppReservationForm />
      </section>
    </main>
  );
}
