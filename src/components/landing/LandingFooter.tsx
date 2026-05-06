"use client";

import Link from "next/link";
import { GlassWater, MapPin, Clock, Phone } from "lucide-react";

const footerLinks = [
  { href: "/cliente/carta", label: "Carta" },
  { href: "/cliente/reservas", label: "Reservas" },
  { href: "/cliente/pedido", label: "Pedidos" },
  { href: "/cliente/ruleta", label: "Experiencia" },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">

        {/* 🔝 Top */}
        <div className="grid gap-12 md:grid-cols-3">

          {/* 🌌 Marca */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <GlassWater className="h-7 w-7 text-yellow-400" />
              <span className="font-display text-xl font-semibold text-white">
                Nebula Food & Beverage
              </span>
            </Link>

            <p className="text-sm text-white/60 leading-relaxed">
              Una experiencia gastronómica donde los sabores y la coctelería
              se encuentran en una atmósfera única inspirada en lo cósmico.
            </p>
          </div>

          {/* 🧭 Navegación */}
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              Navegación
            </p>

            <ul className="mt-4 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-yellow-400 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 📍 Info */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Información
            </p>

            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span>Villa Dolores, Misiones</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span>18:00 - 03:00</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span>+54 9 3755 00-0000</span>
              </div>
            </div>
          </div>

        </div>

        {/* 🔻 Bottom */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-3 sm:flex-row sm:justify-between text-xs text-white/50">
          <p>© {year} Nebula Food & Beverage. Todos los derechos reservados.</p>

          <p className="text-center sm:text-right">
            Diseño & experiencia Nebula · Obsidian Theme
          </p>
        </div>
      </div>
    </footer>
  );
}