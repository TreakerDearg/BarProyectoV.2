import type { Table } from "../../tables/types/table";

export interface SalonNextStep {
  message: string;
  actionLabel?: string;
  tone: "info" | "warning" | "success";
}

export function getSalonNextStep(table: Table | null): SalonNextStep | null {
  if (!table) {
    return {
      message: "Selecciona una mesa en el plano para ver el siguiente paso.",
      tone: "info",
    };
  }

  if (table.status === "maintenance") {
    return {
      message: "Mesa en mantenimiento. Espera a que esté disponible.",
      tone: "warning",
    };
  }

  if (table.status === "available") {
    return {
      message: "Mesa libre: abre la mesa para walk-in o crea una reserva.",
      actionLabel: "Abrir mesa",
      tone: "info",
    };
  }

  if (table.status === "reserved") {
    return {
      message:
        "Hay una reserva. Pulsa «Sentar clientes» para iniciar la sesión y tomar pedidos.",
      actionLabel: "Sentar clientes",
      tone: "warning",
    };
  }

  if (table.status === "occupied") {
    const hasOrders = (table.orders?.length ?? 0) > 0;
    if (!hasOrders) {
      return {
        message: "Mesa abierta. El siguiente paso es registrar el primer pedido.",
        actionLabel: "Nuevo pedido",
        tone: "success",
      };
    }
    return {
      message: "Sesión activa. Puedes agregar pedidos o procesar el pago.",
      actionLabel: "Nuevo pedido",
      tone: "success",
    };
  }

  return null;
}
