import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode } from 'react';
import type { Recipe, RecipeIngredient, RecipeStep } from '../types';
import { useRecipeCost } from '../hooks/useRecipeCost';
import { useRecipeAvailability } from '../hooks/useRecipeAvailability';
import { useRecipeInheritance } from '../hooks/useRecipeInheritance';
import { useRecipeHealthScore } from '../hooks/useRecipeHealthScore';
import { useRecipeMargin } from '../hooks/useRecipeMargin';
import { createRecipe, updateRecipe } from '../services/recipeService';

/* =========================================================
   TYPES
========================================================= */
interface RecipeWorkspaceContextValue {
  // Core data
  recipe: Recipe;
  inventoryItems: any[];
  masterRecipe?: Recipe;
  
  // UI state
  activeTab: 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections';
  zoom: number;
  isSaving: boolean;
  saveError: string | null;
  
  // Calculated data
  totalCost: number;
  ingredientCosts: Map<string, number>;
  ingredientPercentages: Map<string, number>;
  isAvailable: boolean;
  missingIngredients: any[];
  availableIngredients: any[];
  inheritedFields: any[];
  overriddenFields: any[];
  healthScore: any;
  margin: {
    margin: number;
    marginPercentage: number;
    isProfitable: boolean;
    suggestedPrice: number;
  };
  
