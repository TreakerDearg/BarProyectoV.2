"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const menuItems = [
  {
    name: "Cosmic Burger",
    description: "Doble carne, cheddar y salsa especial.",
    price: "$6.200",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
    size: "large",
  },
  {
    name: "Galaxy Wings",
    description: "Alitas glaseadas con especias cósmicas.",
    price: "$4.300",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800",
    size: "medium",
  },
  {
    name: "Nebula Tacos",
    description: "Tacos de carne con guacamole fresco.",
    price: "$3.800",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800",
    size: "small",
  },
  {
    name: "Stellar Nachos",
    description: "Nachos con queso fundido y guacamole.",
    price: "$3.500",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=800",
    size: "wide",
  },
  {
    name: "Space Fries",
    description: "Papas fritas con salsa especial.",
    price: "$2.800",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800",
    size: "small",
  },
];

function FeaturedMenu() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getSizeClass = (size: string) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2";
      case "medium":
        return "md:col-span-1 md:row-span-2";
      case "small":
        return "md:col-span-1 md:row-span-1";
      case "wide":
        return "md:col-span-2 md:row-span-1";
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <section id="menu" ref={ref} className="landing-section relative">
      <div className="landing-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4"
            >
              <span className="text-sm font-medium text-[var(--landing-accent-gold)] tracking-wider uppercase">
                🍽 Menú
              </span>
            </motion.div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8">
            Platos que enamoran
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl">
              Nuestra cocina fusiona tradición y creatividad.
            </p>
          </div>

          <Link
            href="/cliente/carta"
            className="group inline-flex items-center gap-2 text-sm text-[var(--landing-text-secondary)] hover:text-white transition-colors"
            aria-label="Ver menú completo de platos"
          >
            Ver menú completo
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 md:grid-rows-2">
          {menuItems.map((item, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.025 }}
              className={`group relative overflow-hidden landing-glass rounded-3xl ${getSizeClass(item.size)} transition-all duration-500`}
            >
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--landing-accent-gold)]/30 via-[var(--landing-accent-purple)]/20 to-[var(--landing-accent-red)]/20 blur-2xl" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold">{item.name}</h3>
                  <p className="mt-1.5 sm:mt-2 text-sm text-[var(--landing-text-secondary)]">{item.description}</p>
                  <p className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold text-[var(--landing-accent-gold)]">{item.price}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturedMenu);
