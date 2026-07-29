"use client";

import { useEffect, useState } from "react";
import { memo } from "react";
import Link from "next/link";
import { GlassWater, ShoppingCart, Menu } from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import { CartDrawer } from "../CartDrawer";
import ui from "../../../app/cliente/cliente-ui.module.css";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = useClienteStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`${ui.header} ${scrolled ? ui.headerScrolled : ""}`}
      role="banner"
    >
      <div className={ui.headerInner}>
        {/* Logo */}
        <Link href="/cliente" className={ui.headerLogo} aria-label="Nebula - Inicio">
          <div className={ui.headerLogoIcon}>
            <GlassWater className={ui.headerLogoIconSvg} />
          </div>
          <div className={ui.headerLogoText}>
            <span className={ui.headerLogoTitle}>Nebula</span>
            <span className={ui.headerLogoSubtitle}>Food & Beverage</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className={ui.headerNav} role="navigation" aria-label="Navegación principal">
          <Link
            href="/cliente"
            className={ui.headerNavLink}
            aria-current="page"
          >
            Inicio
          </Link>
          <Link href="/cliente/carta" className={ui.headerNavLink}>
            Carta
          </Link>
          <Link href="/cliente/ruleta" className={ui.headerNavLink}>
            Ruleta
          </Link>
          <Link href="/cliente/reservas" className={ui.headerNavLink}>
            Reservas
          </Link>
          <Link href="/cliente/cuenta" className={ui.headerNavLink}>
            Cuenta
          </Link>
        </nav>

        {/* Actions */}
        <div className={ui.headerActions}>
          {/* Cart Drawer */}
          <CartDrawer />

          {/* Mobile Menu Toggle */}
          <button
            className={ui.headerMenuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            <Menu className={ui.headerMenuIcon} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={ui.headerMobileMenu}>
          <nav className={ui.headerMobileNav} role="navigation">
            <Link
              href="/cliente"
              className={ui.headerMobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/cliente/carta"
              className={ui.headerMobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Carta
            </Link>
            <Link
              href="/cliente/ruleta"
              className={ui.headerMobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Ruleta
            </Link>
            <Link
              href="/cliente/reservas"
              className={ui.headerMobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Reservas
            </Link>
            <Link
              href="/cliente/cuenta"
              className={ui.headerMobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Cuenta
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default memo(Header);
