import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Filter,
  Plus,
  AlertTriangle,
  Activity,
  Link2,
  Sparkles,
  Zap,
  Box,
  Wrench,
  ShoppingCart
} from "lucide-react";

export interface InventoryTutorialStep {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  tips: string[];
  examples?: string[];
}

export const inventoryTutorialSteps: InventoryTutorialStep[] = [
  {
    id: "intro",
    title: "¿Qué es la Bóveda de Insumos?",
    icon: Sparkles,
    content:
      "La Bóveda de Insumos es el centro de control de stock del local. Aquí manages todos los ingredientes, bebidas y suministros necesarios para la operación, con alertas automáticas cuando algo se agota.",
    tips: [
      "Pensado para bartenders, cocineros y encargados de stock",
      "Se conecta automáticamente con recetas y productos",
      "Las alertas de reposición aparecen en tiempo real",
    ],
    examples: [
      "Si te quedas sin ron, el sistema alerta antes de que afecte el menú",
      "El costo total de la bóveda ayuda a controlar presupuesto",
    ],
  },
  {
    id: "dashboard",
    title: "Panel de Control",
    icon: BarChart3,
    content:
      "Arriba verás los KPIs principales: insumos totales, críticos, en alerta y valor total. Estos números se actualizan automáticamente cuando haces cambios.",
    tips: [
      "Insumos críticos = stock en o por debajo del mínimo",
      "En alerta = stock bajo pero no crítico todavía",
      "Valor de bóveda = costo unitario × stock actual",
    ],
    examples: [
      "Si ves 'Críticos: 5', necesitas reponer urgente 5 insumos",
      "El valor total ayuda a saber cuánto dinero tienes en stock",
    ],
  },
  {
    id: "filters",
    title: "Filtros Inteligentes",
    icon: Filter,
    content:
      "Usa los filtros para ver solo lo que necesitas. Puedes filtrar por sector (bar, cocina, general) y buscar por nombre o categoría.",
    tips: [
      "Bar: bebidas, licores, mixers",
      "Cocina: ingredientes gastronómicos",
      "General: suministros y utensilios",
    ],
    examples: [
      "Filtra por 'bar' para ver solo el inventario de bebidas",
      "Busca 'ron' para encontrar todos los tipos de ron rápidamente",
    ],
  },
  {
    id: "create",
    title: "Crear Nuevo Insumo",
    icon: Plus,
    content:
      "Haz clic en 'Nuevo Insumo' para agregar algo nuevo al inventario. Llena los campos importantes: nombre, categoría, stock actual, stock mínimo y costo.",
    tips: [
      "El stock mínimo activa alertas automáticas",
      "El costo unitario se usa para calcular el valor total",
      "La categoría ayuda en los filtros de búsqueda",
    ],
    examples: [
      "Nombre: 'Ron Añejo', Categoría: 'Licores', Stock mínimo: 2 botellas",
      "Costo: $25, Stock actual: 5 = Valor en bóveda: $125",
    ],
  },
  {
    id: "edit",
    title: "Editar y Ajustar",
    icon: Wrench,
    content:
      "Haz clic en cualquier tarjeta de insumo para editar sus detalles. Puedes ajustar el stock, cambiar el costo, modificar la categoría o actualizar el proveedor.",
    tips: [
      "Los ajustes de stock registran el movimiento en el historial",
      "Puedes agregar una razón al ajustar (ej: 'merma', 'compra')",
      "El historial ayuda a auditoría y control",
    ],
    examples: [
      "Ajusta stock de 5 a 3 por 'merma de apertura'",
      "Actualiza costo de $25 a $28 por 'aumento de proveedor'",
    ],
  },
  {
    id: "stock",
    title: "Gestión de Stock",
    icon: Box,
    content:
      "El stock es el corazón de la bóveda. Manténlo actualizado para que las alertas funcionen correctamente y los productos del menú reflejen disponibilidad real.",
    tips: [
      "Stock mínimo = nivel de alerta para reponer",
      "Stock máximo = nivel ideal para no sobrecomprar",
      "Movimientos automáticos cuando se usan en recetas",
    ],
    examples: [
      "Si el mínimo es 2 y tienes 1, aparece como crítico",
      "Al vender un cóctel con receta, el stock se reduce automáticamente",
    ],
  },
  {
    id: "alerts",
    title: "Alertas de Reposición",
    icon: AlertTriangle,
    content:
      "Los insumos críticos y bajos se muestran con indicadores visuales. Las alertas aparecen en el panel y también en el dashboard general.",
    tips: [
      "Rojo = crítico (necesita reposición urgente)",
      "Naranja = alerta (stock bajo, planifica reposición)",
      "Las alertas se envían al encargado de compras",
    ],
    examples: [
      "Si 'Ron' pasa de 3 a 1 botella, se vuelve crítico",
      "Recibe notificaciones cuando algo toca el mínimo",
    ],
  },
  {
    id: "connection",
    title: "Conexión con Recetas",
    icon: Link2,
    content:
      "Los insumos se conectan con recetas de productos. Cuando un producto tiene receta, el stock se reduce automáticamente al venderlo.",
    tips: [
      "Cada ingrediente de receta debe existir en inventario",
      "Si falta stock, el producto se marca como no disponible",
      "La relación es bidireccional: inventario ↔ recetas ↔ productos",
    ],
    examples: [
      "Mojito usa ron, lima, azúcar y menta - todos en inventario",
      "Al vender mojito, se reduce stock de ron, lima, etc.",
    ],
  },
  {
    id: "movements",
    title: "Historial de Movimientos",
    icon: Activity,
    content:
      "Cada ajuste de stock se registra en el historial. Puedes ver qué, cuándo, por qué y cuánto cambió cada insumo a lo largo del tiempo.",
    tips: [
      "Entradas: compras, reposiciones, devoluciones",
      "Salidas: ventas, merma, pérdidas",
      "El historial es clave para control y auditoría",
    ],
    examples: [
      "Movimiento: '-2 botellas, razón: merma de apertura'",
      "Historial ayuda a detectar pérdidas o errores",
    ],
  },
  {
    id: "advanced",
    title: "Modo Avanzado",
    icon: Zap,
    content:
      "El modo avanzado muestra detalles adicionales como gráficos de tendencias, tabla completa de movimientos y opciones de exportación de datos.",
    tips: [
      "Gráficos muestran consumo histórico por insumo",
      "Exporta datos para análisis en Excel",
      "Vista de tabla para gestión masiva",
    ],
    examples: [
      "Gráfico de consumo de ron últimos 30 días",
      "Exportar inventario completo para auditoría mensual",
    ],
  },
  {
    id: "tips",
    title: "Consejos Pro",
    icon: ShoppingCart,
    content:
      "Mantén tu inventario saludable con estos consejos: revisa críticos diariamente, actualiza costos periódicamente, y usa el historial para detectar patrones.",
    tips: [
      "Revisa críticos cada mañana antes de abrir",
      "Actualiza costos cuando cambien proveedores",
      "Usa el historial para identificar insumos de alto movimiento",
      "Mínimos realistas basados en consumo real",
    ],
    examples: [
      "Si un insumo siempre está crítico, aumenta su stock mínimo",
      "Analiza historial para optimizar cantidades de compra",
    ],
  },
];