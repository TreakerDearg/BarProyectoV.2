"use client";

import Link from "next/link";
import { CalendarDays, GlassWater } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:px-6">

      <div className="relative overflow-hidden rounded-3xl bg-white/5 p-10 ring-1 ring-white/10 backdrop-blur">

        {/* 🌌 Glow fondo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-purple-500/20 to-red-500/20 blur-2xl opacity-40" />
        </div>

        <div className="relative z-10 text-center">

          <p className="text-xs uppercase tracking-wider text-yellow-400">
            Reservas
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Viví la experiencia Nebula
          </h2>

          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Asegurá tu lugar y descubrí una noche donde cada detalle está
            pensado para sorprender.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              href="/cliente/reservas"
              className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              <CalendarDays className="h-4 w-4" />
              Reservar ahora
            </Link>

            <Link
              href="/cliente/carta"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white backdrop-blur hover:bg-white/10 transition"
            >
              <GlassWater className="h-4 w-4" />
              Ver carta
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}