"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  ClipboardList,
  GlassWater,
  Home,
  Sparkles,
  UserCircle,
  CalendarDays,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import styles from "./ClienteNav.module.css";
import { useClienteStore } from "@/stores/useClienteStore";
import { CartDrawer } from "./CartDrawer";

const links = [
  { href: "/cliente", label: "Inicio", icon: Home, exact: true },
  { href: "/cliente/carta", label: "Carta", icon: ChefHat },
  { href: "/cliente/ruleta", label: "Ruleta", icon: Sparkles },
  { href: "/cliente/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/cliente/cuenta", label: "Cuenta", icon: UserCircle },
];

export function ClienteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Obtener cantidad de items en carrito del Zustand store
  const cartItemCount = useClienteStore((state) => 
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/cliente" className={styles.logo}>
            <div className={styles.logoIcon}>
              <GlassWater className="h-5 w-5" />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Nebula</span>
              <span className={styles.logoSubtitle}>Food & Beverage</span>
            </div>
          </Link>

          <nav className={styles.navLinks}>
            {links.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact
                ? pathname === href
                : pathname.startsWith(href + "/") || pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(styles.navLink, isActive && styles.navLinkActive)}
                >
                  <Icon className={styles.navLinkIcon} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Cart Drawer (Desktop) */}
          <CartDrawer />

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={styles.menuBtn}
          >
            {mobileOpen ? (
              <X className={styles.menuIcon} />
            ) : (
              <Menu className={styles.menuIcon} />
            )}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileMenuInner}>
            {links.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact
                ? pathname === href
                : pathname.startsWith(href + "/") || pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    styles.mobileLink,
                    isActive && styles.mobileLinkActive
                  )}
                >
                  <Icon className={styles.mobileLinkIcon} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <nav className={styles.dock}>
        <div className={styles.dockInner}>
          {links.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname.startsWith(href + "/") || pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={clsx(styles.dockLink, isActive && styles.dockLinkActive)}
              >
                <div className={styles.dockIcon}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={styles.dockLabel}>{label}</span>
                {isActive && <div className={styles.dockIndicator} />}
              </Link>
            );
          })}
          
          {/* Cart Drawer (Mobile Dock) */}
          <div className={clsx(styles.dockLink, pathname === "/cliente/pedido" && styles.dockLinkActive)}>
            <CartDrawer />
          </div>
        </div>
      </nav>
    </>
  );
}