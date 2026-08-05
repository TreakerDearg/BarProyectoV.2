import { useMemo } from 'react';
import type { Technique, Decoration } from '../types/technique';
import { useTechniques } from './techniqueQueries';
import { useDecorations } from './decorationQueries';

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
 * Ahora carga datos desde el backend usando TanStack Query
 * Los arrays hardcodeados han sido eliminados
 */
export function useRecipeTechniques({
  techniques: propTechniques,
  decorations: propDecorations,
}: UseRecipeTechniquesProps): RecipeTechniquesData {
  // Cargar técnicas desde backend si no se proporcionan por props
  const { data: backendTechniques = [] } = useTechniques();
  const techniques = propTechniques || backendTechniques;

  // Cargar decoraciones desde backend si no se proporcionan por props
  const { data: backendDecorations = [] } = useDecorationsQuery();
  const decorations = propDecorations || backendDecorations;

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
