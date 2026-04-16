"use client";

import { useCartStore } from "@/store/useCartStore";
import { useRouter, usePathname } from "next/navigation";

export default function ClientNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const cart = useCartStore((s) => s.cart);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const linkClass = (path: string) =>
    `cursor-pointer transition ${
      pathname === path
        ? "neon-cyan"
        : "text-zinc-400 hover:text-[var(--neon-cyan)]"
    }`;

  return (
    <header className="
      sticky top-0 z-50
      flex items-center justify-between
      px-6 h-16
      bg-[var(--bg-panel)]
      border-b border-[var(--border-color)]
      backdrop-blur-md
    ">

      {/* LOGO */}
      <div
        onClick={() => router.push("/menu")}
        className="cursor-pointer neon-text text-lg font-bold"
      >
        🍸 BARTENDER
      </div>

      {/* NAV */}
      <nav className="flex items-center gap-6 text-sm">

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
          🎡 Ruleta
        </span>

        <div
  onClick={() => router.push("/ordersClient")}
  className="nav-link"
>
  🧾 Pedidos
</div>

      <div
  onClick={() => router.push("/reservationsClient")}
  className="nav-link"
>
  🧾reserva
</div>

        {/* CART */}
        <div
          onClick={() => router.push("/cart")}
          className="relative cursor-pointer"
        >
          <span className="text-zinc-400 hover:text-white">
            🛒
          </span>

          {totalItems > 0 && (
            <span
              className="
                absolute -top-2 -right-3
                text-xs px-1.5 py-0.5
                rounded-full
                bg-[var(--neon-pink)]
                text-black
                font-bold
              "
            >
              {totalItems}
            </span>
          )}
        </div>

      </nav>
    </header>
  );
}