"use client";

import type { ReactNode } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header  from "../components/ui/Header";
import { useUIStore } from "../store/uiStore";

interface Props { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#06060A] text-white">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`
          ${collapsed ? "w-[64px]" : "w-[230px]"}
          transition-all duration-300 ease-in-out
          flex-shrink-0 relative z-20
          bg-[#09090E]/90
          border-r border-white/[0.05]
          shadow-[1px_0_0_rgba(255,255,255,0.03)]
        `}
      >
        <Sidebar />
      </aside>

      {/* ── Main column ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative overflow-hidden">

        {/* Ambient glow — muy sutil, no distrae */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 35% at 65% 15%, rgba(212,163,64,0.04) 0%, transparent 70%)," +
              "radial-gradient(ellipse 40% 30% at 10% 80%, rgba(139,92,246,0.03) 0%, transparent 70%)",
          }}
        />

        {/* ── Header ────────────────────────────────────────── */}
        <header className="flex-shrink-0 relative z-10 bg-[#09090E]/80 border-b border-white/[0.05] backdrop-blur-xl">
          <Header />
        </header>

        {/* ── Scrollable content ────────────────────────────── */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden relative z-10">
          {/* Inner wrapper con padding y max-width contenido */}
          <div className="w-full h-full p-4 md:p-5 lg:p-6 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
