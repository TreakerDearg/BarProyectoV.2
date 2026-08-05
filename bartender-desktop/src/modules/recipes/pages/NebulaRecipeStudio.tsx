"use client";

import { useState, useEffect } from 'react';
import { RecipeStudioProvider, useRecipeStudio } from '../contexts/RecipeStudioContext';
import { Dashboard } from '../components/dashboard';
import { StudioNavigation } from '../components/shared';
import { RecipeLibrary } from '../components/library';
import { RecipeBuilder } from '../components/builder';
import { VariantManager } from '../components/variants';
import { RecipeAnalyticsMini } from '../components/intelligence/RecipeAnalyticsMini';
import { RecipeTimeline } from '../components/intelligence/RecipeTimeline';
import { RecipeWarnings } from '../components/intelligence/RecipeWarnings';
import { FormulaSuggestions } from '../components/intelligence/FormulaSuggestions';
import { TechniqueCard } from '../components/builder/TechniqueCard';
import { DecorationCard } from '../components/builder/DecorationCard';
import { getDrinkProductsWithRecipes } from '../services';
import { getInventory } from '../../inventory/services/inventoryService';
import api from '../../../services/api';
import type { Recipe } from '../types';
import styles from './NebulaRecipeStudio.module.css';

type StudioMode = 'dashboard' | 'library' | 'builder' | 'studio' | 'variants' | 'techniques' | 'decorations' | 'collections' | 'analytics' | 'timeline' | 'versions' | 'warnings' | 'suggestions' | 'trash';

/**
 * NebulaRecipeStudio - Página principal del sistema de recetas
 * Reemplaza completamente al antiguo RecipesPage
 * Integra Library, Builder, Inspector y Preview en un entorno unificado
 */
