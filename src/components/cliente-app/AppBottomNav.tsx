"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Dices, Home, ShoppingBag, UserCircle } from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./AppBottomNav.module.css";

const items = [
  { href: "/cliente/app", label: "Inicio", icon: Home, exact: true },
  { href: "/cliente/app/carta", label: "Pedir", icon: ChefHat },
  { href: "/cliente/app/pedido", label: "Pedido", icon: ShoppingBag },
  { href: "/cliente/app/ruleta", label: "Ruleta", icon: Dices },
  { href: "/cliente/app/cuenta", label: "Cuenta", icon: UserCircle },
];

export function AppBottomNav() {
  const pathname = usePathname();
  const cartCount = useClienteStore((state) => state.cart.reduce((total, line) => total + line.quantity, 0));

  return (
    <nav className={styles.nav} aria-label="Navegación de la aplicación">
      <div className={styles.inner}>
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${active ? styles.linkActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.iconWrap}>
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
                {label === "Pedido" && cartCount > 0 && <span className={styles.badge}>{cartCount > 9 ? "9+" : cartCount}</span>}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
