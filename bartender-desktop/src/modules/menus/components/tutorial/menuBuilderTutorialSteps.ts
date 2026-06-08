import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Plus,
  Type,
  Settings,
  Layers,
  Eye,
  Save,
  CheckCircle,
  Lightbulb,
  Image as ImageIcon,
  Globe,
  Clock,
  Tag
} from "lucide-react";

export interface MenuBuilderTutorialStep {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  tips: string[];
  examples?: string[];
  targetPanel?: "identity" | "config" | "categories" | "preview";
}

export const menuBuilderTutorialSteps: MenuBuilderTutorialStep[] = [
  {
    id: "builder-intro",
    title: "Modo Constructor de Cartas",
    icon: Sparkles,
    content: "El modo constructor te permite crear y editar cartas de manera interactiva. Verás diferentes paneles a la izquierda y una vista previa en tiempo real a la derecha.",
    tips: [
      "Los cambios se reflejan automáticamente en la vista previa",
      "Puedes navegar entre los diferentes paneles de edición",
      "El botón de guardar está en la parte inferior de la vista previa"
    ],
    examples: [
      "Edita el nombre en el panel izquierdo, verás el cambio en la vista previa",
      "Agrega categorías y productos, se actualizan instantáneamente"
    ]
  },
  {
    id: "create-options",
    title: "Crear desde Cero o Plantilla",
    icon: Plus,
    content: "Al crear una nueva carta, puedes elegir empezar desde cero (menú vacío) o usar una plantilla predefinida con categorías ya configuradas.",
    tips: [
      "Crear desde cero te da total libertad desde el inicio",
      "Las plantillas ahorran tiempo con estructuras comunes",
      "Ambas opciones permiten personalizar completamente después"
    ],
    examples: [
      "Usa plantilla 'Carta de Bebidas' para empezar con categorías de cócteles",
      "Crea desde cero si tienes una estructura personalizada en mente"
    ]
  },
  {
    id: "identity-panel",
    title: "Panel de Identidad",
    icon: Type,
    content: "En el panel de identidad defines la información básica de tu carta: nombre, descripción, tipo (bebidas, comida, mixto), imagen de portada y configuración SEO.",
    tips: [
      "El nombre es obligatorio y debe ser descriptivo",
      "El tipo define qué productos se pueden agregar",
      "La imagen de portada hace tu carta más atractiva",
      "SEO ayuda en búsquedas si la carta es pública"
    ],
    examples: [
      "Nombre: 'Carta Nocturna VIP', Tipo: 'mixto'",
      "Descripción: 'Selección exclusiva para clientes VIP'",
      "Agrega una imagen atractiva de tu bar o restaurante"
    ],
    targetPanel: "identity"
  },
  {
    id: "identity-seo",
    title: "Configuración SEO",
    icon: Globe,
    content: "La sección SEO permite optimizar tu carta para motores de búsqueda. Incluye meta título, meta descripción y palabras clave.",
    tips: [
      "Meta título aparece en resultados de búsqueda",
      "Meta descripción resume el contenido de la carta",
      "Palabras clave ayudan a encontrar tu carta",
      "Útil si la carta es pública en tu sitio web"
    ],
    examples: [
      "Meta título: 'Carta de Cócteles Exclusivos - Bar Nombre'",
      "Descripción: 'Descubre nuestra selección de cócteles de autor'",
      "Keywords: 'cócteles, bar, bebidas, exclusivo'"
    ]
  },
  {
    id: "identity-availability",
    title: "Disponibilidad y Horarios",
    icon: Clock,
    content: "Define horarios de disponibilidad y días específicos para mostrar esta carta. Esto es útil para menús especiales o temporales.",
    tips: [
      "Establece horas de inicio y fin del servicio",
      "Selecciona los días de la semana cuando aplica",
      "Útil para menús de desayuno, almuerzo, cena"
    ],
    examples: [
      "Menú de desayuno: 7:00 - 11:00, lunes a viernes",
      "Carta nocturna: 18:00 - 02:00, viernes y sábado"
    ]
  },
  {
    id: "identity-gallery",
    title: "Galería de Imágenes",
    icon: ImageIcon,
    content: "Agrega imágenes adicionales a tu carta para mostrar más detalles del ambiente, platos o bebidas. Estas imágenes complementan la imagen de portada.",
    tips: [
      "Muestra fotos de tu ambiente o platos destacados",
      "Las imágenes aparecen en la vista detallada de la carta",
      "Puedes agregar o eliminar imágenes fácilmente"
    ],
    examples: [
      "Fotos del bar, cócteles terminados, ambiente",
      "Imágenes de platos principales para carta de comida"
    ]
  },
  {
    id: "config-panel",
    title: "Panel de Configuración",
    icon: Settings,
    content: "El panel de configuración controla el estado y comportamiento de tu carta: activo/inactivo, público/privado, destacado, color de tema y URL personalizada.",
    tips: [
      "Activo: visible en el sistema para clientes",
      "Público: accesible vía enlace público",
      "Destacado: aparece en sección destacada",
      "Color: tema visual de la carta"
    ],
    examples: [
      "Activa la carta cuando esté lista para usar",
      "Destaca cartas especiales o promocionales",
      "Usa colores que coincidan con tu marca"
    ],
    targetPanel: "config"
  },
  {
    id: "config-slug",
    title: "URL Personalizada (Slug)",
    icon: Globe,
    content: "El slug crea una URL amigable para compartir tu carta públicamente. Si no defines uno, se genera automáticamente desde el nombre.",
    tips: [
      "Usa guiones en lugar de espacios",
      "Manténlo corto y memorable",
      "Solo letras, números y guiones",
      "Útil para compartir en redes sociales"
    ],
    examples: [
      "Nombre: 'Carta de Verano' → Slug: 'carta-de-verano'",
      "Slug personalizado: 'menu-vip-2024'"
    ]
  },
  {
    id: "config-availability",
    title: "Horarios de Disponibilidad",
    icon: Clock,
    content: "Define horarios específicos cuando esta carta está disponible. Esto controla cuándo aparece en el sistema según el tiempo.",
    tips: [
      "Diferentes horarios para diferentes cartas",
      "Útil para menús rotativos o temporales",
      "Coordina con tu horario de operación"
    ],
    examples: [
      "Carta de brunch: 10:00 - 15:00",
      "Carta nocturna: 20:00 - 03:00"
    ]
  },
  {
    id: "config-promotion",
    title: "Promoción y Precios",
    icon: Tag,
    content: "Configura fechas de promoción y rangos de precios. Esto ayuda a destacar cartas especiales y dar información sobre precios a los clientes.",
    tips: [
      "Fecha de promoción: hasta cuándo es válida",
      "Rango de precios: mínimo y máximo estimado",
      "Útil para menús temporales o especiales"
    ],
    examples: [
      "Promoción hasta: 2024-12-31",
      "Precio mínimo: $10, máximo: $50"
    ]
  },
  {
    id: "categories-panel",
    title: "Panel de Categorías",
    icon: Layers,
    content: "El panel de categorías te permite organizar tu carta en secciones. Crea categorías como 'Cócteles Clásicos', 'Platos Fuertes', etc. y agrega productos a cada una.",
    tips: [
      "Crea categorías con nombres claros",
      "Agrega productos existentes del catálogo",
      "Reordena categorías y productos con drag-and-drop",
      "Puedes crear categorías vacías y llenarlas después"
    ],
    examples: [
      "Carta de bar: 'Cócteles Clásicos', 'Creaciones de Autor', 'Shots'",
      "Carta de comida: 'Entradas', 'Platos Fuertes', 'Postres'"
    ],
    targetPanel: "categories"
  },
  {
    id: "categories-products",
    title: "Agregar Productos",
    icon: Layers,
    content: "Dentro de cada categoría, busca y agrega productos del catálogo. Solo aparecen productos disponibles y del tipo correcto para tu carta.",
    tips: [
      "Busca por nombre para encontrar productos rápidamente",
      "Verifica disponibilidad antes de agregar",
      "El tipo de carta filtra productos compatibles",
      "Puedes agregar el mismo producto a múltiples categorías"
    ],
    examples: [
      "En 'Cócteles Clásicos' agrega Mojito, Daiquiri, Margarita",
      "En 'Platos Fuertes' agrega filete, pasta, pollo"
    ]
  },
  {
    id: "preview-panel",
    title: "Vista Previa en Tiempo Real",
    icon: Eye,
    content: "La vista previa muestra cómo se verá tu carta para los clientes. Todos los cambios que haces se reflejan instantáneamente aquí.",
    tips: [
      "Verifica la apariencia antes de activar",
      "Revisa el orden de categorías y productos",
      "La vista previa simula la experiencia del cliente",
      "Útil para ajustar presentación y colores"
    ],
    examples: [
      "Edita el nombre, verás el cambio inmediato",
      "Cambia el color, la vista previa se actualiza",
      "Agrega productos, aparecen en la vista previa"
    ],
    targetPanel: "preview"
  },
  {
    id: "save-button",
    title: "Guardar Cambios",
    icon: Save,
    content: "El botón 'Guardar Menú' en la parte inferior de la vista previa guarda todos los cambios. Asegúrate de guardar antes de salir del modo constructor.",
    tips: [
      "El botón muestra estado de carga mientras guarda",
      "Aparece mensaje de éxito cuando se guarda",
      "Guarda regularmente para no perder cambios",
      "Solo puedes guardar si hay un menú seleccionado"
    ],
    examples: [
      "Haz clic en 'Guardar Menú' después de hacer cambios importantes",
      "Espera el mensaje de éxito antes de continuar"
    ]
  },
  {
    id: "exit-builder",
    title: "Salir del Modo Constructor",
    icon: CheckCircle,
    content: "Para salir del modo constructor, haz clic en 'Volver a Cartas' o selecciona otro menú. Asegúrate de guardar tus cambios antes de salir.",
    tips: [
      "Siempre guarda antes de salir",
      "Puedes volver a editar el menú después",
      "Los cambios no guardados se pierden al salir",
      "El botón de guardar está siempre visible"
    ],
    examples: [
      "Guarda con el botón 'Guardar Menú'",
      "Luego haz clic en 'Volver a Cartas' para salir"
    ]
  },
  {
    id: "best-practices",
    title: "Buenas Prácticas",
    icon: Lightbulb,
    content: "Organiza tus cartas de manera lógica y consistente. Usa nombres claros, mantén estructuras similares entre cartas del mismo tipo, y revisa periódicamente la disponibilidad de productos.",
    tips: [
      "Nombres de categorías cortos y descriptivos",
      "Mantén consistencia en la estructura de cartas similares",
      "Revisa stock antes de activar nuevas cartas",
      "Usa imágenes atractivas y de buena calidad",
      "Actualiza cartas según temporada o promociones"
    ],
    examples: [
      "Para bar: organizar por tipo de bebida (blancas, oscuras)",
      "Para cocina: organizar por momento del menú (entradas, platos)",
      "Mantén 5-8 categorías por carta para mejor navegación"
    ]
  }
];
