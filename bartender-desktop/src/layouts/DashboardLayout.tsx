import type { ReactNode } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-void text-white">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 flex-shrink-0 bg-void border-r border-obsidian/40 shadow-[4px_0_24px_rgba(0,0,0,0.8)] relative z-20">
        <Sidebar />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col flex-1 overflow-hidden relative">

        {/* GLOWS DE FONDO ATMOSFÉRICO */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-bar-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-bar-red/5 blur-[120px] rounded-full pointer-events-none" />

        {/* ================= HEADER ================= */}
        <header className="h-16 flex-shrink-0 bg-void/60 backdrop-blur-xl border-b border-obsidian/40 shadow-sm z-10 relative">
          <Header />
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 overflow-y-auto p-6 relative z-0">

          {/* ================= CENTRAL CONTROL PANEL ================= */}
          <div className="min-h-full rounded-2xl border border-obsidian/40 bg-gradient-to-b from-obsidian/60 to-void backdrop-blur-xl shadow-glass p-6 relative overflow-hidden group">

            {/* Subtle top glow line (Gold) */}
            <div className="absolute top-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-bar-gold/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10">
              {children}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}