"use client";

import { Providers } from "@/context/Providers";
import BackgroundLayer from "@/components/cliente/layout/BackgroundLayer";
import Header from "@/components/cliente/layout/Header";
import MobileNavigation from "@/components/cliente/layout/MobileNavigation";
import Footer from "@/components/cliente/layout/Footer";
import PageTransition from "@/components/cliente/layout/PageTransition";
import "@/styles/cliente-tokens.css";

export function ClienteShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative min-h-screen text-[var(--text)]">
        {/* Background Layer */}
        <BackgroundLayer />

        {/* Header */}
        <Header />

        {/* Main Content with Page Transition */}
        <PageTransition>
          {children}
        </PageTransition>

        {/* Mobile Navigation */}
        <MobileNavigation />

        {/* Footer */}
        <Footer />
      </div>
    </Providers>
  );
}