export default function NebulaRecipeStudio() {
  const [mode, setMode] = useState<StudioMode>('dashboard');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<StudioMode[]>(['dashboard']);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar productos tipo drink con sus recetas y variantes
        let productsWithRecipes;
        try {
          productsWithRecipes = await getDrinkProductsWithRecipes({ available: true });
        } catch (endpointError) {
          // Fallback: usar el endpoint regular de recetas si el nuevo endpoint no existe
          console.warn('New endpoint not available, using fallback:', endpointError);
          const { getRecipes } = await import('../services');
          const allRecipes = await getRecipes();
          
          // Filtrar solo recetas tipo drink y disponibles
          const drinkRecipes = allRecipes.filter(r => 
            r.type === 'drink' && 
            r.product?.available !== false
          );
          
          setRecipes(drinkRecipes);
          setInventoryItems([]);
          setLoading(false);
          return;
        }
        
        // Extraer todas las recetas (primarias y variantes) de los productos
        const allRecipes: Recipe[] = [];
        productsWithRecipes.forEach(product => {
          if (product.primaryRecipe) {
            allRecipes.push(product.primaryRecipe);
          }
          if (product.variants && Array.isArray(product.variants)) {
            allRecipes.push(...product.variants);
          }
        });
        
        setRecipes(allRecipes);
        
        // Cargar items del inventario para el Builder
        const inventory = await getInventory();
        setInventoryItems(inventory);
      } catch (error) {
        console.error('Error loading data:', error);
        setRecipes([]);
        setInventoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setNavigationHistory([...navigationHistory, 'studio']);
    setMode('studio');
  };

  const handleRecipeEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setNavigationHistory([...navigationHistory, 'builder']);
    setMode('builder');
  };

  const handleRecipeChange = (updatedRecipe: Recipe) => {
    setSelectedRecipe(updatedRecipe);
  };

  const handleModeChange = (newMode: StudioMode) => {
    setNavigationHistory([...navigationHistory, newMode]);
    setMode(newMode);
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousMode = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setMode(previousMode);
    } else {
      setMode('dashboard');
      setNavigationHistory(['dashboard']);
    }
  };

  if (loading) {
    return <div className={styles.loadingScreen}>Cargando Nebula Recipe Studio...</div>;
  }

  return (
    <RecipeStudioProvider recipe={selectedRecipe || (recipes.length > 0 ? recipes[0] : { ingredients: [], product: { name: '' }, category: '' } as any)} inventoryItems={inventoryItems} allRecipes={recipes}>
      <div className={styles.nebulaRecipeStudio}>
        {mode === 'dashboard' && (
          <Dashboard
            recipes={recipes}
            collections={[]}
            onNavigate={handleModeChange}
          />
        )}
        
        {mode !== 'dashboard' && (
          <>
            <StudioNavigation 
              mode={mode} 
              onModeChange={handleModeChange} 
              navigationHistory={navigationHistory}
              onBack={handleBack}
            />
            
            <div className={styles.studioContent}>
              {mode === 'library' && (
                <RecipeLibrary 
                  recipes={recipes}
                  onRecipeSelect={handleRecipeSelect}
                  onRecipeEdit={handleRecipeEdit}
                  hideNavigator={true}
                />
              )}
          
          {mode === 'builder' && (
            <RecipeBuilder 
              recipe={selectedRecipe || { ingredients: [], product: { name: 'Nueva Receta', price: 0 }, category: '', type: 'drink', steps: [] } as any}
              onRecipeChange={handleRecipeChange}
              inventoryItems={inventoryItems}
            />
          )}

          {mode === 'variants' && (
            <VariantManager
              recipes={recipes}
              masterRecipeId={selectedRecipe?._id}
              onVariantSelect={(variant) => setSelectedRecipe(variant)}
              onCreateVariant={(variant) => {
                setRecipes([...recipes, variant as Recipe]);
                setSelectedRecipe(variant as Recipe);
              }}
              onCompare={(recipeA, recipeB) => {
                console.log('Comparing:', recipeA, recipeB);
              }}
            />
          )}

          {mode === 'analytics' && selectedRecipe && (
            <RecipeAnalyticsMini />
          )}

          {mode === 'timeline' && selectedRecipe && (
            <RecipeTimeline />
          )}

          {mode === 'warnings' && selectedRecipe && (
            <RecipeWarningsWrapper />
          )}

          {mode === 'suggestions' && selectedRecipe && (
            <FormulaSuggestionsWrapper />
          )}

          {mode === 'techniques' && (
            <div className={styles.techniquesGrid}>
              <TechniqueCard technique={{ name: 'Shake', description: 'Shake technique', category: 'shake', difficulty: 'easy', time: 30 }} isSelected={false} onSelect={() => {}} />
              <TechniqueCard technique={{ name: 'Stir', description: 'Stir technique', category: 'stir', difficulty: 'easy', time: 20 }} isSelected={false} onSelect={() => {}} />
              <TechniqueCard technique={{ name: 'Muddle', description: 'Muddle technique', category: 'muddle', difficulty: 'medium', time: 15 }} isSelected={false} onSelect={() => {}} />
            </div>
          )}

          {mode === 'decorations' && (
            <div className={styles.decorationsGrid}>
              <DecorationCard decoration={{ name: 'Lemon Twist', type: 'garnish', cost: 0.1 }} />
              <DecorationCard decoration={{ name: 'Mint Sprig', type: 'garnish', cost: 0.15 }} />
              <DecorationCard decoration={{ name: 'Cherry', type: 'garnish', cost: 0.2 }} />
            </div>
          )}

          {mode === 'collections' && (
            <div>Collections view - to be implemented</div>
          )}

          {mode === 'versions' && selectedRecipe && (
            <div>Versions view - to be implemented</div>
          )}

          {mode === 'trash' && (
            <div>Trash view - to be implemented</div>
          )}
            </div>
          </>
        )}
      </div>
    </RecipeStudioProvider>
  );
}

function RecipeWarningsWrapper() {
  const { warnings } = useRecipeStudio();
  return <RecipeWarnings warnings={warnings} />;
}

function FormulaSuggestionsWrapper() {
  const { formulaIntelligence } = useRecipeStudio();
  return <FormulaSuggestions suggestions={formulaIntelligence.suggestions} />;
}
