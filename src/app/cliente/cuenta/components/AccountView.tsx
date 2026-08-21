"use client";

import Link from "next/link";
import { memo } from "react";
import { roleLabel } from "@/lib/auth/roles";
import type { AuthUser } from "@/lib/types/api";
import styles from "./AccountView.module.css";

// ─────────────────────────────────────────────────────────────────
// AccountView — perfil del cliente autenticado
//
// Solo muestra secciones con datos reales que existen en el sistema.
// No hay historial de pedidos (no existe endpoint), se omite.
// ─────────────────────────────────────────────────────────────────

interface AccountViewProps {
  user: AuthUser;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.navIcon} aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.navIcon} aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.navIcon} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RouletteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.navIcon} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={styles.chevron} aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/cliente/carta",
    label: "Nuestra carta",
    description: "Explorá bebidas y platos",
    icon: <MenuIcon />,
  },
  {
    href: "/cliente/reservas",
    label: "Mis reservas",
    description: "Revisá o creá una reserva",
    icon: <CalendarIcon />,
  },
  {
    href: "/cliente/ruleta",
    label: "Ruleta Nebula",
    description: "Descubrí qué pedir esta noche",
    icon: <RouletteIcon />,
  },
];

export const AccountView = memo(function AccountView({
  user,
  onLogout,
}: AccountViewProps) {
  // Inicial del nombre para el avatar
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={styles.wrapper}>
      {/* ── Header con identidad ──────────────────────────────────*/}
      <div className={styles.header}>
        {/* Avatar */}
        <div className={styles.avatar} aria-hidden="true">
          <span className={styles.avatarInitials}>{initials}</span>
        </div>

        <div className={styles.headerText}>
          <p className={styles.greeting}>
            Hola, <span className={styles.greetingName}>{user.name.split(" ")[0]}</span> 👋
          </p>
          <p className={styles.roleLabel}>{roleLabel(user.role)}</p>
        </div>
      </div>

      {/* ── Datos del perfil ─────────────────────────────────────*/}
      <section className={styles.profileCard} aria-label="Información de tu cuenta">
        <div className={styles.profileField}>
          <span className={styles.profileFieldLabel}>Nombre</span>
          <span className={styles.profileFieldValue}>{user.name}</span>
        </div>
        <div className={styles.profileDivider} aria-hidden="true" />
        <div className={styles.profileField}>
          <span className={styles.profileFieldLabel}>Email</span>
          <span className={styles.profileFieldValue}>{user.email}</span>
        </div>
      </section>

      {/* ── Navegación ────────────────────────────────────────────*/}
      <nav className={styles.nav} aria-label="Accesos rápidos">
        <p className={styles.navSectionLabel}>Explorá Nebula</p>
        <div className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.navItem}
            >
              <div className={styles.navItemIcon}>{item.icon}</div>
              <div className={styles.navItemText}>
                <span className={styles.navItemLabel}>{item.label}</span>
                <span className={styles.navItemDesc}>{item.description}</span>
              </div>
              <ChevronRightIcon />
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Cerrar sesión ─────────────────────────────────────────*/}
      <div className={styles.logoutWrapper}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={onLogout}
          aria-label="Cerrar sesión"
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles.logoutIcon} aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
});
