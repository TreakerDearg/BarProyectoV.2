"use client";

import { ModernNavbar } from "@/components/cliente/ModernNavbar/ModernNavbar";
import { ModernHero } from "@/components/cliente/ModernHero/ModernHero";
import { QuickActions } from "@/components/cliente/QuickActions/QuickActions";
import { PromotionCard } from "@/components/cliente/PromotionCard/PromotionCard";
import { CategoryCards } from "@/components/cliente/CategoryCards/CategoryCards";
import { ModernProductCard } from "@/components/cliente/ModernProductCard/ModernProductCard";
import { ExperienceSection } from "@/components/cliente/ExperienceSection/ExperienceSection";
import { CTAFinal } from "@/components/cliente/CTAFinal/CTAFinal";

export default function ClienteHomePage() {
  return (
    <>
      {/* Modern Navbar */}
      <ModernNavbar />

      {/* Hero Section */}
      <ModernHero />

      {/* Quick Actions */}
      <QuickActions />

      {/* Promotion Card */}
      <PromotionCard />

      {/* Category Cards */}
      <CategoryCards />

      {/* Featured Products */}
      <ModernProductCard />

      {/* Experience Section */}
      <ExperienceSection />

      {/* Final CTA */}
      <CTAFinal />
    </>
  );
}