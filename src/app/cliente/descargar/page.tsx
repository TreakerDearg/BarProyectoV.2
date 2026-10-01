import type { Metadata } from "next";
import { DescargarClient } from "./DescargarClient";

export const metadata: Metadata = {
  title: "Descargar App — Nebula",
  description:
    "Descargá la app de Nebula Food & Beverage para Android. Pedidos, reservas y más en tu bolsillo.",
};

export default function DescargarPage() {
  return <DescargarClient />;
}
