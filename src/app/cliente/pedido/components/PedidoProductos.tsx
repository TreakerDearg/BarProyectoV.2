"use client";

import ui from "../pedido-ui.module.css";

type Product = {
  _id: string;
  name: string;
};

type Props = {
  products: Product[];
  addToCart: (product: Product) => void;
  priceOf: (product: Product) => number;
  loading: boolean;
};

export function PedidoProductos({ products, addToCart, priceOf, loading }: Props) {
  return (
    <section className={ui.card}>
      <div className={ui.cardInner}>
        <h2 className={ui.cardTitle}>Productos</h2>
        <p className={ui.cardMuted}>Selecciona productos para agregarlos al carrito.</p>

        {loading ? (
          <p className={ui.cardMuted}>Cargando productos...</p>
        ) : (
          <div className={ui.productsGrid}>
            {products.map((product) => (
              <article key={product._id} className={ui.productCard}>
                <div>
                  <h3>{product.name}</h3>
                  <p className={ui.price}>${priceOf(product)}</p>
                </div>
                <button className={ui.btnPrimary} onClick={() => addToCart(product)}>
                  Agregar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
