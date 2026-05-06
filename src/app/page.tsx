"use client";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingNav } from "@/components/landing/LandingNav";

// nuevos (los vamos a crear después)
import { NebulaIntro } from "@/components/landing/NebulaIntro";
import { FeaturedMenu } from "@/components/landing/FeaturedMenu";
import { CTASection } from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      
      {/* 🌌 Fondo Nebula mejorado */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,163,64,0.18), transparent),
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(120, 50, 200, 0.12), transparent),
            radial-gradient(ellipse 40% 30% at 0% 20%, rgba(200,50,40,0.08), transparent)
          `,
        }}
      />

      {/* 🌑 overlay oscuro */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      <div className="relative z-10">
        <LandingNav />
        <LandingHero />

        {/* ✨ nuevas secciones */}
        <NebulaIntro />
        <FeaturedMenu />
        <CTASection />

        <LandingFooter />
      </div>
    </div>
  );
}