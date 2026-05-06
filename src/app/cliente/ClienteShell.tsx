"use client";

import { ClienteNav } from "@/components/cliente/ClienteNav";
import { Providers } from "@/context/Providers";
import "@/styles/cliente-tokens.css";

export function ClienteShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <ClienteNav />
        <main className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-28">
          {children}
        </main>
      </div>
    </Providers>
  );
}