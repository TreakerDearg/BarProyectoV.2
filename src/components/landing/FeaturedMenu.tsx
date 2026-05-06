"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const featured = [
  {
    name: "Nebula Signature",
    description: "Gin, frutos rojos y notas cítricas.",
    price: "$4.500",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800",
  },
  {
    name: "Cosmic Burger",
    description: "Doble carne, cheddar y salsa especial.",
    price: "$6.200",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
  },
  {
    name: "Dark Matter",
    description: "Ron, café y chocolate.",
    price: "$4.800",
    image:
      "https://images.unsplash.com/photo-1575023782549-62ca0d244b39?q=80&w=800",
  },
];

export function FeaturedMenu() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:px-6">

      {/* 🧠 Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-yellow-400">
            Destacados
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Sabores que definen Nebula
          </h2>
          <p className="mt-3 max-w-xl text-white/60">
            Una selección de nuestros platos y tragos más elegidos.
          </p>
        </div>

        <Link
          href="/cliente/carta"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          Ver carta completa
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 🍽 GRID */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {featured.map((item, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            {/* 🖼 Imagen */}
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
              />

              {/* 🌑 overlay oscuro */}
              <div className="absolute inset-0 bg-black/50" />

              {/* 🌌 glow */}
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 via-purple-500/20 to-red-500/20 blur-2xl" />
              </div>
            </div>

            {/* 📄 Contenido */}
            <div className="absolute bottom-0 w-full p-5">
              <h3 className="text-lg font-semibold text-white">
                {item.name}
              </h3>

              <p className="text-sm text-white/70 mt-1">
                {item.description}
              </p>

              <p className="mt-3 text-sm font-semibold text-yellow-300">
                {item.price}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}