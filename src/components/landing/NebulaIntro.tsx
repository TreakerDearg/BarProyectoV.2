"use client";

import { Sparkles, Wine, Music, Moon } from "lucide-react";

export function NebulaIntro() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:px-6">

      <div className="grid gap-12 md:grid-cols-2 md:items-center">

        {/* 🧠 Texto */}
        <div>
          <p className="text-xs uppercase tracking-wider text-yellow-400">
            Sobre Nebula
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            Una experiencia fuera de este mundo
          </h2>

          <p className="mt-4 text-white/70 leading-relaxed">
            Nebula no es solo un lugar para comer o beber. Es un espacio donde la
            gastronomía, la coctelería y el ambiente se combinan para crear una
            experiencia única, inspirada en lo cósmico y lo sensorial.
          </p>

          <p className="mt-4 text-white/60">
            Cada detalle está pensado para que vivas una noche distinta.
          </p>
        </div>

        {/* ✨ Features */}
        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <Wine className="h-5 w-5 text-yellow-400" />
            <p className="mt-3 text-sm text-white">
              Coctelería de autor
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <p className="mt-3 text-sm text-white">
              Ambiente inmersivo
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <Music className="h-5 w-5 text-red-400" />
            <p className="mt-3 text-sm text-white">
              Música y experiencia
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <Moon className="h-5 w-5 text-blue-400" />
            <p className="mt-3 text-sm text-white">
              Noches únicas
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}