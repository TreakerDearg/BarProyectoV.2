"use client";

import type { ReactNode } from "react";
import Sidebar   from "../components/ui/Sidebar";
import Header    from "../components/ui/Header";
import { useUIStore } from "../store/uiStore";

interface Props { children: ReactNode }

export default function DashboardLayout({ children }: Props) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    /*
      Layout raíz — pantalla completa, sin overflow horizontal.
      Fondo: #0D1117 (Slate pizarra — Slate Elegante palette).
    */
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: "#0D1117", color: "#E6EDF3" }}
    >

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`
          ${collapsed ? "w-[68px]" : "w-[240px]"}
          transition-all duration-300 ease-in-out
          flex-shrink-0 relative z-20
        `}
      >
        <Sidebar />
      </aside>

      {/* ── Columna principal ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative overflow-hidden">

        {/*
          Ambient glow — muy sutil, frío (azul slate + verde)
          No distrae, añade profundidad.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 35% at 65% 15%, rgba(56,139,253,0.05) 0%, transparent 70%)," +
              "radial-gradient(ellipse 40% 30% at 10% 80%, rgba(63,185,80,0.03) 0%, transparent 70%)",
          }}
        />

        {/* ── Header ──────────────────────────────────────────── */}
        <header className="flex-shrink-0 relative z-10">
          <Header />
        </header>

        {/* ── Contenido principal — scrollable ────────────────── */}
        <main
          className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden relative z-10"
          style={{ background: "transparent" }}
        >
          {/* Padding interno cómodo para 1920×1080 */}
          <div className="w-full h-full p-5 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
