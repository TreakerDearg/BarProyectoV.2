"use client";

import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  const user = useClienteStore((state) => state.user);
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className={styles.header}>
      <Link href="/cliente/app" className={styles.brand} aria-label="Inicio de Nebula App">
        <span className={styles.mark}>
          <Image src="/brand/nebula-mark.png" alt="" width={32} height={32} priority />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>Nebula</span>
          <span className={styles.brandCaption}>Tu momento, servido</span>
        </span>
      </Link>
      <Link href="/cliente/app/cuenta" className={styles.account} aria-label={firstName ? `Cuenta de ${firstName}` : "Mi cuenta"}>
        <UserCircle size={21} aria-hidden="true" />
      </Link>
    </header>
  );
}
