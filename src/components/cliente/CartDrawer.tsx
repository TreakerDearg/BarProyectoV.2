"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, Trash2, Plus, Minus, ShoppingCart,
  Edit2, Check, ChevronRight,
} from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./CartDrawer.module.css";

export function CartDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const cart           = useClienteStore((s) => s.cart);
  const removeFromCart = useClienteStore((s) => s.removeFromCart);
  const setLineQty     = useClienteStore((s) => s.setLineQty);
  const setLineNotes   = useClienteStore((s) => s.setLineNotes);
  const clearCart      = useClienteStore((s) => s.clearCart);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular subtotal real desde los precios guardados en el store
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleQtyChange = useCallback((productId: string, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(productId);
    } else {
      setLineQty(productId, newQty);
    }
  }, [removeFromCart, setLineQty]);

  const handleSaveNotes = useCallback((productId: string) => {
    setLineNotes(productId, notesValue);
    setEditingNotes(null);
    setNotesValue("");
  }, [setLineNotes, notesValue]);

  const handleCheckout = useCallback(() => {
    setIsOpen(false);
    router.push("/cliente/pedido");
  }, [router]);

  const handleGoToCarta = useCallback(() => {
    setIsOpen(false);
    router.push("/cliente/carta");
  }, [router]);

  const formatPrice = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={styles.cartTrigger}
        aria-label={`Abrir carrito${itemCount > 0 ? `, ${itemCount} productos` : ""}`}
      >
        <ShoppingCart className={styles.cartTriggerIcon} aria-hidden="true" />
        {itemCount > 0 && (
          <span className={styles.cartTriggerBadge} aria-hidden="true">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              className={styles.drawer}
              role="dialog"
              aria-modal="true"
              aria-label="Tu carrito"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {/* Header */}
              <div className={styles.drawerHeader}>
                <div className={styles.drawerTitle}>
                  <ShoppingCart className={styles.drawerTitleIcon} aria-hidden="true" />
                  <h2>Tu Carrito</h2>
                  {itemCount > 0 && (
                    <span className={styles.drawerItemCount}>({itemCount})</span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={styles.closeButton}
                  aria-label="Cerrar carrito"
                >
                  <X className={styles.closeIcon} aria-hidden="true" />
                </button>
              </div>

              {/* Body */}
              <div className={styles.drawerContent}>
                {cart.length === 0 ? (
                  /* ── Empty state ─────────────────────────────── */
                  <div className={styles.emptyState}>
                    <ShoppingCart className={styles.emptyIcon} aria-hidden="true" />
                    <p className={styles.emptyText}>Tu carrito está vacío</p>
                    <p className={styles.emptyHint}>Agregá productos desde la carta</p>
                    <button onClick={handleGoToCarta} className={styles.emptyCta}>
                      Ver Carta
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ── Lista ────────────────────────────────── */}
                    <ul className={styles.cartList} aria-label="Productos en el carrito">
                      {cart.map((item) => (
                        <li key={item.productId} className={styles.cartItem}>
                          <div className={styles.itemMain}>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemName}>{item.name}</span>
                              <span className={styles.itemPrice}>
                                {formatPrice(item.price)} c/u
                              </span>
                            </div>

                            <div className={styles.itemControls}>
                              <div className={styles.qtyControls}>
                                <button
                                  onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                                  className={styles.qtyButton}
                                  aria-label={`Reducir cantidad de ${item.name}`}
                                >
                                  <Minus className={styles.qtyIcon} aria-hidden="true" />
                                </button>
                                <span className={styles.qtyValue} aria-label={`Cantidad: ${item.quantity}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                                  className={styles.qtyButton}
                                  aria-label={`Aumentar cantidad de ${item.name}`}
                                >
                                  <Plus className={styles.qtyIcon} aria-hidden="true" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className={styles.removeButton}
                                aria-label={`Eliminar ${item.name} del carrito`}
                              >
                                <Trash2 className={styles.removeIcon} aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal de la línea */}
                          <div className={styles.itemLineTotal}>
                            {formatPrice(item.price * item.quantity)}
                          </div>

                          {/* Notas */}
                          <div className={styles.itemNotesSection}>
                            {editingNotes === item.productId ? (
                              <div className={styles.notesEditor}>
                                <input
                                  type="text"
                                  value={notesValue}
                                  onChange={(e) => setNotesValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveNotes(item.productId);
                                    if (e.key === "Escape") { setEditingNotes(null); setNotesValue(""); }
                                  }}
                                  placeholder="Agregar notas..."
                                  className={styles.notesInput}
                                  autoFocus
                                  maxLength={120}
                                />
                                <button
                                  onClick={() => handleSaveNotes(item.productId)}
                                  className={styles.notesSaveButton}
                                  aria-label="Guardar notas"
                                >
                                  <Check className={styles.notesIcon} aria-hidden="true" />
                                </button>
                              </div>
                            ) : (
                              <div className={styles.notesDisplay}>
                                <span className={item.notes ? styles.notesText : styles.notesPlaceholder}>
                                  {item.notes || "Sin notas"}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingNotes(item.productId);
                                    setNotesValue(item.notes);
                                  }}
                                  className={styles.notesEditButton}
                                  aria-label={`Editar notas de ${item.name}`}
                                >
                                  <Edit2 className={styles.notesIcon} aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* ── Resumen de precio ─────────────────────── */}
                    <div className={styles.paymentSummary}>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>
                          {itemCount} {itemCount === 1 ? "producto" : "productos"}
                        </span>
                        <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
                      </div>
                      <div className={styles.summaryRowTotal}>
                        <span className={styles.summaryLabelTotal}>Total estimado</span>
                        <span className={styles.summaryValueTotal}>{formatPrice(subtotal)}</span>
                      </div>
                      <p className={styles.summaryNote}>
                        El precio final se confirma al enviar el pedido.
                      </p>
                    </div>

                    {/* ── Footer ───────────────────────────────── */}
                    <div className={styles.drawerFooter}>
                      <button onClick={() => { clearCart(); }} className={styles.clearButton}>
                        Vaciar carrito
                      </button>
                      <button onClick={handleCheckout} className={styles.checkoutButton}>
                        <span>Hacer pedido</span>
                        <ChevronRight className={styles.checkoutIcon} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
