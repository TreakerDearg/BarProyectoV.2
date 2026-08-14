"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import styles from "./PromotionCard.module.css";

export function PromotionCard() {
  return (
    <section className={styles.promotionSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <Sparkles className="h-4 w-4" />
            Promo de la semana
          </div>
          <h2 className={styles.title}>Oferta especial</h2>
          <p className={styles.subtitle}>Disfruta de nuestras promociones exclusivas</p>
        </div>
        
        <div className={styles.promotionCard}>
          <div className={styles.promotionImage}>
            <div className={styles.promotionBadge}>-30%</div>
          </div>
          
          <div className={styles.promotionContent}>
            <h3 className={styles.promotionTitle}>
              Combo Burger & Papas
            </h3>
            <p className={styles.promotionDescription}>
              Nuestra hamburguesa signature con papas fritas artesanales y bebida incluida. 
              La combinación perfecta para compartir.
            </p>
            
            <div className={styles.promotionPrice}>
              <span className={styles.currentPrice}>$12.99</span>
              <span className={styles.originalPrice}>$18.99</span>
            </div>
            
            <Link href="/cliente/carta" className={styles.promotionButton}>
              Pedir ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}