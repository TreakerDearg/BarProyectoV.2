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
import { getRecipes } from '../services';
import { getInventory } from '../../inventory/services/inventoryService';
import { getTechniques } from '../services/techniqueService';
import { getDecorations } from '../services/techniqueService';
import { getCollections } from '../services/collectionService';
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
  const [techniques, setTechniques] = useState<any[]>([]);
  const [decorations, setDecorations] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<StudioMode[]>(['dashboard']);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all recipes directly for Recipe Library
        const allRecipes = await getRecipes({ type: 'drink' });
        setRecipes(allRecipes);
        
        // Load inventory items for Builder
        const inventory = await getInventory();
        setInventoryItems(inventory);
        
        // Load techniques
        const techniquesData = await getTechniques();
        setTechniques(techniquesData);
        
        // Load decorations
        const decorationsData = await getDecorations();
        setDecorations(decorationsData);
        
        // Load collections
        const collectionsData = await getCollections();
        setCollections(collectionsData);
      } catch (error) {
        console.error('[NebulaRecipeStudio] Error loading data:', error);
        setRecipes([]);
        setInventoryItems([]);
        setTechniques([]);
        setDecorations([]);
        setCollections([]);
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

  const handleRecipeChange = async (updatedRecipe: Recipe) => {
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
            onNavigate={(section: string) => handleModeChange(section as StudioMode)}
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
              initialRecipe={selectedRecipe || { ingredients: [], product: { name: 'Nueva Receta', price: 0 }, category: '', type: 'drink', steps: [] } as any}
              onSave={handleRecipeChange}
              inventoryItems={inventoryItems}
              isNew={!selectedRecipe}
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
              {techniques.length > 0 ? (
                techniques.map((technique) => (
                  <TechniqueCard 
                    key={technique._id} 
                    technique={technique} 
                    isSelected={false} 
                    onSelect={() => {}} 
                  />
                ))
              ) : (
                <p className={styles.emptyText}>No hay técnicas disponibles</p>
              )}
            </div>
          )}

          {mode === 'decorations' && (
            <div className={styles.decorationsGrid}>
              {decorations.length > 0 ? (
                decorations.map((decoration) => (
                  <DecorationCard 
                    key={decoration._id} 
                    decoration={decoration} 
                  />
                ))
              ) : (
                <p className={styles.emptyText}>No hay decoraciones disponibles</p>
              )}
            </div>
          )}

          {mode === 'collections' && (
            <div className={styles.collectionsGrid}>
              {collections.length > 0 ? (
                collections.map((collection) => (
                  <div key={collection._id} className={styles.collectionCard}>
                    <span className={styles.collectionIcon}>{collection.icon}</span>
                    <h4 className={styles.collectionName}>{collection.name}</h4>
                    <p className={styles.collectionDescription}>{collection.description}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>No hay colecciones disponibles</p>
              )}
            </div>
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
  const { formulaIntelligence } = useRecipeStudio() as any;
  return <FormulaSuggestions suggestions={formulaIntelligence?.suggestions || []} />;
}
