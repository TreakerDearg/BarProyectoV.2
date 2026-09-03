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
    <div className="flex h-screen w-screen overflow-hidden bg-[#030209] text-white">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          ${collapsed ? "w-20" : "w-64"}
          transition-all duration-300 ease-in-out
          flex-shrink-0 
          bg-slate-950/80 border-r border-violet-500/10
          shadow-[4px_0_24px_rgba(139,92,246,0.05)]
          relative z-20
        `}
      >
        <Sidebar />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative">

        {/* NEBULA ATMOSPHERE GLOW */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="nebula-aurora opacity-60" />
        </div>

        {/* HEADER */}
        <header className="flex-shrink-0 bg-slate-950/50 backdrop-blur-xl border-b border-violet-500/10 relative z-10">
          <Header />
        </header>

        {/* CONTENT */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden p-3 md:p-4 lg:p-6 relative z-10 flex flex-col">
          <div className="relative z-10 w-full flex-1 flex flex-col min-h-0 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
