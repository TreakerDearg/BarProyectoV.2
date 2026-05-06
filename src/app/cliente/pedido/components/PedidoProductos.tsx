import ui from "../pedido-ui.module.css";

export function PedidoProductos({ products, addToCart, priceOf }: any) {
  return (
    <section className={ui.card}>
      <div className={ui.cardInner}>
        <h2 className={ui.cardTitle}>2. Productos</h2>

        <div className={ui.productsGrid}>
          {products.map((p: any) => (
            <div key={p._id} className={ui.productCard}>
              <div>
                <p>{p.name}</p>
                <span className={ui.price}>
                  ${priceOf(p)}
                </span>
              </div>

              <button
                onClick={() =>
                  addToCart({
                    productId: p._id,
                    name: p.name,
                    quantity: 1,
                  })
                }
                className={ui.btnGhost}
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}