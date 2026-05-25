import type { LucideIcon } from "lucide-react";
import {
  Package,
  Plus,
  Image as ImageIcon,
  DollarSign,
  Tag,
  ChefHat,
  CheckCircle,
  Sparkles,
  Zap,
  Sliders,
  Heart,
  ShoppingCart,
  BarChart3
} from "lucide-react";

export interface ProductTutorialStep {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  tips: string[];
  examples?: string[];
}

export const productTutorialSteps: ProductTutorialStep[] = [
  {
    id: "intro",
    title: "¿Qué es el Catálogo de Productos?",
    icon: Sparkles,
    content:
      "El Catálogo de Productos es la base de todo el sistema. Aquí defines cada bebida, alimento o item que ofrece tu establecimiento, con sus precios, imágenes y características.",
    tips: [
      "Es la fuente central para menús, pedidos y ventas",
      "Todos los productos aparecen primero aquí",
      "Se conecta con recetas, inventario y menús",
    ],
    examples: [
      "Cada cóctel, comida o promoción es un producto",
      "Los cambios aquí afectan a todo el sistema",
    ],
  },
  {
    id: "types",
    title: "Tipos de Productos",
    icon: Package,
    content:
      "Los productos se clasifican por tipo: bebidas, alimentos, promocionales, etc. Esta clasificación ayuda en la organización y filtros del sistema.",
    tips: [
      "Bebidas: cócteles, shots, cervezas, vinos",
      "Alimentos: entradas, platos fuertes, postres",
      "Promocionales: combos, ofertas especiales",
    ],
    examples: [
      "Mojito es una bebida tipo 'cóctel'",
      "Hamburguesa es un alimento tipo 'plato fuerte'",
    ],
  },
  {
    id: "create",
    title: "Crear Nuevo Producto",
    icon: Plus,
    content:
      "Haz clic en 'Nuevo Producto' para agregar algo al catálogo. Los campos esenciales son nombre, precio, tipo y categoría. Los demás campos son opcionales pero recomendados.",
    tips: [
      "Nombre claro y descriptivo para fácil identificación",
      "Precio base antes de descuentos o dinámicas",
      "Categoría ayuda en organización y filtros",
    ],
    examples: [
      "Nombre: 'Mojito Clásico', Precio: $12, Categoría: 'Cócteles'",
      "Nombre: 'Hamburguesa VIP', Precio: $18, Categoría: 'Platos Fuertes'",
    ],
  },
  {
    id: "images",
    title: "Imágenes de Producto",
    icon: ImageIcon,
    content:
      "Las imágenes hacen tus productos atractivos. Puedes subir una imagen principal y una galería adicional. Las imágenes se optimizan automáticamente para el sistema.",
    tips: [
      "Usa imágenes de alta calidad pero optimizadas",
      "La imagen principal aparece en menús y pedidos",
      "La galería muestra detalles y ángulos adicionales",
    ],
    examples: [
      "Imagen principal del cóctel en vaso decorado",
      "Galería con ingredientes, presentación y tamaño",
    ],
  },
  {
    id: "pricing",
    title: "Sistema de Precios",
    icon: DollarSign,
    content:
      "El precio base es el costo estándar, pero el sistema soporta precios dinámicos según demanda, hora o eventos especiales. También puedes definir costo para márgenes.",
    tips: [
      "Precio base = precio normal sin descuentos",
      "Costo = precio de producción para calcular margen",
      "Precios dinámicos se calculan automáticamente",
    ],
    examples: [
      "Mojito: Precio $12, Costo $4 = Margen $8 (67%)",
      "Cerveza puede tener precio dinámico en happy hour",
    ],
  },
  {
    id: "tags",
    title: "Etiquetas y Categorías",
    icon: Tag,
    content:
      "Las etiquetas (tags) y categorías ayudan a organizar y filtrar productos. Úsalas para crear grupos como 'populares', 'nuevos', 'sin alcohol', etc.",
    tips: [
      "Tags: palabras clave flexibles para filtros",
      "Categorías: grupos principales de organización",
      "Puedes usar múltiples tags por producto",
    ],
    examples: [
      "Tags: 'popular', 'sin alcohol', 'fresco'",
      "Categoría: 'Cócteles Clásicos'",
    ],
  },
  {
    id: "recipes",
    title: "Conexión con Recetas",
    icon: ChefHat,
    content:
      "Los productos pueden tener recetas que definen ingredientes y cantidades. Esto conecta automáticamente con inventario para control de stock.",
    tips: [
      "Solo productos con receta afectan inventario",
      "Cada ingrediente debe existir en inventario",
      "Al vender, se reduce stock automáticamente",
    ],
    examples: [
      "Mojito: 2oz ron, 1 lima, 2cdas azúcar, menta",
      "Si no hay ron, mojito se marca no disponible",
    ],
  },
  {
    id: "availability",
    title: "Control de Disponibilidad",
    icon: CheckCircle,
    content:
      "Controla qué productos están disponibles para venta. La disponibilidad puede ser manual o automática basada en stock de ingredientes.",
    tips: [
      "Manual: activas/desactivas explícitamente",
      "Automático: basado en stock de recetas",
      "Productos no disponibles no aparecen en menús",
    ],
    examples: [
      "Desactiva 'Mojito' temporalmente si no hay menta",
      "Sistema marca no disponible si falta ron",
    ],
  },
  {
    id: "pos",
    title: "Integración con POS",
    icon: ShoppingCart,
    content:
      "Los productos marcados para POS aparecen en el punto de venta. Esto permite separar productos administrativos de los que se venden.",
    tips: [
      "Activar solo productos que realmente se venden",
      "Productos de prueba o desarrollo pueden quedar inactivos",
      "El filtro POS simplifica el punto de venta",
    ],
    examples: [
      "Activa 'Mojito' para que aparezca en POS",
      "Desactiva producto de prueba 'Cóctel Experimental'",
    ],
  },
  {
    id: "featured",
    title: "Productos Destacados",
    icon: Heart,
    content:
      "Marca productos como destacados para que aparezcan en secciones especiales, promociones o recomendaciones automáticas del sistema.",
    tips: [
      "Destacados aparecen primero en algunas vistas",
      "Útil para promociones o novedades",
      "Puedes cambiar destacados según temporada",
    ],
    examples: [
      "Marca 'Mojito' como destacado en temporada verano",
      "Destaca 'Cóctel de Navidad' en diciembre",
    ],
  },
  {
    id: "advanced",
    title: "Modo Avanzado",
    icon: Sliders,
    content:
      "El modo avanzado muestra campos técnicos como tiempo de preparación, impacto en stock, tipo de alcohol y análisis de rentabilidad detallado.",
    tips: [
      "Tiempo de preparación afecta colas de cocina/barra",
      "Impacto en stock define si necesita inventario",
      "Análisis de rentabilidad muestra margen real",
    ],
    examples: [
      "Tiempo de preparación: 3 minutos para mojito",
      "Impacto en stock: alto para cócteles con muchos ingredientes",
    ],
  },
  {
    id: "analytics",
    title: "Análisis de Rendimiento",
    icon: BarChart3,
    content:
      "El sistema puede analizar qué productos venden más, su margen de ganancia y rendimiento relativo. Esto ayuda a tomar decisiones sobre menú.",
    tips: [
      "Productos más vendidos = posibles destacados",
      "Alto margen = productos rentables",
      "Bajo rendimiento = considerar mejora o eliminación",
    ],
    examples: [
      "Si mojito vende 50% más, mantén como destacado",
      "Si margen es bajo, considera aumentar precio",
    ],
  },
  {
    id: "tips",
    title: "Consejos Pro",
    icon: Zap,
    content:
      "Mantén tu catálogo organizado y actualizado: usa nombres consistentes, imágenes de calidad, precios realistas y recetas precisas para máximo control.",
    tips: [
      "Nombres cortos y claros para fácil lectura",
      "Imágenes que muestren realmente el producto",
      "Precios competitivos pero rentables",
      "Recetas precisas para control de stock exacto",
    ],
    examples: [
      "Revisa precios periódicamente según costos",
      "Actualiza imágenes cuando cambie presentación",
      "Mantén recetas actualizadas con nuevos ingredientes",
    ],
  },
];