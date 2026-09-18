"use client";

import Link from "next/link";
import { ArrowRight, UserCircle } from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "../app-page.module.css";

export default function AppCuentaPage() {
  const user = useClienteStore((state) => state.user);
  const name = user?.name ?? "Invitado";

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Cuenta</span>
        <h1 className={styles.title}>Tu experiencia, a tu manera</h1>
        <p className={styles.description}>Administra tus datos, preferencias y beneficios desde un solo lugar.</p>
      </header>
      <section className={styles.panel}>
        <UserCircle size={26} color="var(--gold-light)" aria-hidden="true" />
        <h2 className={styles.panelTitle}>{name}</h2>
        <p className={styles.panelText}>{user ? "Sesión iniciada en Nebula." : "Continúa como invitado o inicia sesión para guardar tus preferencias."}</p>
        <Link className={styles.button} href="/cliente/cuenta">Abrir mi cuenta <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
