"use client";

import { useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingCart, Edit2, Check, ChevronRight } from "lucide-react";
import { useClienteStore } from "@/stores/useClienteStore";
import styles from "./CartDrawer.module.css";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  
  const cart = useClienteStore((state) => state.cart);
  const removeFromCart = useClienteStore((state) => state.removeFromCart);
  const setLineQty = useClienteStore((state) => state.setLineQty);
  const setLineNotes = useClienteStore((state) => state.setLineNotes);
  const clearCart = useClienteStore((state) => state.clearCart);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQtyChange = (productId: string, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(productId);
    } else {
      setLineQty(productId, newQty);
    }
  };

  const handleClear = () => {
    clearCart();
    setIsOpen(false);
  };

  const handleEditNotes = (productId: string, currentNotes: string) => {
    setEditingNotes(productId);
    setNotesValue(currentNotes);
  };

  const handleSaveNotes = (productId: string) => {
    setLineNotes(productId, notesValue);
    setEditingNotes(null);
    setNotesValue("");
  };

  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNotesValue("");
  };

  const handleCheckout = () => {
    setIsOpen(false);
    window.location.href = "/cliente/pedido";
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={styles.cartTrigger}
        aria-label="Abrir carrito"
      >
        <ShoppingCart className={styles.cartTriggerIcon} />
        {itemCount > 0 && (
          <span className={styles.cartTriggerBadge}>{itemCount}</span>
        )}
      </button>

      {/* Overlay - Solo renderizado cuando isOpen es true */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer - Solo renderizado cuando isOpen es true */}
      {isOpen && (
        <div className={styles.drawerOpen}>
          {/* Header */}
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitle}>
              <ShoppingCart className={styles.drawerTitleIcon} />
              <h2>Tu Carrito</h2>
              <span className={styles.drawerItemCount}>({itemCount})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Cerrar"
            >
              <X className={styles.closeIcon} />
            </button>
          </div>

          {/* Content */}
          <div className={styles.drawerContent}>
            {cart.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingCart className={styles.emptyIcon} />
                <p className={styles.emptyText}>Tu carrito está vacío</p>
                <p className={styles.emptyHint}>
                  Agregá productos desde la carta
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/cliente/carta";
                  }}
                  className={styles.emptyCta}
                >
                  Ver Carta
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <ul className={styles.cartList}>
                  {cart.map((item) => (
                    <li key={item.productId} className={styles.cartItem}>
                      <div className={styles.itemMain}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                        </div>
                        
                        <div className={styles.itemControls}>
                          <div className={styles.qtyControls}>
                            <button
                              onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                              className={styles.qtyButton}
                              aria-label="Reducir cantidad"
                            >
                              <Minus className={styles.qtyIcon} />
                            </button>
                            <span className={styles.qtyValue}>{item.quantity}</span>
                            <button
                              onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                              className={styles.qtyButton}
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className={styles.qtyIcon} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemove(item.productId)}
                            className={styles.removeButton}
                            aria-label="Eliminar del carrito"
                          >
                            <Trash2 className={styles.removeIcon} />
                          </button>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className={styles.itemNotesSection}>
                        {editingNotes === item.productId ? (
                          <div className={styles.notesEditor}>
                            <input
                              type="text"
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              placeholder="Agregar notas..."
                              className={styles.notesInput}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNotes(item.productId)}
                              className={styles.notesSaveButton}
                              aria-label="Guardar notas"
                            >
                              <Check className={styles.notesIcon} />
                            </button>
                          </div>
                        ) : (
                          <div className={styles.notesDisplay}>
                            {item.notes ? (
                              <span className={styles.notesText}>{item.notes}</span>
                            ) : (
                              <span className={styles.notesPlaceholder}>Sin notas</span>
                            )}
                            <button
                              onClick={() => handleEditNotes(item.productId, item.notes)}
                              className={styles.notesEditButton}
                              aria-label="Editar notas"
                            >
                              <Edit2 className={styles.notesIcon} />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Payment Summary */}
                <div className={styles.paymentSummary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Items</span>
                    <span className={styles.summaryValue}>{itemCount}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Subtotal</span>
                    <span className={styles.summaryValue}>Calculado en checkout</span>
                  </div>
                  <div className={styles.summaryRowTotal}>
                    <span className={styles.summaryLabelTotal}>Total</span>
                    <span className={styles.summaryValueTotal}>Calculado en checkout</span>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles.drawerFooter}>
                  <button
                    onClick={handleClear}
                    className={styles.clearButton}
                  >
                    Limpiar carrito
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    className={styles.checkoutButton}
                  >
                    <span>Ir a Checkout</span>
                    <ChevronRight className={styles.checkoutIcon} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
