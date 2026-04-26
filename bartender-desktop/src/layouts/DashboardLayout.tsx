"use client";

import type { ReactNode } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { useUIStore } from "../store/uiStore";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-void text-white">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          ${collapsed ? "w-20" : "w-64"}
          transition-all duration-300 ease-in-out
          flex-shrink-0 
          bg-void border-r border-obsidian/40
          shadow-[4px_0_24px_rgba(0,0,0,0.8)]
          relative z-20
        `}
      >
        <Sidebar />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">

        {/* ATMOSPHERE */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-bar-gold/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-bar-red/5 blur-[120px] rounded-full" />
        </div>

        {/* HEADER */}
        <header className="flex-shrink-0 bg-void/70 backdrop-blur-xl border-b border-obsidian/40 relative z-10">
          <Header />
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10">

          <div
            className={`
              min-h-full 
              rounded-2xl 
              border border-obsidian/40 
              bg-gradient-to-b from-obsidian/60 to-void 
              backdrop-blur-xl 
              shadow-glass 
              p-6 
              relative 
              overflow-hidden 
              group
              transition-all duration-300
              ${collapsed ? "max-w-[1800px]" : "max-w-[1600px]"}
              mx-auto
            `}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bar-gold/30 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 w-full">
              {children}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}