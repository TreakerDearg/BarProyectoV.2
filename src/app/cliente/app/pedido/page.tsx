"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { createOrder } from "@/lib/api/bartender";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./app-pedido.module.css";

function money(value: number) {
  return value.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function AppPedidoPage() {
  const cart = useClienteStore((state) => state.cart);
  const tableId = useClienteStore((state) => state.tableId);
  const sessionId = useClienteStore((state) => state.sessionId);
  const tableCode = useClienteStore((state) => state.tableCode);
  const setLineQty = useClienteStore((state) => state.setLineQty);
  const setLineNotes = useClienteStore((state) => state.setLineNotes);
  const removeFromCart = useClienteStore((state) => state.removeFromCart);
  const clearCart = useClienteStore((state) => state.clearCart);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const count = cart.reduce((total, line) => total + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const handleSubmit = async () => {
    if (!cart.length) return;
    if (!sessionId) {
      setFeedback({ type: "error", text: "Conecta tu mesa antes de enviar el pedido." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await createOrder({
        table: tableId ?? "",
        sessionId,
        items: cart.map((line) => ({ product: line.productId, quantity: line.quantity, notes: line.notes })),
      });
      clearCart();
      setFeedback({ type: "ok", text: "Pedido enviado. Te avisaremos cuando esté listo." });
    } catch (error) {
      setFeedback({ type: "error", text: error instanceof Error ? error.message : "No se pudo enviar el pedido." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <span className={styles.eyebrow}>Pedido</span>
        <h1 className={styles.title}>Revisa antes de enviar</h1>
        <p className={styles.description}>{count ? `${count} ${count === 1 ? "producto elegido" : "productos elegidos"}.` : "Tu selección aparecerá aquí."}</p>
      </header>

      {tableCode && <p className={styles.notice}><ShoppingBag size={17} aria-hidden="true" /> Mesa conectada · código {tableCode}</p>}
      {feedback && <p className={feedback.type === "ok" ? styles.feedback : styles.error} role="status">{feedback.text}</p>}

      {!cart.length ? (
        <section className={styles.empty}>
          <ShoppingBag size={30} color="var(--gold-light)" aria-hidden="true" />
          <h2>Aún no agregaste nada</h2>
          <p>Encuentra algo rico en la carta y vuelve aquí para enviarlo.</p>
          <Link href="/cliente/app/carta" className={styles.link}>Explorar carta <ArrowRight size={16} /></Link>
        </section>
      ) : (
        <>
          <section className={styles.list} aria-label="Productos del pedido">
            {cart.map((line) => (
              <article className={styles.line} key={line.productId}>
                <div className={`${styles.image} ${styles.imageFallback}`}><ShoppingBag size={22} aria-hidden="true" /></div>
                <div className={styles.lineContent}>
                  <div className={styles.lineTop}><h2 className={styles.name}>{line.name}</h2><span className={styles.price}>{money(line.price * line.quantity)}</span></div>
                  <input className={styles.notes} value={line.notes} onChange={(event) => setLineNotes(line.productId, event.target.value)} placeholder="Añadir una nota (opcional)" aria-label={`Nota para ${line.name}`} />
                  <div className={styles.controls}>
                    <div className={styles.stepper} aria-label={`Cantidad de ${line.name}`}>
                      <button type="button" onClick={() => setLineQty(line.productId, line.quantity - 1)} aria-label={`Reducir ${line.name}`}><Minus size={15} /></button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => setLineQty(line.productId, line.quantity + 1)} aria-label={`Aumentar ${line.name}`}><Plus size={15} /></button>
                    </div>
                    <button type="button" className={styles.remove} onClick={() => removeFromCart(line.productId)}><Trash2 size={14} /> Quitar</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className={styles.summary} aria-label="Resumen del pedido">
            <div className={styles.summaryRow}><span>Subtotal</span><span>{money(total)}</span></div>
            <div className={`${styles.summaryRow} ${styles.total}`}><span>Total estimado</span><span>{money(total)}</span></div>
            <button type="button" className={styles.submit} onClick={handleSubmit} disabled={submitting}>{submitting ? "Enviando pedido..." : sessionId ? "Enviar pedido" : "Conectar mesa para pedir"}</button>
            <Link href="/cliente/app/carta" className={styles.link}><ChevronLeft size={16} /> Seguir eligiendo</Link>
          </section>
        </>
      )}
    </main>
  );
}
