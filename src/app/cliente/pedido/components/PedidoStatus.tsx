import ui from "../pedido-ui.module.css";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

export function PedidoStatus({ msg }: any) {
  if (!msg) return null;

  const isError = msg.toLowerCase().includes("error");
  const isSuccess = msg.toLowerCase().includes("correctamente") || msg.toLowerCase().includes("éxito");

  return (
    <div className={`${ui.statusAlert} ${isError ? ui.statusError : isSuccess ? ui.statusSuccess : ui.statusInfo}`}>
      {isError ? (
        <AlertCircle className={ui.statusIcon} />
      ) : isSuccess ? (
        <CheckCircle className={ui.statusIcon} />
      ) : (
        <Info className={ui.statusIcon} />
      )}
      <span className={ui.statusText}>{msg}</span>
    </div>
  );
}