"use client";

import ui from "../pedido-ui.module.css";
import { ShoppingCart, Trash2 } from "lucide-react";

export function PedidoCarrito({
  cart = [],
  setLineQty,
  removeFromCart,
  handleSubmitOrder,
  submitting,
}: any) {
  const total = cart.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0
  );

  return (
    <section className={ui.card}>
      <div className={ui.cardInner}>
        
        {/* HEADER */}
        <div className={ui.cartHeader}>
          <ShoppingCart className={ui.cartIcon} />
          <h2 className={ui.cardTitle}>Carrito</h2>

          {cart.length > 0 && (
            <span className={ui.cartBadge}>{total}</span>
          )}
        </div>

        {/* EMPTY */}
        {cart.length === 0 ? (
          <div className={ui.emptyState}>
            <p className={ui.empty}>No hay productos aún</p>
            <span className={ui.emptyHint}>
              Agregá productos desde arriba 👆
            </span>
          </div>
        ) : (
          <>
            {/* LISTA */}
            <ul className={ui.cartList}>
              {cart.map((item: any) => {
                if (!item?.productId) return null; // 🛡️ protección real

                return (
                  <li key={item.productId} className={ui.cartItem}>
                    
                    {/* INFO */}
                    <div className={ui.cartInfo}>
                      <span className={ui.cartName}>
                        {item.name}
                      </span>
                    </div>

                    {/* CONTROLES */}
                    <div className={ui.cartControls}>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setLineQty(
                            item.productId,
                            Math.max(1, Number(e.target.value) || 1)
                          )
                        }
                        className={ui.qtyInput}
                      />

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className={ui.removeBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* FOOTER */}
            <div className={ui.cartFooter}>
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className={ui.btnPrimary}
              >
                {submitting ? "Enviando..." : "Enviar pedido"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}