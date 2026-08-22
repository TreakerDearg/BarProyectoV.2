"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import {
  GlassWater, ShoppingCart, User, Menu, X,
  Home, ChefHat, Dices, CalendarDays,
} from "lucide-react";
import styles from "./ModernNavbar.module.css";
import { useClienteStore } from "@/stores/useClienteStore";

const navLinks = [
  { href: "/cliente",          label: "Inicio",    icon: Home,         exact: true },
  { href: "/cliente/carta",    label: "Carta",     icon: ChefHat },
  { href: "/cliente/ruleta",   label: "Ruleta",    icon: Dices },
  { href: "/cliente/reservas", label: "Reservas",  icon: CalendarDays },
];

export function ModernNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Leer auth del store
  const cartItemCount = useClienteStore((s) =>
    s.cart.reduce((sum, item) => sum + item.quantity, 0)
  );
  const user = useClienteStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? null;

  // Cerrar menu en cambio de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Cerrar menu con Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href + "/") || pathname === href;

  // Altura real del navbar para el top del mobileMenu
  const [navHeight, setNavHeight] = useState(72);
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <nav ref={navRef} className={styles.navbar} aria-label="Navegación principal">
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

          {/* Desktop nav links */}
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

          {/* Desktop actions */}
          <div className={styles.navActions}>
            {/* Carrito — solo visible en desktop (en mobile está en el dock) */}
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

            {/* Cuenta con nombre si está autenticado */}
            <Link href="/cliente/cuenta" className={styles.accountButton} aria-label="Mi cuenta">
              {firstName ? (
                <span className={styles.accountName}>{firstName}</span>
              ) : (
                <User className="h-5 w-5" aria-hidden="true" />
              )}
            </Link>
          </div>

          {/* Mobile hamburger — oculto en ≥1024px porque el dock ya navega */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={styles.mobileMenuButton}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen
              ? <X className="h-5 w-5" aria-hidden="true" />
              : <Menu className="h-5 w-5" aria-hidden="true" />
            }
          </button>
        </div>
      </nav>

      {/* Mobile Menu — top calculado dinámicamente */}
      {mobileOpen && (
        <div
          className={styles.mobileMenu}
          style={{ top: navHeight }}
          role="dialog"
          aria-label="Menú de navegación"
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
            <Link
              href="/cliente/cuenta"
              onClick={() => setMobileOpen(false)}
              className={styles.mobileActionButton}
            >
              <User className="h-5 w-5" aria-hidden="true" />
              {firstName ? firstName : "Cuenta"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
