import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#0B0F14] text-white">

      {/* ================= BACKGROUND GLOW ================= */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 w-[600px] h-[600px] -translate-x-1/2 rounded-full bg-[#A78BFA]/10 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#34D399]/10 blur-[120px]" />
      </div>

      {/* ================= GRID NOISE LAYER ================= */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* ================= AUTH CARD ================= */}
      <div className="relative z-10 w-full max-w-md">

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0E131B]/70 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.6)] p-6">

          {/* TOP ACCENT LINE */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A78BFA]/40 to-transparent mb-6" />

          {children}

        </div>

        {/* FOOTER HINT */}
        <p className="text-center text-xs text-[#71717A] mt-4">
          Obsidian Access System • Secure Bar Control Panel
        </p>

      </div>
    </div>
  );
}