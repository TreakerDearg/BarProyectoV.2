"use client";

import { ModernHero } from "@/components/cliente/ModernHero/ModernHero";
import { QuickActions } from "@/components/cliente/QuickActions/QuickActions";
import { PromotionCard } from "@/components/cliente/PromotionCard/PromotionCard";
import { CategoryCards } from "@/components/cliente/CategoryCards/CategoryCards";
import { ModernProductCard } from "@/components/cliente/ModernProductCard/ModernProductCard";
import { ExperienceSection } from "@/components/cliente/ExperienceSection/ExperienceSection";
import { CTAFinal } from "@/components/cliente/CTAFinal/CTAFinal";
import { AppDownloadCard } from "./AppDownloadCard";

export default function ClienteHomePage() {
  return (
    <div className="flex flex-col gap-0 min-h-screen bg-[#090C10]">
      {/* 1. Hero Resto-Bar con Live Status Beacon */}
      <ModernHero />

      {/* 2. Barra de Acciones Rápidas */}
      <QuickActions />

      {/* 3. Cuatro Pilares de Experiencia (Cócteles, Cocina, Cava, Postres) */}
      <CategoryCards />

      {/* 4. Selección de Autor / Destacados Web (Configurable 100% desde Desktop) */}
      <ModernProductCard />

      {/* 5. Promociones Especiales y Ofertas en Vivo */}
      <PromotionCard />

      {/* 6. Experiencia & Filosofía de Barra y Fuegos */}
      <ExperienceSection />

      {/* 7. Club Nebula & App Móvil */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 my-4">
        <AppDownloadCard />
      </div>

      {/* 8. Cierre Editorial: Horarios, Ubicación & Reservas */}
      <CTAFinal />
    </div>
  );
}
