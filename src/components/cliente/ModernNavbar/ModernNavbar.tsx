"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GlassWater, ShoppingCart, User, Menu, X, Home, ChefHat, Sparkles, CalendarDays } from "lucide-react";
import styles from "./ModernNavbar.module.css";
import { useClienteStore } from "@/stores/useClienteStore";

const navLinks = [
  { href: "/cliente", label: "Inicio", icon: Home, exact: true },
  { href: "/cliente/carta", label: "Menú", icon: ChefHat },
  { href: "/cliente/ruleta", label: "Promociones", icon: Sparkles },
  { href: "/cliente/reservas", label: "Reservas", icon: CalendarDays },
];

export function ModernNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const cartItemCount = useClienteStore((state) => 
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );

  const isActive = (href: string, exact: boolean = false) => {
    return exact ? pathname === href : pathname.startsWith(href + "/") || pathname === href;
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          {/* Logo */}
          <Link href="/cliente" className={styles.logo}>
            <div className={styles.logoIcon}>
              <GlassWater className="h-5 w-5" />
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Nebula</span>
              <span className={styles.logoSubtitle}>Food & Beverage</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.navLinks}>
            {navLinks.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive(href, exact) ? styles.navLinkActive : ''}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className={styles.navActions}>
            <Link href="/cliente/pedido" className={styles.cartButton}>
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className={styles.cartBadge}>{cartItemCount}</span>
              )}
            </Link>
            <Link href="/cliente/cuenta" className={styles.accountButton}>
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={styles.mobileMenuButton}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuLinks}>
            {navLinks.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`${styles.mobileLink} ${isActive(href, exact) ? styles.mobileLinkActive : ''}`}
              >
                <Icon className="h-5 w-5" />
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
              <ShoppingCart className="h-5 w-5" />
              Carrito {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
            <Link
              href="/cliente/cuenta"
              onClick={() => setMobileOpen(false)}
              className={styles.mobileActionButton}
            >
              <User className="h-5 w-5" />
              Cuenta
            </Link>
          </div>
        </div>
      )}
    </>
  );
}