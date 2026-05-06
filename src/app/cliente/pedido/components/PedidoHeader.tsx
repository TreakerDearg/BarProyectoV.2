import ui from "../pedido-ui.module.css";

export function PedidoHeader() {
  return (
    <div className={ui.header}>
      <h1 className={ui.title}>Pedido en mesa</h1>
      <p className={ui.subtitle}>
        Seleccioná productos y enviá tu pedido directamente al sistema
      </p>
    </div>
  );
}