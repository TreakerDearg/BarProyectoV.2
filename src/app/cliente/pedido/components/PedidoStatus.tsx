import ui from "../pedido-ui.module.css";

export function PedidoStatus({ msg }: any) {
  if (!msg) return null;

  const isError = msg.toLowerCase().includes("error");

  return (
    <div className={isError ? ui.alertError : ui.alertSuccess}>
      {msg}
    </div>
  );
}