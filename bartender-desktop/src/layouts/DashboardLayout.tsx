import type { ReactNode } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F14] text-white">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 flex-shrink-0 bg-[#0E131B] border-r border-[rgba(255,255,255,0.06)] shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <Sidebar />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ================= HEADER ================= */}
        <header className="h-16 flex-shrink-0 bg-[#0E131B]/70 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] shadow-sm z-10">
          <Header />
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0B0F14] via-[#0B0F14] to-[#0A0D12] p-6">

          {/* ================= CENTRAL CONTROL PANEL ================= */}
          <div className="min-h-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827]/40 backdrop-blur-xl shadow-[0_0_50px_rgba(167,139,250,0.06)] p-6">

            {/* subtle top glow line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/30 to-transparent mb-4" />

            {children}

          </div>

        </main>
      </div>
    </div>
  );
}