"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "@/styles/AdminSidebar.module.css";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wine,
  BookOpen,
  Dice5,
  Armchair,
  CalendarDays,
  MenuSquare,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "CORE",
      items: [
        {
          path: "/dashboard",
          label: "Dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        {
          path: "/orders",
          label: "Orders",
          icon: <ShoppingCart size={18} />,
        },
      ],
    },
    {
      title: "INVENTORY",
      items: [
        {
          path: "/inventory",
          label: "Ingredientes",
          icon: <Package size={18} />,
        },
      ],
    },
    {
      title: "PRODUCTS",
      items: [
        {
          path: "/products",
          label: "Bebidas",
          icon: <Wine size={18} />,
        },
        {
          path: "/recipes",
          label: "Recetas",
          icon: <BookOpen size={18} />,
        },
      ],
    },
    {
      title: "SYSTEMS",
      items: [
        {
          path: "/rouletteAdmin",
          label: "Ruleta",
          icon: <Dice5 size={18} />,
        },
        {
          path: "/tables",
          label: "Mesas",
          icon: <Armchair size={18} />,
        },
        {
          path: "/reservations",
          label: "Reservas",
          icon: <CalendarDays size={18} />,
        },
        {
          path: "/menus",
          label: "Menús",
          icon: <MenuSquare size={18} />,
        },
      ],
    },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* HEADER */}
      <div>
        <h1 className={styles.logo}>ADMIN SYSTEM</h1>

        {sections.map((section) => (
          <div key={section.title} className={styles.section}>
            <p className={styles.sectionTitle}>{section.title}</p>

            <div className={styles.links}>
              {section.items.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <div
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    className={`${styles.link} ${
                      isActive ? styles.active : ""
                    }`}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        v1.0 • bartender
      </div>
    </aside>
  );
}