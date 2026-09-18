"use client";

import { useEffect } from "react";
import { Providers } from "@/context/Providers";
import { useClienteStore } from "@/stores/useClienteStore";
import { AppBottomNav } from "@/components/cliente-app/AppBottomNav";
import { AppHeader } from "@/components/cliente-app/AppHeader";
import "@/styles/cliente-tokens.css";
import styles from "./AppShell.module.css";

function RehydrateStore() {
  useEffect(() => {
    void useClienteStore.persist.rehydrate();
  }, []);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <RehydrateStore />
      <div className={styles.shell}>
        <main className={styles.main}>
          <AppHeader />
          {children}
        </main>
        <AppBottomNav />
      </div>
    </Providers>
  );
}
