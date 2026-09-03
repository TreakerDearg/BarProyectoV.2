"use client";

import { useEffect } from "react";
import { Providers } from "@/context/Providers";
import BackgroundLayer from "@/components/cliente/layout/BackgroundLayer";
import Header from "@/components/cliente/layout/Header";
import MobileNavigation from "@/components/cliente/layout/MobileNavigation";
import Footer from "@/components/cliente/layout/Footer";
import PageTransition from "@/components/cliente/layout/PageTransition";
import { useClienteStore } from "@/stores/useClienteStore";
import "@/styles/cliente-tokens.css";
import styles from "./cliente-shell.module.css";

function RehydrateStore() {
  useEffect(() => {
    void useClienteStore.persist.rehydrate();
  }, []);
  return null;
}

export function ClienteShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <RehydrateStore />
      <div className={styles.shell}>
        <BackgroundLayer />
        <Header />
        <main className={styles.main}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <MobileNavigation />
        <Footer />
      </div>
    </Providers>
  );
}