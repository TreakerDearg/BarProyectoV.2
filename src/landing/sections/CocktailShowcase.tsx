"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const cocktails = [
  {
    name: "Nebula Signature",
    description: "Gin premium, frutos rojos y notas cítricas.",
    price: "$4.500",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800",
    size: "large",
  },
  {
    name: "Cosmic Martini",
    description: "Vodka premium, vermouth y aceitunas.",
    price: "$5.200",
    image: "https://images.unsplash.com/photo-1575023782549-62ca0d244b39?q=80&w=800",
    size: "medium",
  },
  {
    name: "Dark Matter",
    description: "Ron añejo, café y chocolate belga.",
    price: "$4.800",
    image: "https://images.unsplash.com/photo-1575023782549-62ca0d244b39?q=80&w=800",
    size: "small",
  },
  {
    name: "Stellar Sour",
    description: "Whisky, limón y clara de huevo.",
    price: "$4.300",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=800",
    size: "wide",
  },
  {
    name: "Galaxy Fizz",
    description: "Gin, prosecco y frutas tropicales.",
    price: "$4.600",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800",
    size: "small",
  },
];

function CocktailShowcase() {
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
    <section id="cocktails" ref={ref} className="landing-section relative">
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
                ✨ Cócteles
              </span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-8">
            Sabores que definen Nebula
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl">
              Una selección de nuestros tragos más exclusivos.
            </p>
          </div>

          <Link
            href="/cliente/carta"
            className="group inline-flex items-center gap-2 text-sm text-[var(--landing-text-secondary)] hover:text-white transition-colors"
            aria-label="Ver carta completa de cócteles"
          >
            Ver carta completa
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 md:grid-rows-2">
          {cocktails.map((cocktail, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.025 }}
              className={`group relative overflow-hidden landing-glass rounded-3xl ${getSizeClass(cocktail.size)} transition-all duration-500`}
            >
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={cocktail.image}
                  alt={cocktail.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--landing-accent-gold)]/30 via-[var(--landing-accent-purple)]/20 to-[var(--landing-accent-red)]/20 blur-2xl" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold">{cocktail.name}</h3>
                  <p className="mt-1.5 sm:mt-2 text-sm text-[var(--landing-text-secondary)]">{cocktail.description}</p>
                  <p className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold text-[var(--landing-accent-gold)]">{cocktail.price}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(CocktailShowcase);
