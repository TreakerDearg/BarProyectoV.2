"use client";

import { Providers } from "@/context/Providers";
import BackgroundLayer from "@/components/cliente/layout/BackgroundLayer";
import Header from "@/components/cliente/layout/Header";
import MobileNavigation from "@/components/cliente/layout/MobileNavigation";
import Footer from "@/components/cliente/layout/Footer";
import PageTransition from "@/components/cliente/layout/PageTransition";
import "@/styles/cliente-tokens.css";
import styles from "./cliente-shell.module.css";

export function ClienteShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className={styles.shell}>
        {/* Background Layer */}
        <BackgroundLayer />

        {/* Header — fixed top, z-1000, ~72px height */}
        <Header />

        {/* Main Content — padding-top compensa el navbar fijo */}
        <main className={styles.main}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>

        {/* Mobile Navigation dock — fixed bottom */}
        <MobileNavigation />

        {/* Footer */}
        <Footer />
      </div>
    </Providers>
  );
}