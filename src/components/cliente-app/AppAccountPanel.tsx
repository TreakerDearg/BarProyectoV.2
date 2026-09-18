"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth/tokenStorage";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./AppAccountPanel.module.css";

export function AppAccountPanel() {
  const router = useRouter();
  const user = useClienteStore((state) => state.user);
  const logout = useClienteStore((state) => state.logout);
  const name = user?.name ?? "Invitado";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    clearTokens();
    logout();
    router.push("/cliente/app");
  };

  return (
    <>
      <div className={styles.profile}>
        <span className={styles.avatar}>{initials}</span>
        <div className={styles.profileText}><p className={styles.name}>{name}</p><p className={styles.meta}>{user ? "Miembro de Nebula" : "Modo invitado"}</p></div>
      </div>
      <div className={styles.actions}>
        {!user && <Link href="/cliente/cuenta" className={styles.action}><span className={styles.actionIcon}><LogIn size={18} /> Iniciar sesión</span><ArrowRight size={16} /></Link>}
        <Link href="/cliente/app/reservas" className={styles.action}><span className={styles.actionIcon}><CalendarDays size={18} /> Mis reservas</span><ArrowRight size={16} /></Link>
        <Link href="/cliente/app/carta?filter=favorites" className={styles.action}><span className={styles.actionIcon}><Heart size={18} /> Favoritos</span><ArrowRight size={16} /></Link>
        <div className={styles.action}><span className={styles.actionIcon}><ShieldCheck size={18} /> Datos protegidos</span></div>
      </div>
      {user && <button type="button" className={styles.logout} onClick={handleLogout}><LogOut size={16} /> Cerrar sesión</button>}
    </>
  );
}
