import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  LayoutGrid,
  ClipboardList,
  UserCheck,
  Wallet,
  DoorClosed,
  Sparkles,
} from "lucide-react";

export interface SalonTutorialStep {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  tips: string[];
}

export const salonTutorialSteps: SalonTutorialStep[] = [
  {
    id: "intro",
    title: "Flujo del salón Nebula",
    icon: Sparkles,
    content:
      "Reservas, mesas y pedidos trabajan juntos. Si sigues los pasos en orden, no tendrás que adivinar qué botón pulsar.",
    tips: [
      "Empieza en Reservas o abre una mesa libre para walk-in",
      "Sentar clientes abre la sesión de la mesa automáticamente",
      "Los pedidos solo funcionan con mesa ocupada y sesión activa",
    ],
  },
  {
    id: "reserve",
    title: "1. Reservar",
    icon: Calendar,
    content:
      "En Nebula · Reservas creas o confirmas reservas. Asigna mesa y horario; la mesa quedará en estado reservada.",
    tips: [
      "Confirma la reserva antes de la hora de llegada",
      "El radar muestra llegadas del día",
    ],
  },
  {
    id: "seat",
    title: "2. Sentar clientes",
    icon: UserCheck,
    content:
      "Cuando lleguen, pulsa «Sentar» (en Reservas o en la ficha de la mesa). Eso abre la sesión POS — no uses «Abrir mesa» en una mesa solo reservada.",
    tips: [
      "Tras sentar, puedes ir directo a la mesa para tomar el pedido",
      "La misma sesión se usa en todo el sistema",
    ],
  },
  {
    id: "tables",
    title: "3. Mesas y plano",
    icon: LayoutGrid,
    content:
      "Nebula · Salón muestra el plano en vivo. Colores indican libre, reservada, ocupada o mantenimiento.",
    tips: [
      "El banner «Siguiente paso» te guía según la mesa seleccionada",
      "Modo Simple oculta opciones avanzadas",
    ],
  },
  {
    id: "orders",
    title: "4. Tomar pedidos",
    icon: ClipboardList,
    content:
      "Desde la mesa ocupada usa «Nuevo pedido», o en Nebula · Comandas elige una mesa con sesión abierta.",
    tips: [
      "Sin sesión activa el sistema no deja crear pedidos",
      "Puedes avanzar ítems a preparando / listo en Comandas",
    ],
  },
  {
    id: "pay",
    title: "5. Cobrar",
    icon: Wallet,
    content:
      "Procesa pagos desde la ficha de la mesa. Revisa el historial antes de cerrar si hay saldo pendiente.",
    tips: [
      "Pagos parciales se reflejan en el estado de la mesa",
    ],
  },
  {
    id: "close",
    title: "6. Cerrar mesa",
    icon: DoorClosed,
    content:
      "Al cerrar la mesa se libera para el siguiente turno. Si había reserva sentada, se marca como finalizada.",
    tips: [
      "Mantenimiento breve opcional tras cerrar",
      "Todo queda sincronizado en tiempo real",
    ],
  },
];
