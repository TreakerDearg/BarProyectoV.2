"use client";

import { UserCircle } from "lucide-react";
import { AppAccountPanel } from "@/components/cliente-app/AppAccountPanel";
import styles from "../app-page.module.css";

export default function AppCuentaPage() {
  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Cuenta</span>
        <h1 className={styles.title}>Tu espacio Nebula</h1>
        <p className={styles.description}>Gestiona tu perfil, tus reservas y las preferencias de tu experiencia.</p>
      </header>
      <section className={styles.panel}>
        <UserCircle size={23} color="var(--app-gold-bright)" aria-hidden="true" />
        <AppAccountPanel />
      </section>
    </main>
  );
}
