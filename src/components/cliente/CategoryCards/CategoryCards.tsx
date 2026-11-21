"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassWater, ChefHat, Wine, Sparkles, ArrowRight, Layers } from "lucide-react";
import { getProductCategories, type ProductCategoryPublic } from "@/lib/api/bartender";
import styles from "./CategoryCards.module.css";

interface PillarItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  href: string;
  icon: typeof GlassWater;
}

const RESTOBAR_PILLARS: PillarItem[] = [
  {
    id: "bar",
    title: "Cócteles de Autor",
    subtitle: "Clarificados botánicos, ahumados y hielo tallado a mano",
    tag: "Barra & Spirits",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
    href: "/cliente/carta?type=drink",
    icon: GlassWater,
  },
  {
    id: "kitchen",
    title: "Cocina de Fuegos & Tapas",
    subtitle: "Cortes madurados, tapas ahumadas y bocados para compartir",
    tag: "Cocina Viva",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    href: "/cliente/carta?type=food",
    icon: ChefHat,
  },
  {
    id: "cava",
    title: "Cava & Destilados Puros",
    subtitle: "Etiquetas seleccionadas, whiskies de autor y aperitivos",
    tag: "Cava Nebula",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    href: "/cliente/carta?category=Vinos",
    icon: Wine,
  },
  {
    id: "sweets",
    title: "Postres & Sobremesa",
    subtitle: "Chocolates amargos, pastelería fina y digestivos nocturnos",
    tag: "Cierre Dulce",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    href: "/cliente/carta?category=Postres",
    icon: Sparkles,
  },
];

export function CategoryCards() {
  const [categories, setCategories] = useState<ProductCategoryPublic[]>([]);

  useEffect(() => {
    getProductCategories()
      .then((data) => {
        if (data.length > 0) {
          setCategories(data.slice(0, 8));
        }
      })
      .catch(() => { /* silencioso */ });
  }, []);

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        {/* Encabezado editorial */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <Layers size={13} className="text-[#F0B429]" />
            <span>Nuestros Cuatro Mundos</span>
          </div>
          <div className={styles.titleRow}>
            <h2 className={styles.sectionTitle}>
              Experiencias de Barra & Cocina
            </h2>
            <Link href="/cliente/carta" className={styles.exploreAllLink}>
              <span>Ver carta completa</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className={styles.sectionSubtitle}>
            Diseñamos cada sector con identidad propia para que cada visita tenga su propio ritmo.
          </p>
        </div>

        {/* Grilla 4 Pilares Resto-Bar */}
        <div className={styles.pillarsGrid}>
          {RESTOBAR_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className={styles.pillarCard}
              >
                <div className={styles.pillarImageWrap}>
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    loading="lazy"
                    className={styles.pillarImage}
                  />
                  <div className={styles.pillarOverlay} />
                  <span className={styles.pillarBadge}>
                    <Icon size={12} />
                    {pillar.tag}
                  </span>
                </div>

                <div className={styles.pillarContent}>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  <p className={styles.pillarSubtitle}>{pillar.subtitle}</p>
                  <span className={styles.pillarAction}>
                    Explorar sector <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Píldoras de Categorías Específicas Dinámicas */}
        {categories.length > 0 && (
          <div className={styles.quickTagsContainer}>
            <span className={styles.quickTagsLabel}>Categorías activas hoy:</span>
            <div className={styles.quickTagsList}>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/cliente/carta?category=${encodeURIComponent(c.name)}`}
                  className={styles.quickTag}
                >
                  <span>{c.name}</span>
                  {c.count > 0 && <span className={styles.tagCount}>{c.count}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
