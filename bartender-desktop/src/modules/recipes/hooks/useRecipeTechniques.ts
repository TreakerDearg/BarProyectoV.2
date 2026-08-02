import { useMemo } from 'react';
import type { Technique, Decoration } from '../types';

interface UseRecipeTechniquesProps {
  techniques?: Technique[];
  decorations?: Decoration[];
}

interface RecipeTechniquesData {
  techniques: Technique[];
  decorations: Decoration[];
  getTechniqueById: (id: string) => Technique | undefined;
  getDecorationById: (id: string) => Decoration | undefined;
  getTechniquesByCategory: (category: Technique['category']) => Technique[];
  getDecorationsByType: (type: Decoration['type']) => Decoration[];
}

/**
 * Hook para gestión de técnicas y decoraciones reutilizables
 * Bibliotecas independientes que las recetas referencian
 */
export function useRecipeTechniques({
  techniques = defaultTechniques,
  decorations = defaultDecorations,
}: UseRecipeTechniquesProps): RecipeTechniquesData {
  const techniqueMap = useMemo(
    () => new Map(techniques.map((t) => [t._id || t.name, t])),
    [techniques]
  );

  const decorationMap = useMemo(
    () => new Map(decorations.map((d) => [d._id || d.name, d])),
    [decorations]
  );

  const getTechniqueById = (id: string): Technique | undefined => {
    return techniqueMap.get(id);
  };

  const getDecorationById = (id: string): Decoration | undefined => {
    return decorationMap.get(id);
  };

  const getTechniquesByCategory = (category: Technique['category']): Technique[] => {
    return techniques.filter((t) => t.category === category);
  };

  const getDecorationsByType = (type: Decoration['type']): Decoration[] => {
    return decorations.filter((d) => d.type === type);
  };

  return {
    techniques,
    decorations,
    getTechniqueById,
    getDecorationById,
    getTechniquesByCategory,
    getDecorationsByType,
  };
}

// Técnicas por defecto (pueden venir del backend en el futuro)
const defaultTechniques: Technique[] = [
  {
    _id: 'shake',
    name: 'Shake',
    description: 'Agitar en shaker con hielo',
    category: 'shake',
    icon: '🥤',
    instructions: 'Colocar ingredientes en shaker con hielo, agitar vigorosamente por 10-15 segundos, colar.',
    equipment: ['Shaker', 'Hielo', 'Colador'],
    difficulty: 'easy',
    time: 30,
  },
  {
    _id: 'stir',
    name: 'Stir',
    description: 'Revolver en vaso con hielo',
    category: 'stir',
    icon: '🥄',
    instructions: 'Colocar ingredientes en vaso con hielo, revolver suavemente con cuchara de bar.',
    equipment: ['Vaso', 'Hielo', 'Cuchara de bar'],
    difficulty: 'easy',
    time: 20,
  },
  {
    _id: 'build',
    name: 'Build',
    description: 'Construir directamente en vaso',
    category: 'build',
    icon: '🏗️',
    instructions: 'Verter ingredientes directamente en vaso, mezclar suavemente.',
    equipment: ['Vaso'],
    difficulty: 'easy',
    time: 15,
  },
  {
    _id: 'blend',
    name: 'Blend',
    description: 'Licuar con hielo',
    category: 'blend',
    icon: '🌀',
    instructions: 'Colocar ingredientes en licuadora con hielo, licuar hasta obtener consistencia suave.',
    equipment: ['Licuadora', 'Hielo'],
    difficulty: 'medium',
    time: 45,
  },
  {
    _id: 'smoke',
    name: 'Smoke',
    description: 'Ahumar con madera o hierbas',
    category: 'smoke',
    icon: '💨',
    instructions: 'Ahumar el vaso con madera o hierbas antes de verter el cóctel.',
    equipment: ['Pistola de humo', 'Madera', 'Hierbas'],
    difficulty: 'hard',
    time: 60,
  },
  {
    _id: 'layer',
    name: 'Layer',
    description: 'Capas de diferentes densidades',
    category: 'layer',
    icon: '📚',
    instructions: 'Verter ingredientes lentamente sobre cuchara para crear capas de diferentes densidades.',
    equipment: ['Vaso', 'Cuchara de bar'],
    difficulty: 'hard',
    time: 90,
  },
  {
    _id: 'roll',
    name: 'Roll',
    description: 'Roll entre dos vasos',
    category: 'roll',
    icon: '🔄',
    instructions: 'Verter entre dos vasos para mezclar sin diluir demasiado.',
    equipment: ['Dos vasos'],
    difficulty: 'medium',
    time: 25,
  },
  {
    _id: 'muddle',
    name: 'Muddle',
    description: 'Macerar ingredientes',
    category: 'muddle',
    icon: '🔨',
    instructions: 'Aplastar ingredientes (frutas, hierbas) con muddler para extraer sabores.',
    equipment: ['Muddler', 'Vaso'],
    difficulty: 'easy',
    time: 20,
  },
  {
    _id: 'strain',
    name: 'Strain',
    description: 'Colar para separar hielo',
    category: 'strain',
    icon: '🚿',
    instructions: 'Colar cóctel para separar hielo y ingredientes sólidos.',
    equipment: ['Colador'],
    difficulty: 'easy',
    time: 10,
  },
];

// Decoraciones por defecto (pueden venir del backend en el futuro)
const defaultDecorations: Decoration[] = [
  {
    _id: 'lemon-twist',
    name: 'Twist de Limón',
    type: 'garnish',
    description: 'Cáscara de limón en espiral',
    icon: '🍋',
    category: 'cítricos',
    cost: 0.05,
  },
  {
    _id: 'orange-slice',
    name: 'Rodaja de Naranja',
    type: 'garnish',
    description: 'Rodaja de naranja fresca',
    icon: '🍊',
    category: 'frutas',
    cost: 0.08,
  },
  {
    _id: 'cherry',
    name: 'Cereza',
    type: 'garnish',
    description: 'Cereza marrasquino',
    icon: '🍒',
    category: 'frutas',
    cost: 0.10,
  },
  {
    _id: 'mint-sprig',
    name: 'Rama de Menta',
    type: 'garnish',
    description: 'Hojas de menta fresca',
    icon: '🌿',
    category: 'hierbas',
    cost: 0.03,
  },
  {
    _id: 'martini-glass',
    name: 'Copa Martini',
    type: 'glassware',
    description: 'Copa triangular clásica',
    icon: '🍸',
    category: 'cristalería',
    cost: 0,
  },
  {
    _id: 'old-fashioned-glass',
    name: 'Vaso Old Fashioned',
    type: 'glassware',
    description: 'Vaso corto y ancho',
    icon: '🥃',
    category: 'cristalería',
    cost: 0,
  },
  {
    _id: 'highball-glass',
    name: 'Vaso Highball',
    type: 'glassware',
    description: 'Vaso alto y estrecho',
    icon: '🥤',
    category: 'cristalería',
    cost: 0,
  },
  {
    _id: 'crushed-ice',
    name: 'Hielo Picado',
    type: 'ice',
    description: 'Hielo en trozos pequeños',
    icon: '🧊',
    category: 'hielo',
    cost: 0.02,
  },
  {
    _id: 'large-cube',
    name: 'Cubo Grande',
    type: 'ice',
    description: 'Cubo de hielo grande',
    icon: '🧊',
    category: 'hielo',
    cost: 0.03,
  },
  {
    _id: 'smoke-gun',
    name: 'Pistola de Humo',
    type: 'aroma',
    description: 'Aroma ahumado',
    icon: '💨',
    category: 'aroma',
    cost: 0,
  },
];
