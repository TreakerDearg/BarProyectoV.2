import { useMemo } from 'react';
import { useRecipeTimeline } from './useRecipeQueries';
import type { Recipe, RecipeRelation, RecipeVariant, RecipeTree, RecipeVersion, RecipeHistoryItem } from '../types';

interface UseRecipeMetadataProps {
  recipe: Recipe;
  allRecipes: Recipe[];
}

interface RecipeMetadataData {
  // Relations
  relations: RecipeRelation[];
  
  // Variants
  masterRecipes: Recipe[];
  variantsByMaster: Map<string, RecipeVariant[]>;
  recipeTree: RecipeTree | null;
  allVariants: RecipeVariant[];
  
  // Versions
  currentVersion: RecipeVersion | null;
  versionHistory: RecipeVersion[];
  history: RecipeHistoryItem[];
  
  // Timeline (from backend)
  timeline: any[];
  timelineLoading: boolean;
}

/**
 * Hook consolidado para metadatos de recetas
 * Combina Relations, Variants, Versions y Timeline
 * Usa datos del backend cuando están disponibles, fallback a cálculos locales
 */
export function useRecipeMetadata({ recipe, allRecipes }: UseRecipeMetadataProps): RecipeMetadataData {
  // Timeline del backend
  const { data: timeline, isLoading: timelineLoading } = useRecipeTimeline(recipe._id || '');

  // Relations (cálculo local hasta que se implemente en backend)
  const relations = useMemo(() => {
    const relations: RecipeRelation[] = [];

    // Variantes
    allRecipes.forEach(otherRecipe => {
      if (otherRecipe._id === recipe._id) return;
      
      if (otherRecipe.parentId === recipe._id) {
        relations.push({
          recipeId: otherRecipe._id || '',
          recipeName: otherRecipe.product?.name || 'Sin nombre',
          relationType: 'variant',
          similarity: 100,
        });
      }
      
      if (recipe.parentId === otherRecipe._id) {
        relations.push({
          recipeId: otherRecipe._id || '',
          recipeName: otherRecipe.product?.name || 'Sin nombre',
          relationType: 'variant',
          similarity: 100,
        });
      }
    });

    // Recetas similares por ingredientes
    allRecipes.forEach(otherRecipe => {
      if (otherRecipe._id === recipe._id) return;
      
      const commonIngredients = recipe.ingredients.filter(ing => 
        otherRecipe.ingredients.some(otherIng => 
          otherIng.inventoryItem._id === ing.inventoryItem._id
        )
      );
      
      if (commonIngredients.length >= 2) {
        const similarity = (commonIngredients.length / Math.max(recipe.ingredients.length, otherRecipe.ingredients.length)) * 100;
        
        if (similarity >= 30) {
          relations.push({
            recipeId: otherRecipe._id || '',
            recipeName: otherRecipe.product?.name || 'Sin nombre',
            relationType: 'ingredient',
            similarity: Math.round(similarity),
          });
        }
      }
    });

    // Recetas similares por técnica
    if (recipe.method) {
      allRecipes.forEach(otherRecipe => {
        if (otherRecipe._id === recipe._id) return;
        
        if (otherRecipe.method === recipe.method) {
          relations.push({
            recipeId: otherRecipe._id || '',
            recipeName: otherRecipe.product?.name || 'Sin nombre',
            relationType: 'technique',
            similarity: 60,
          });
        }
      });
    }

    // Recetas de la misma familia (categoría)
    allRecipes.forEach(otherRecipe => {
      if (otherRecipe._id === recipe._id) return;
      
      if (otherRecipe.category === recipe.category && otherRecipe.type === recipe.type) {
        const existingRelation = relations.find(r => r.recipeId === otherRecipe._id);
        if (!existingRelation) {
          relations.push({
            recipeId: otherRecipe._id || '',
            recipeName: otherRecipe.product?.name || 'Sin nombre',
            relationType: 'family',
            similarity: 40,
          });
        }
      }
    });

    // Ordenar por similitud
    return relations.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  }, [recipe, allRecipes]);

  // Variants (cálculo local hasta que se implemente endpoint completo)
  const variantsData = useMemo(() => {
    // Identificar recetas base (isPrimary = true o sin parentId)
    const masterRecipes = allRecipes.filter((r) => r.isPrimary || !r.parentId);

    // Agrupar variantes por receta base
    const variantsByMaster = new Map<string, RecipeVariant[]>();
    const allVariants: RecipeVariant[] = [];

    for (const r of allRecipes) {
      if (r.parentId && !r.isPrimary) {
        const variant: RecipeVariant = {
          _id: r._id || '',
          variantName: r.variantName || 'Variante',
          isPrimary: r.isPrimary || false,
          parentId: r.parentId,
          recipe: r,
        };

        allVariants.push(variant);

        const parentId = r.parentId;
        if (!variantsByMaster.has(parentId)) {
          variantsByMaster.set(parentId, []);
        }
        variantsByMaster.get(parentId)!.push(variant);
      }
    }

    // Construir árbol de recetas para la receta actual
    let recipeTree: RecipeTree | null = null;
    const master = masterRecipes.find((r) => r._id === recipe._id);
    if (master) {
      const variants = variantsByMaster.get(recipe._id || '') || [];
      recipeTree = {
        master,
        variants,
        depth: calculateTreeDepth(master, variants, variantsByMaster),
      };
    }

    return {
      masterRecipes,
      variantsByMaster,
      recipeTree,
      allVariants,
    };
  }, [recipe, allRecipes]);

  // Versions (cálculo local hasta que se implemente en backend)
  const versionsData = useMemo(() => {
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

    return {
      currentVersion,
      versionHistory,
      history,
    };
  }, [recipe]);

  return {
    relations,
    ...variantsData,
    ...versionsData,
    timeline: timeline || [],
    timelineLoading,
  };
}

function calculateTreeDepth(
  _master: Recipe,
  variants: RecipeVariant[],
  variantsByMaster: Map<string, RecipeVariant[]>
): number {
  if (variants.length === 0) return 1;

  let maxDepth = 1;
  for (const variant of variants) {
    const childVariants = variantsByMaster.get(variant._id) || [];
    const childDepth = calculateTreeDepth(variant.recipe, childVariants, variantsByMaster);
    maxDepth = Math.max(maxDepth, childDepth + 1);
  }

  return maxDepth;
}
