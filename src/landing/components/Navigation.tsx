"use client";

import { memo, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassWater, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#experience", label: "Experiencia" },
  { href: "#cocktails", label: "Cócteles" },
  { href: "#menu", label: "Menú" },
  { href: "#events", label: "Eventos" },
  { href: "#reservations", label: "Reservas" },
];

// Future: Bartender Identity integration
// const authLinks = [
//   { href: "/cliente/cuenta", label: "Iniciar Sesión", type: "login" },
//   { href: "/cliente/cuenta", label: "Registrarse", type: "register" },
// ];

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/60 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="landing-container">
          <nav className="flex items-center justify-between py-4 sm:py-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/20 transition-all"
              >
                <GlassWater className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--landing-accent-gold)]" />
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-lg font-semibold">Nebula</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm text-[var(--landing-text-secondary)] hover:text-white transition-colors group"
                  aria-label={`Navegar a ${link.label}`}
                >
                  {link.label}
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--landing-accent-gold)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/cliente"
                className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--landing-accent-gold)] text-black text-sm font-semibold transition-all hover:bg-[var(--landing-accent-gold-light)] hover:scale-105 landing-focus-visible"
                aria-label="Entrar al sistema del cliente"
              >
                Entrar
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/20 transition-all landing-focus-visible"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="landing-container flex h-full flex-col justify-center">
              <nav className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-2xl font-semibold text-white hover:text-[var(--landing-accent-gold)] transition-colors"
                      aria-label={`Navegar a ${link.label}`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-12"
              >
                <Link
                  href="/cliente"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--landing-accent-gold)] text-black text-base font-semibold transition-all hover:bg-[var(--landing-accent-gold-light)] hover:scale-105 landing-focus-visible"
                  aria-label="Entrar al sistema del cliente"
                >
                  Entrar al Restaurante
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(Navigation);
