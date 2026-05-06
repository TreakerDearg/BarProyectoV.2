import { CheckCircle, AlertCircle } from "lucide-react";
import styles from "../Reservas.module.css";
import clsx from "clsx";

export function ReservationStatus({ msg, err }: any) {
  if (!msg && !err) return null;

  const isError = Boolean(err);

  return (
    <div
      className={clsx(
        isError ? styles.alertError : styles.alertSuccess,
        "flex items-center gap-3"
      )}
    >
      {/* ICONO */}
      <div className="shrink-0">
        {isError ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
      </div>

      {/* TEXTO */}
      <p className="leading-relaxed">
        {err || msg}
      </p>
    </div>
  );
}