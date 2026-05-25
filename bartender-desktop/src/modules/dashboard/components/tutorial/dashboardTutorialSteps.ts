import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  DollarSign,
  PackageSearch,
  Activity,
  Bell,
  LayoutGrid,
  Wifi,
  Sparkles,
} from "lucide-react";

export interface DashboardTutorialStep {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  tips: string[];
  examples?: string[];
}

export const dashboardTutorialSteps: DashboardTutorialStep[] = [
  {
    id: "intro",
    title: "¿Qué es el Panel Nebula?",
    icon: Sparkles,
    content:
      "El Panel Nebula es el centro de control del local. Aquí ves ventas, operación en vivo, inventario y promociones en un solo lugar, actualizado en tiempo real.",
    tips: [
      "Pensado para dueños y encargados que necesitan una vista rápida",
      "Los datos vienen del mismo sistema que mesas, pedidos y caja",
      "Puedes cambiar entre vista Simple y Avanzado según tu experiencia",
    ],
    examples: [
      "Al abrir el turno, revisa Operación para ver carga de cocina y barra",
      "Antes de cerrar, entra a Ventas para ver descuentos del día",
    ],
  },
  {
    id: "tabs",
    title: "Las cuatro secciones",
    icon: LayoutDashboard,
    content:
      "El panel se divide en Operación, Análisis, Ventas e Inventario. Cada pestaña muestra solo la información relevante para esa área.",
    tips: [
      "Operación: ingresos, pedidos activos y estado del servicio",
      "Análisis: comparativa entre productos de autor y clásicos",
      "Ventas: rendimiento por hora y descuentos",
      "Inventario: stock bajo, agotados y reposición urgente",
    ],
  },
  {
    id: "kpis",
    title: "Indicadores del resumen",
    icon: BarChart3,
    content:
      "Arriba verás números clave que cambian según la pestaña activa. Las flechas de tendencia comparan con el periodo anterior (mismo rango de días).",
    tips: [
      "En modo Simple solo se muestran los 2 indicadores más importantes",
      "El tiempo promedio de orden se calcula con pedidos completados",
      "Si un número no cuadra, cambia el rango (24 h, 7 o 30 días) en Análisis o Ventas",
    ],
  },
  {
    id: "operation",
    title: "Pestaña Operación",
    icon: Zap,
    content:
      "Aquí monitoreas el pulso del servicio: gráfico de ingresos, carga de cocina y barra, reservas y actividad reciente.",
    tips: [
      "La etiqueta «En vivo» indica sincronización con el servidor",
      "Despliega «Más detalles» en modo Simple para tops y precios dinámicos",
      "Usa «Ver registro completo» para el historial de reservas",
    ],
  },
  {
    id: "alerts",
    title: "Alertas y descuentos",
    icon: Bell,
    content:
      "Las alertas de inventario y los descuentos aplicados aparecen como notificaciones y en la columna de actividad. El inventario crítico se marca en rojo.",
    tips: [
      "Un descuento nuevo muestra un aviso flotante unos segundos",
      "Stock bajo y agotados se actualizan sin recargar toda la página",
      "Revisa Inventario si ves alertas repetidas de reposición",
    ],
  },
  {
    id: "analytics",
    title: "Pestaña Análisis",
    icon: BarChart3,
    content:
      "Compara el desempeño de coctelería de autor frente a clásicos con la matriz radar y el ranking de productos.",
    tips: [
      "Cambia entre 24 h, 7 y 30 días para acortar o ampliar el análisis",
      "Autor (violeta/dorado) vs Clásico (verde) en la matriz",
      "«Ver reporte completo» abre un resumen de ventas y ticket",
    ],
  },
  {
    id: "sales",
    title: "Pestaña Ventas",
    icon: DollarSign,
    content:
      "Mide ingresos, descuentos por hora y participación por categoría. Incluye métricas de la ruleta de promociones.",
    tips: [
      "La línea verde son ventas; la violeta punteada son descuentos",
      "El canal dominante es la categoría que más facturó",
      "En Avanzado verás la tabla de bebidas con mejor rendimiento",
    ],
  },
  {
    id: "inventory",
    title: "Pestaña Inventario",
    icon: PackageSearch,
    content:
      "Controla existencias: cuántos productos están bajos, cuántos agotados y el valor total en bodega. Los ítems urgentes aparecen en tarjetas rojas.",
    tips: [
      "Reposición urgente = stock en o por debajo del mínimo",
      "Los datos se refrescan cuando hay alertas del sistema",
      "Complementa con el módulo de inventario del menú lateral",
    ],
  },
  {
    id: "modes",
    title: "Modo Simple y Avanzado",
    icon: LayoutGrid,
    content:
      "Simple oculta detalles detrás de secciones plegables para no abrumar. Avanzado muestra gráficos, tablas y paneles laterales a la vez.",
    tips: [
      "Recomendado empezar en Simple los primeros días",
      "Tu preferencia se guarda automáticamente en este equipo",
      "Puedes cambiar de modo en cualquier momento sin perder datos",
    ],
  },
  {
    id: "live",
    title: "Conexión en tiempo real",
    icon: Wifi,
    content:
      "El indicador «Conectado a Nebula» confirma enlace con el servidor. Pedidos, KPIs y alertas se actualizan por WebSocket; si falla, hay respaldo cada 45 segundos.",
    tips: [
      "Si dice desconectado, revisa red y que el backend esté encendido",
      "Las actividades nuevas aparecen en la columna de actividad",
      "Vuelve a abrir el panel si permanece desconectado varios minutos",
    ],
    examples: [
      "Al crear un pedido en Mesas, Operación refleja más órdenes activas en segundos",
      "Al aplicar un descuento, verás el aviso y el registro en actividad",
    ],
  },
  {
    id: "activity",
    title: "Actividad en vivo",
    icon: Activity,
    content:
      "La línea de tiempo muestra reservas, descuentos y eventos del sistema ordenados por hora. Es el diario operativo del turno.",
    tips: [
      "Se conservan las últimas 8 entradas en pantalla",
      "Cada tipo de evento tiene su propio texto descriptivo",
      "Combínalo con el registro completo de reservas para auditoría",
    ],
  },
];
