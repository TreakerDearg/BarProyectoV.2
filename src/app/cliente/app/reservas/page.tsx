"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import styles from "../app-page.module.css";

export default function AppReservasPage() {
  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Reservas</span>
        <h1 className={styles.title}>Guarda tu próxima noche</h1>
        <p className={styles.description}>Elige una fecha y deja que nosotros preparemos el resto.</p>
      </header>
      <section className={styles.panel}>
        <CalendarDays size={22} color="var(--gold-light)" aria-hidden="true" />
        <h2 className={styles.panelTitle}>Reserva desde la app</h2>
        <p className={styles.panelText}>La agenda rápida para clientes estará disponible aquí muy pronto.</p>
        <Link className={styles.button} href="/cliente/reservas">Gestionar reserva <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
