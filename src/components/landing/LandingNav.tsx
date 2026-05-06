"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChefHat,
  GlassWater,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
  UserPlus,
} from "lucide-react";
import clsx from "clsx";
import { destinationAfterLogin } from "@/lib/auth/roles";
import { useClienteStore } from "@/stores/useClienteStore";
import { AuthDialog } from "./AuthDialog";

const navLinks = [
  { href: "/cliente/carta", label: "Carta", icon: ChefHat },
  { href: "/cliente/ruleta", label: "Experiencia", icon: Sparkles },
];

export function LandingNav() {
  const router = useRouter();
  const token = useClienteStore((s) => s.token);
  const user = useClienteStore((s) => s.user);
  const logout = useClienteStore((s) => s.logout);

  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openLogin() {
    setAuthOpen(true);
  }

  function goToDashboard() {
    if (!user) return;
    router.push(destinationAfterLogin(user.role));
  }

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">

          {/* 🌌 LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 backdrop-blur">
              <GlassWater className="h-5 w-5 text-yellow-400" />
            </div>

            <div>
              <p className="font-display text-lg font-semibold text-white tracking-tight">
                Nebula
              </p>
              <p className="text-[10px] text-white/40">
                Food & Beverage
              </p>
            </div>
          </Link>

          {/* 🧭 NAV */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* 🎯 ACTIONS */}
          <div className="flex items-center gap-2">

            {/* CTA principal */}
            <Link
              href="/cliente/reservas"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300 transition"
            >
              <CalendarDays className="h-4 w-4" />
              Reservar
            </Link>

            {/* Usuario */}
            {token && user ? (
              <>
                <button
                  onClick={goToDashboard}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 text-white text-sm hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Panel
                </button>

                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 text-white text-sm hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>

                <button
                  onClick={openLogin}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200"
                >
                  <UserPlus className="h-4 w-4" />
                  Registro
                </button>
              </>
            )}

            {/* 📱 MOBILE */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* 📱 MOBILE MENU */}
        <div
          className={clsx(
            "lg:hidden transition-all",
            mobileOpen ? "block" : "hidden",
          )}
        >
          <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/5"
              >
                <Icon className="h-4 w-4 text-yellow-400" />
                {label}
              </Link>
            ))}

            <Link
              href="/cliente/reservas"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold"
            >
              <CalendarDays className="h-4 w-4" />
              Reservar
            </Link>
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}