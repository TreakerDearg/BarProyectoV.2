"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ChefHat, Sparkles, CalendarDays, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { memo } from "react";
import { useClienteStore } from "@/stores/useClienteStore";
import { CartDrawer } from "../CartDrawer";
import ui from "../../../app/cliente/cliente-ui.module.css";

const navItems = [
  { href: "/cliente", label: "Inicio", icon: Home, exact: true },
  { href: "/cliente/carta", label: "Carta", icon: ChefHat },
  { href: "/cliente/ruleta", label: "Ruleta", icon: Sparkles },
  { href: "/cliente/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/cliente/cuenta", label: "Cuenta", icon: UserCircle },
];

function MobileNavigation() {
  const pathname = usePathname();
  const cartItemCount = useClienteStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <nav className={ui.mobileNavigation} role="navigation" aria-label="Navegación móvil">
      <div className={ui.mobileNavigationInner}>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href + "/") || pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`${ui.mobileNavLink} ${isActive ? ui.mobileNavLinkActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <motion.div
                className={ui.mobileNavIcon}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <span className={ui.mobileNavLabel}>{label}</span>
              {isActive && (
                <motion.div
                  className={ui.mobileNavIndicator}
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* Cart */}
        <div className={`${ui.mobileNavLink} ${pathname === "/cliente/pedido" ? ui.mobileNavLinkActive : ""}`}>
          <motion.div
            className={ui.mobileNavIcon}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <CartDrawer />
          </motion.div>
          <span className={ui.mobileNavLabel}>Carrito</span>
          {cartItemCount > 0 && (
            <motion.div
              className={ui.mobileNavBadge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            >
              {cartItemCount}
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(MobileNavigation);
