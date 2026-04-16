"use client";

import { usePathname, useRouter } from "next/navigation";

export default function ClientFooter() {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (path: string) =>
    `cursor-pointer transition text-xs ${
      pathname === path
        ? "neon-cyan"
        : "text-zinc-500 hover:text-[var(--neon-cyan)]"
    }`;

  return (
    <footer
      className="
        border-t border-[var(--border-color)]
        bg-[var(--bg-panel)]
        px-6 py-3
        flex items-center justify-between
        text-xs
      "
    >
      {/* LEFT - STATUS */}
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
        <span>system online</span>
      </div>

      {/* CENTER - BRAND */}
      <div className="neon-text text-[11px] tracking-widest">
        BARTENDER SYSTEM
      </div>

      {/* RIGHT - NAV MINI */}
      <div className="flex items-center gap-4">
        <span
          onClick={() => router.push("/menu")}
          className={linkClass("/menu")}
        >
          Menu
        </span>

        <span
          onClick={() => router.push("/roulette")}
          className={linkClass("/roulette")}
        >
          Ruleta
        </span>

        <span
          onClick={() => router.push("/cart")}
          className={linkClass("/cart")}
        >
          Carrito
        </span>
      </div>
    </footer>
  );
}