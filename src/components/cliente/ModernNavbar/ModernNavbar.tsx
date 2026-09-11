"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  GlassWater, ShoppingCart, User, Menu, X,
  Home, ChefHat, Dices, CalendarDays, Monitor, LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./ModernNavbar.module.css";
import { useClienteStore } from "@/stores/useClienteStore";
import { EmployeeModal } from "@/app/cliente/cuenta/components/EmployeeModal";
import { resolveEmployeeSystemUrl } from "@/lib/api/network";
import type { EmployeeDecision } from "@/hooks/useAuth";
import { clearTokens } from "@/lib/auth/tokenStorage";

// ── Constantes ────────────────────────────────────────────────────

const navLinks = [
  { href: "/cliente",          label: "Inicio",   icon: Home,         exact: true  },
  { href: "/cliente/carta",    label: "Carta",    icon: ChefHat                    },
  { href: "/cliente/ruleta",   label: "Ruleta",   icon: Dices                      },
  { href: "/cliente/reservas", label: "Reservas", icon: CalendarDays               },
];

/** Roles que NO son clientes — deben ver el EmployeeModal */
const STAFF_ROLES = new Set([
  "admin", "manager", "bartender", "waiter",
  "cashier", "kitchen", "employee",
]);

function isStaff(role?: string | null): boolean {
  return !!role && STAFF_ROLES.has(role.toLowerCase());
}

// ── Componente ────────────────────────────────────────────────────

