"use client";

import { memo, lazy, Suspense } from "react";
import AdvancedBackground from "./backgrounds/AdvancedBackground";
import Navigation from "./components/Navigation";
import HeroV2 from "./sections/HeroV2";
import "@/landing/styles/globals.css";

// Lazy load sections below the fold
const Experience = lazy(() => import("./sections/Experience").then(m => ({ default: m.default })));
const CocktailShowcase = lazy(() => import("./sections/CocktailShowcase").then(m => ({ default: m.default })));
const Atmosphere = lazy(() => import("./sections/Atmosphere").then(m => ({ default: m.default })));
const FeaturedMenu = lazy(() => import("./sections/FeaturedMenu").then(m => ({ default: m.default })));
const SpecialEvents = lazy(() => import("./sections/SpecialEvents").then(m => ({ default: m.default })));
const Reservations = lazy(() => import("./sections/Reservations").then(m => ({ default: m.default })));
const CTAFinal = lazy(() => import("./sections/CTAFinal").then(m => ({ default: m.default })));
const Footer = lazy(() => import("./sections/Footer").then(m => ({ default: m.default })));

function LandingPage() {
  return (
    <div className="relative min-h-screen text-white">
      <AdvancedBackground />
      <Navigation />
      <HeroV2 />
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
      <Suspense fallback={null}>
        <CocktailShowcase />
      </Suspense>
      <Suspense fallback={null}>
        <Atmosphere />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedMenu />
      </Suspense>
      <Suspense fallback={null}>
        <SpecialEvents />
      </Suspense>
      <Suspense fallback={null}>
        <Reservations />
      </Suspense>
      <Suspense fallback={null}>
        <CTAFinal />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}

export default memo(LandingPage);