  // Actions
  setRecipe: (recipe: Recipe) => void;
  setActiveTab: (tab: 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections') => void;
  setZoom: (zoom: number) => void;
  
  // Recipe operations
  handleIngredientAdd: (ingredient: RecipeIngredient) => void;
  handleIngredientUpdate: (index: number, ingredient: RecipeIngredient) => void;
  handleIngredientRemove: (index: number) => void;
  handleStepAdd: (step: RecipeStep) => void;
  handleStepUpdate: (index: number, step: RecipeStep) => void;
  handleStepRemove: (index: number) => void;
  handleStepReorder: (fromIndex: number, toIndex: number) => void;
  handleSave: () => Promise<void>;
  
  // Recipe field updates
  updateRecipeField: (field: keyof Recipe, value: any) => void;
}

const RecipeWorkspaceContext = createContext<RecipeWorkspaceContextValue | undefined>(undefined);

interface RecipeWorkspaceProviderProps {
  children: ReactNode;
  initialRecipe: Recipe;
  inventoryItems: any[];
  masterRecipe?: Recipe;
  onSave?: (recipe: Recipe) => Promise<void>;
  isNew?: boolean;
}

/* =========================================================
   PROVIDER
========================================================= */
export function RecipeWorkspaceProvider({ 
  children, 
  initialRecipe, 
  inventoryItems, 
  masterRecipe,
  onSave,
  isNew = false 
}: RecipeWorkspaceProviderProps) {
  // Core state
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections'>('ingredients');
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Autosave with debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRecipeRef = useRef<Recipe>(initialRecipe);

  useEffect(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Skip if recipe hasn't changed
    if (JSON.stringify(recipe) === JSON.stringify(lastSavedRecipeRef.current)) {
      return;
    }

    // Set new timeout for autosave (2 seconds)
    saveTimeoutRef.current = setTimeout(async () => {
      if (onSave) {
        setIsSaving(true);
        setSaveError(null);
        try {
          await onSave(recipe);
          lastSavedRecipeRef.current = recipe;
        } catch (error) {
          setSaveError(error instanceof Error ? error.message : 'Error al guardar');
        } finally {
          setIsSaving(false);
        }
      }
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [recipe, onSave]);

  // Calculated data using hooks
  const { totalCost, ingredientCosts, ingredientPercentages } = useRecipeCost({ 
    ingredients: recipe.ingredients || [], 
    inventoryItems 
  });
  
  const { isAvailable, missingIngredients, availableIngredients } = useRecipeAvailability({ 
    ingredients: recipe.ingredients || [], 
    inventoryItems 
  });
  
  const healthScore = useRecipeHealthScore({ 
    recipe, 
    inventoryItems 
  });
  
  const margin = useRecipeMargin(recipe, totalCost);
  
  const inheritanceResult = masterRecipe && recipe
    ? useRecipeInheritance({ variant: recipe, masterRecipe })
    : { inheritedFields: [], overriddenFields: [] };
  const { inheritedFields, overriddenFields } = inheritanceResult;

  // Recipe operations
  const handleIngredientAdd = useCallback((ingredient: RecipeIngredient) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), ingredient],
    }));
  }, []);

  const handleIngredientUpdate = useCallback((index: number, updatedIngredient: RecipeIngredient) => {
    setRecipe(prev => {
      const updatedIngredients = [...(prev.ingredients || [])];
      updatedIngredients[index] = updatedIngredient;
      return { ...prev, ingredients: updatedIngredients };
    });
  }, []);

  const handleIngredientRemove = useCallback((index: number) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleStepAdd = useCallback((step: RecipeStep) => {
    setRecipe(prev => ({
      ...prev,
      steps: [...(prev.steps || []), step],
    }));
  }, []);

  const handleStepUpdate = useCallback((index: number, updatedStep: RecipeStep) => {
    setRecipe(prev => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps[index] = updatedStep;
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const handleStepRemove = useCallback((index: number) => {
    setRecipe(prev => ({
      ...prev,
      steps: (prev.steps || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleStepReorder = useCallback((fromIndex: number, toIndex: number) => {
    setRecipe(prev => {
      const updatedSteps = [...(prev.steps || [])];
      const [movedStep] = updatedSteps.splice(fromIndex, 1);
      updatedSteps.splice(toIndex, 0, movedStep);
      return { ...prev, steps: updatedSteps };
    });
  }, []);

  const updateRecipeField = useCallback((field: keyof Recipe, value: any) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSetActiveTab = useCallback((tab: 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections') => {
    setActiveTab(tab);
  }, []);

  const handleSetZoom = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Validar que la receta tenga los campos requeridos
      if (!recipe.product || (typeof recipe.product !== 'string' && !recipe.product._id)) {
        throw new Error('La receta debe estar asociada a un producto');
      }

      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        throw new Error('La receta debe tener al menos un ingrediente');
      }

      if (!recipe.type) {
        throw new Error('La receta debe tener un tipo (drink/food)');
      }

      // Validar que todos los ingredientes tengan inventoryItem válido
      const invalidIngredients = recipe.ingredients.filter(ing => !ing.inventoryItem || (typeof ing.inventoryItem !== 'string' && !ing.inventoryItem._id));
      if (invalidIngredients.length > 0) {
        throw new Error('Todos los ingredientes deben estar asociados a items del inventario');
      }

      // Si se proporcionó un callback onSave personalizado, usarlo
      if (onSave) {
        await onSave(recipe);
      } else {
        // Guardado automático usando recipeService
        if (isNew || !recipe._id) {
          const savedRecipe = await createRecipe(recipe);
          setRecipe(savedRecipe);
        } else {
          const updatedRecipe = await updateRecipe(recipe._id, recipe);
          setRecipe(updatedRecipe);
        }
      }
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      setSaveError(error.message || 'Error al guardar la receta');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [recipe, onSave, isNew]);

  // Expose setRecipe for external updates
  const setRecipeExternal = useCallback((newRecipe: Recipe) => {
    setRecipe(newRecipe);
  }, []);

  const value = useMemo<RecipeWorkspaceContextValue>(() => ({
    // Core data
    recipe,
    inventoryItems,
    masterRecipe,
    
    // UI state
    activeTab,
    zoom,
    isSaving,
    saveError,
    
    // Calculated data
    totalCost,
    ingredientCosts,
    ingredientPercentages,
    isAvailable,
    missingIngredients,
    availableIngredients,
    inheritedFields,
    overriddenFields,
    healthScore,
    margin,
    
    // Actions
    setRecipe: setRecipeExternal,
    setActiveTab: handleSetActiveTab,
    setZoom: handleSetZoom,
    handleIngredientAdd,
    handleIngredientUpdate,
    handleIngredientRemove,
    handleStepAdd,
    handleStepUpdate,
    handleStepRemove,
    handleStepReorder,
    handleSave,
    updateRecipeField,
  }), [
    recipe,
    inventoryItems,
    masterRecipe,
    activeTab,
    zoom,
    isSaving,
    saveError,
    totalCost,
    ingredientCosts,
    ingredientPercentages,
    isAvailable,
    missingIngredients,
    availableIngredients,
    inheritedFields,
    overriddenFields,
    healthScore,
    margin,
    setRecipeExternal,
    handleSetActiveTab,
    handleSetZoom,
    handleIngredientAdd,
    handleIngredientUpdate,
    handleIngredientRemove,
    handleStepAdd,
    handleStepUpdate,
    handleStepRemove,
    handleStepReorder,
    handleSave,
    updateRecipeField,
  ]);

  return (
    <RecipeWorkspaceContext.Provider value={value}>
      {children}
    </RecipeWorkspaceContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */
export function useRecipeWorkspace() {
  const context = useContext(RecipeWorkspaceContext);
  if (!context) {
    throw new Error('useRecipeWorkspace must be used within RecipeWorkspaceProvider');
  }
  return context;
}
