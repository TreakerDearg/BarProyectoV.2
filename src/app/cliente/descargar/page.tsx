import type { Metadata } from "next";
import { DescargarClient } from "./DescargarClient";

export const metadata: Metadata = {
  title: "Descargar Nebula App — Android",
  description:
    "Descargá la app oficial de Nebula para Android. Pedidos en mesa, reservas, carta interactiva, ruleta exclusiva y sistema de puntos VIP. Gratis, sin Play Store.",
  openGraph: {
    title: "Nebula App — Descargá para Android",
    description: "La experiencia completa del bar en tu bolsillo. Gratis.",
    type: "website",
  },
};

export default function DescargarPage() {
  return <DescargarClient />;
}
