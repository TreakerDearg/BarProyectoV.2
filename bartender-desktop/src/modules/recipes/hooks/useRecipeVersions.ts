import { useMemo } from 'react';
import type { Recipe, RecipeVersion, RecipeHistoryItem } from '../types';

interface UseRecipeVersionsProps {
  recipe: Recipe;
}

interface RecipeVersionsData {
  currentVersion: RecipeVersion | null;
  versionHistory: RecipeVersion[];
  history: RecipeHistoryItem[];
  createVersion: (changes: string[], notes?: string) => RecipeVersion;
}

/**
 * Hook para gestión de versiones de recetas
 * Prepara la arquitectura para versionado completo
 */
export function useRecipeVersions({ recipe }: UseRecipeVersionsProps): RecipeVersionsData {
  return useMemo(() => {
    const currentVersion = recipe.currentVersion || null;
    const versionHistory = recipe.versionHistory || [];
    
    // Generar historial simulado basado en versiones
    const history: RecipeHistoryItem[] = versionHistory.map((version, index) => ({
      id: `hist-${version.version}-${index}`,
      date: version.date,
      action: `Versión ${version.version} creada`,
      author: version.author,
      details: version.changes.join(', '),
      recipeId: recipe._id || '',
      variantId: version.variantId,
    }));

    const createVersion = (changes: string[], notes?: string): RecipeVersion => {
      const newVersionNumber = getNextVersionNumber(versionHistory);
      const newVersion: RecipeVersion = {
        version: newVersionNumber,
        date: new Date().toISOString(),
        author: recipe.author || 'Sistema',
        changes,
        notes,
        variantId: recipe.parentId,
      };
      return newVersion;
    };

    return {
      currentVersion,
      versionHistory,
      history,
      createVersion,
    };
  }, [recipe]);
}

function getNextVersionNumber(history: RecipeVersion[]): string {
  if (history.length === 0) return '1.0';
  
  const lastVersion = history[history.length - 1];
  const [major, minor] = lastVersion.version.split('.').map(Number);
  
  // Si hay cambios significativos, incrementar major
  // Si son cambios menores, incrementar minor
  return `${major}.${minor + 1}`;
}
