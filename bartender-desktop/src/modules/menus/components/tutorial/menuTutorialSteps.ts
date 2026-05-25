import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  Plus,
  CheckCircle,
  Sparkles,
  FolderKanban,
  Zap,
  BookOpen,
  Link2,
  Eye,
  Settings,
  Grid3x3,
  Copy
} from "lucide-react";

export interface MenuTutorialStep {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  tips: string[];
  examples?: string[];
}

export const menuTutorialSteps: MenuTutorialStep[] = [
  {
    id: "intro",
    title: "¿Qué son las Cartas Estratégicas?",
    icon: Sparkles,
    content:
      "Las Cartas Estratégicas (menús) son la estructura organizada de tus productos. Aquí defines qué se sirve, cómo se presenta y qué está disponible para los clientes.",
    tips: [
      "Pensado para crear diferentes menús según ocasión",
      "Puedes tener carta de bar, carta de cocina, menú especial",
      "Se conecta automáticamente con productos e inventario",
    ],
    examples: [
      "Carta de cócteles de autor para noche VIP",
      "Menú del día con opciones de cocina",
    ],
  },
  {
    id: "dashboard",
    title: "Panel de Cartas",
    icon: LayoutDashboard,
    content:
      "Arriba verás las métricas principales: cartas registradas, activas, items totales y promedio por carta. Esto te da una vista rápida de tu estructura de menús.",
    tips: [
      "Cartas activas = visibles para clientes",
      "Items totales = suma de todos los productos en todas las cartas",
      "Promedio por carta = densidad de productos",
    ],
    examples: [
      "Si tienes 3 cartas con 50 items, promedio es 16.7 items por carta",
      "Cartas inactivas no aparecen en el sistema de clientes",
    ],
  },
  {
    id: "structure",
    title: "Estructura de Menús",
    icon: Layers,
    content:
      "Cada menú se organiza en categorías, y cada categoría contiene productos. Esta estructura jerárquica hace fácil organizar y navegar el menú.",
    tips: [
      "Ejemplo: Carta de Cócteles → Categoría: Clásicos → Productos: Mojito, Daiquiri",
      "Puedes reordenar categorías y productos",
      "Las categorías pueden tener cualquier nombre",
    ],
    examples: [
      "Carta Bar: 'Bebidas Blancas', 'Bebidas Oscuras', 'Sin Alcohol'",
      "Carta Cocina: 'Entradas', 'Platos Fuertes', 'Postres'",
    ],
  },
  {
    id: "create",
    title: "Crear Nueva Carta",
    icon: Plus,
    content:
      "Haz clic en 'Nuevo Menú' para crear una carta nueva. Define el nombre, descripción, tipo (bar, cocina, mixto) y agrega categorías con productos.",
    tips: [
      "El nombre debe ser claro y descriptivo",
      "La descripción ayuda a identificar el propósito",
      "El tipo define qué productos se pueden agregar",
    ],
    examples: [
      "Nombre: 'Carta Nocturna', Tipo: 'bar', Descripción: 'Cócteles exclusivos'",
      "Nombre: 'Menú Ejecutivo', Tipo: 'kitchen', Descripción: 'Almuerzos de negocio'",
    ],
  },
  {
    id: "categories",
    title: "Gestión de Categorías",
    icon: FolderKanban,
    content:
      "Las categorías organizan los productos dentro de un menú. Puedes crear, editar, eliminar y reordenar categorías según necesites.",
    tips: [
      "Nombres cortos y claros funcionan mejor",
      "Puedes tener tantas categorías como necesites",
      "El orden afecta cómo se muestra en el sistema",
    ],
    examples: [
      "En carta de bar: 'Tragos Clásicos', 'Creaciones de Autor', 'Shots'",
      "Reordena para poner los más populares primero",
    ],
  },
  {
    id: "products",
    title: "Agregar Productos",
    icon: Grid3x3,
    content:
      "Dentro de cada categoría, agregas los productos que quieres mostrar. Estos productos deben existir previamente en el catálogo de productos.",
    tips: [
      "Solo aparecen productos disponibles del catálogo",
      "Puedes establecer disponibilidad por menú",
      "El orden de productos define la presentación",
    ],
    examples: [
      "En categoría 'Tragos Clásicos' agrega Mojito, Daiquiri, Margarita",
      "Si un producto no está disponible, no aparecerá en la carta",
    ],
  },
  {
    id: "activation",
    title: "Activar/Desactivar",
    icon: CheckCircle,
    content:
      "Controla qué cartas están activas e inactivas. Solo las cartas activas son visibles para los clientes y el personal de servicio.",
    tips: [
      "Activa solo las cartas que estás usando actualmente",
      "Puedes desactivar temporalmente sin eliminar",
      "Útil para menús estacionales o promocionales",
    ],
    examples: [
      "Activa 'Carta Navideña' solo en diciembre",
      "Desactiva menú especial cuando termina el evento",
    ],
  },
  {
    id: "preview",
    title: "Vista Previa",
    icon: Eye,
    content:
      "Antes de activar una carta, usa la vista previa para ver cómo se verá para los clientes. Esto te ayuda a ajustar la presentación.",
    tips: [
      "Verifica que las categorías estén en orden correcto",
      "Revisa que todos los productos estén bien colocados",
      "La vista previa simula la experiencia del cliente",
    ],
    examples: [
      "Previsualiza la carta antes del lanzamiento",
      "Ajusta el orden basándote en la vista previa",
    ],
  },
  {
    id: "connection",
    title: "Conexión con Productos",
    icon: Link2,
    content:
      "Los menús se conectan directamente con el catálogo de productos. Si un producto cambia en el catálogo, se actualiza automáticamente en todos los menús.",
    tips: [
      "Los cambios de precio se reflejan automáticamente",
      "Si un producto se desactiva, desaparece de las cartas",
      "Las imágenes de productos vienen del catálogo",
    ],
    examples: [
      "Si cambias el precio del Mojito, cambia en todas las cartas",
      "Si desactivas un producto, desaparece de todas las cartas",
    ],
  },
  {
    id: "inventory",
    title: "Relación con Inventario",
    icon: BookOpen,
    content:
      "Los productos en menús pueden tener recetas que conectan con inventario. Esto permite control automático de stock basado en ventas.",
    tips: [
      "Solo productos con receta afectan inventario",
      "El stock se reduce automáticamente al vender",
      "Alertas cuando falta stock para productos del menú",
    ],
    examples: [
      "Mojito con receta usa ron, lima, azúcar del inventario",
      "Al vender mojito, se reduce stock de ingredientes",
    ],
  },
  {
    id: "clone",
    title: "Duplicar Cartas",
    icon: Copy,
    content:
      "Si necesitas crear una carta similar a una existente, usa la función de duplicar. Esto copia toda la estructura y puedes personalizarla.",
    tips: [
      "Ideal para crear variaciones de menús existentes",
      "Ahorra tiempo en configuración",
      "La duplicación crea una copia independiente",
    ],
    examples: [
      "Duplica 'Carta de Bar' para crear 'Carta de Bar VIP'",
      "Ajusta la copia con productos exclusivos VIP",
    ],
  },
  {
    id: "advanced",
    title: "Modo Avanzado",
    icon: Settings,
    content:
      "El modo avanzado muestra funcionalidades adicionales como reorganización masiva, exportación/importación, y análisis de rendimiento por carta.",
    tips: [
      "Reorganización drag-and-drop de categorías y productos",
      "Exporta cartas para backup o análisis",
      "Vista de estadísticas de uso por carta",
    ],
    examples: [
      "Exporta carta completa para auditoría",
      "Reorganiza productos basándote en ventas",
    ],
  },
  {
    id: "tips",
    title: "Consejos Pro",
    icon: Zap,
    content:
      "Organiza tus cartas estratégicamente: usa nombres claros, mantén estructuras consistentes, y revisa periódicamente la disponibilidad de productos.",
    tips: [
      "Nombres consistentes ayudan al personal y clientes",
      "Revisa stock antes de activar nuevas cartas",
      "Usa categorías lógicas según tipo de establecimiento",
      "Mantén actualizadas las cartas según temporada",
    ],
    examples: [
      "Para bar: organizar por tipo de bebida (blancas, oscuras)",
      "Para cocina: organizar por momento del menú (entradas, platos)",
    ],
  },
];