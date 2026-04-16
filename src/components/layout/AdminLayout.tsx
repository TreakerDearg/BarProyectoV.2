"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import styles from "@/styles/AdminLayout.module.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.container}>
      {/* OVERLAY PARA MÓVILES */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`${styles.sidebarWrapper} ${
          isSidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <AdminSidebar />
      </div>

      {/* CONTENIDO */}
      <div className={styles.content}>
        {/* HEADER MÓVIL */}
        <header className={styles.header}>
          <button onClick={toggleSidebar} className={styles.menuButton}>
            <Menu size={24} />
          </button>
          <h1 className={styles.title}>Bartender Admin</h1>
        </header>

        {/* MAIN */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}