export function ModernNavbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const navRef   = useRef<HTMLElement>(null);

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [navHeight,   setNavHeight]   = useState(72);

  // Estado del EmployeeModal — se activa cuando el store tiene un usuario con rol de staff
  const [employeeModal, setEmployeeModal] = useState<EmployeeDecision | null>(null);
  // Controla si el usuario staff ya eligió "continuar como cliente" esta sesión
  const [staffDismissed, setStaffDismissed] = useState(false);

  const cartItemCount = useClienteStore((s) =>
    s.cart.reduce((sum, item) => sum + item.quantity, 0)
  );
  const user  = useClienteStore((s) => s.user);
  const token = useClienteStore((s) => s.token);

  const firstName   = user?.name?.split(" ")[0] ?? null;
  const userIsStaff = isStaff(user?.role);

  // ── Mostrar EmployeeModal cuando el usuario autenticado es staff ──
  // Se activa en dos casos:
  //   A) Login con email/password → el hook useAuth ya lo detecta, pero
  //      si el usuario navega a otro componente, el modal puede haberse cerrado.
  //      Lo re-abrimos aquí basado en el store persistido.
  //   B) Login con Google → el callback redirige a /auth/callback con params,
  //      que dispara useAuth.processOAuthCallback → setEmployeeDecision en el hook.
  //      Eso se maneja en CuentaPage. Aquí lo complementamos con el store.
  useEffect(() => {
    if (!token || !user || staffDismissed) return;
    if (!userIsStaff) return;

    // Solo mostrar si estamos en rutas del cliente (no en /auth/callback ni /cliente/cuenta)
    const isAuthRoute    = pathname.startsWith("/auth");
    const isAccountRoute = pathname === "/cliente/cuenta";
    if (isAuthRoute || isAccountRoute) return;

    // Mostrar el modal con la decisión genérica para staff
    setEmployeeModal({
      employeeDestination:  resolveEmployeeSystemUrl(),
      identityStatus:       user.role?.toUpperCase() ?? "EMPLOYEE",
      identityStatusLabel:  user.role ?? "Empleado",
      desktopAccessMessage: null,
    });
  }, [token, user, staffDismissed, userIsStaff, pathname]);

  // Cerrar menú en cambio de ruta
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Cerrar menú con Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // Calcular altura real del navbar para el top del mobileMenu
  useEffect(() => {
    if (navRef.current) setNavHeight(navRef.current.getBoundingClientRect().height);
  }, []);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href + "/") || pathname === href;

  // ── Logout ──────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    setEmployeeModal(null);
    setStaffDismissed(false);
    clearTokens();
    // Limpiar store
    useClienteStore.getState().logout?.();
    // Redirigir al login
    router.push("/cliente/cuenta");
  }, [router]);
  const handleGoToSystem = useCallback(() => {
    setEmployeeModal(null);
    setStaffDismissed(true);
    const dest = resolveEmployeeSystemUrl();
    // Intentar abrir en el navegador o redirigir
    if (/^https?:\/\//.test(dest)) {
      window.open(dest, "_blank", "noopener,noreferrer");
    } else {
      router.push(dest);
    }
  }, [router]);

  const handleContinueAsClient = useCallback(() => {
    setEmployeeModal(null);
    setStaffDismissed(true);
    // No cerrar sesión — el usuario staff puede seguir en el cliente web
  }, []);

  return (
    <>
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav
        ref={navRef}
        className={`${styles.navbar} ${userIsStaff ? styles.navbarEmployee : ""}`}
        aria-label="Navegación principal"
      >
        <div className={styles.navbarContainer}>

          {/* Logo */}
          <Link href="/cliente" className={styles.logo}>
            <div className={styles.logoIcon}>
              <GlassWater className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Nebula</span>
              <span className={styles.logoSubtitle}>Food & Beverage</span>
            </div>
          </Link>

          {/* Links desktop */}
          <div className={styles.navLinks} role="list">
            {navLinks.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                role="listitem"
                className={`${styles.navLink} ${isActive(href, exact) ? styles.navLinkActive : ""}`}
                aria-current={isActive(href, exact) ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          {/* Acciones */}
          <div className={styles.navActions}>
            <Link
              href="/cliente/pedido"
              className={styles.cartButton}
              aria-label={`Carrito${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge} aria-hidden="true">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* Botón de cuenta — si es staff, muestra badge especial */}
            {userIsStaff ? (
              <button
                type="button"
                onClick={() => setEmployeeModal({
                  employeeDestination:  resolveEmployeeSystemUrl(),
                  identityStatus:       user!.role?.toUpperCase() ?? "EMPLOYEE",
                  identityStatusLabel:  user!.role ?? "Empleado",
                  desktopAccessMessage: null,
                })}
                className={styles.employeeBadgeBtn}
                aria-label="Cuenta de empleado — abrir opciones"
                title="Sos un empleado — elegí dónde continuar"
              >
                <Monitor className="h-4 w-4" aria-hidden="true" />
                <span className={styles.employeeBadgeName}>
                  {firstName ?? "Empleado"}
                </span>
              </button>
            ) : (
              <Link
                href="/cliente/cuenta"
                className={styles.accountButton}
                aria-label="Mi cuenta"
              >
                {firstName
                  ? <span className={styles.accountName}>{firstName}</span>
                  : <User className="h-5 w-5" aria-hidden="true" />
                }
              </Link>
            )}

            {/* Botón de logout — solo si hay sesión activa */}
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutButton}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Hamburguesa mobile */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={styles.mobileMenuButton}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? <X className="h-5 w-5"    aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />
            }
          </button>
        </div>

        {/* Banner de staff — si hay empleado autenticado sin modal */}
        {userIsStaff && staffDismissed && (
          <div className={styles.staffBanner}>
            <Monitor size={13} aria-hidden="true" />
            <span>
              Navegás como <strong>{user?.role}</strong> —{" "}
            </span>
            <button
              type="button"
              className={styles.staffBannerBtn}
              onClick={() => {
                setStaffDismissed(false);
                setEmployeeModal({
                  employeeDestination:  resolveEmployeeSystemUrl(),
                  identityStatus:       user!.role?.toUpperCase() ?? "EMPLOYEE",
                  identityStatusLabel:  user!.role ?? "Empleado",
                  desktopAccessMessage: null,
                });
              }}
            >
              acceder al sistema
            </button>
          </div>
        )}
      </nav>

      {/* ── MENÚ MOBILE ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            style={{ top: navHeight }}
            role="dialog"
            aria-label="Menú de navegación"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.mobileMenuLinks}>
              {navLinks.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`${styles.mobileLink} ${isActive(href, exact) ? styles.mobileLinkActive : ""}`}
                  aria-current={isActive(href, exact) ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>

            <div className={styles.mobileActions}>
              <Link
                href="/cliente/pedido"
                onClick={() => setMobileOpen(false)}
                className={styles.mobileActionButton}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                Carrito {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>

              {userIsStaff ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setEmployeeModal({
                      employeeDestination:  resolveEmployeeSystemUrl(),
                      identityStatus:       user!.role?.toUpperCase() ?? "EMPLOYEE",
                      identityStatusLabel:  user!.role ?? "Empleado",
                      desktopAccessMessage: null,
                    });
                  }}
                  className={styles.mobileActionButton}
                >
                  <Monitor className="h-5 w-5" aria-hidden="true" />
                  {firstName ?? "Empleado"}
                </button>
              ) : (
                <Link
                  href="/cliente/cuenta"
                  onClick={() => setMobileOpen(false)}
                  className={styles.mobileActionButton}
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  {firstName ?? "Cuenta"}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMPLOYEE MODAL ───────────────────────────────────── */}
      <EmployeeModal
        decision={employeeModal}
        onGoToSystem={handleGoToSystem}
        onContinueAsClient={handleContinueAsClient}
      />
    </>
  );
}
