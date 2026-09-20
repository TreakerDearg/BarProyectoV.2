import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import styles from "./AppCartBar.module.css";

export function AppCartBar({ count, total }: { count: number; total: number }) {
  if (!count) return null;
  return <div className={styles.bar}><div className={styles.summary}><span><ShoppingBag size={15} /> {count} {count === 1 ? "producto" : "productos"}</span><span className={styles.total}>{total.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}</span></div><Link className={styles.link} href="/cliente/app/pedido">Ver pedido <ArrowRight size={15} /></Link></div>;
}
