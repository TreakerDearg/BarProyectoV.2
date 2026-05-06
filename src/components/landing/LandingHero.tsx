"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, GlassWater, Sparkles } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-20 md:px-6 md:pt-32 md:pb-28">

      {/* ✨ Tagline */}
      <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-yellow-400 ring-1 ring-white/10 backdrop-blur">
        <Sparkles className="h-3.5 w-3.5" />
        Experiencia gastronómica premium
      </p>

      {/* 🌌 Headline */}
      <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
        Donde los sabores
        <span className="block bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
          cruzan la galaxia
        </span>
      </h1>

      {/* 🧠 Subtexto */}
      <p className="mt-6 max-w-2xl text-lg text-white/70 md:text-xl">
        En <span className="text-white font-medium">Nebula</span>, combinamos
        cocina, coctelería y ambiente en una experiencia única. Reservá tu mesa
        o explorá nuestra carta.
      </p>

      {/* 🎯 CTA */}
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/cliente/carta"
          className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300"
        >
          <GlassWater className="h-4 w-4" />
          Ver carta
          <ArrowRight className="h-4 w-4 opacity-80" />
        </Link>

        <Link
          href="/cliente/reservas"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
        >
          <CalendarDays className="h-4 w-4" />
          Reservar mesa
        </Link>
      </div>

      {/* 🧩 Features / experiencia */}
      <div className="mt-16 grid gap-4 border-t border-white/10 pt-12 sm:grid-cols-3">

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-yellow-400">
            Gastronomía
          </p>
          <p className="mt-2 text-sm text-white/70">
            Platos diseñados para acompañar cada momento.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-purple-400">
            Coctelería
          </p>
          <p className="mt-2 text-sm text-white/70">
            Tragos de autor inspirados en lo cósmico.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-red-400">
            Experiencia
          </p>
          <p className="mt-2 text-sm text-white/70">
            Música, ambiente y diseño para una noche distinta.
          </p>
        </div>

      </div>
    </section>
  );
}