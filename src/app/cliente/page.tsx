"use client";

import HomeHero from "./home/components/HomeHero";
import FeaturedCategories from "./home/components/FeaturedCategories";
import FeaturedProducts from "./home/components/FeaturedProducts";
import PromotionSection from "./home/components/PromotionSection";
import ExperienceSection from "./home/components/ExperienceSection";
import CTASection from "./home/components/CTASection";
import MainContent from "@/components/cliente/layout/MainContent";
import Container from "@/components/cliente/layout/Container";

export default function ClienteHomePage() {
  return (
    <>
      {/* Hero Premium - Full width without container */}
      <HomeHero />

      {/* Main Content with Container */}
      <MainContent containerSize="large">
        <Container size="large">
          {/* Featured Categories */}
          <FeaturedCategories maxCategories={6} />

          {/* Featured Products (Bento Grid) */}
          <FeaturedProducts maxProducts={8} />

          {/* Promotions */}
          <PromotionSection maxPromotions={3} />

          {/* Experience */}
          <ExperienceSection />

          {/* CTA Final */}
          <CTASection />
        </Container>
      </MainContent>
    </>
  );
}