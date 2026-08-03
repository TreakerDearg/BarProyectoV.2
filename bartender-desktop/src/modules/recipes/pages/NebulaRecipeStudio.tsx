"use client";

import { useState, useEffect } from "react";
import type { Recipe } from "../types";
import { getRecipes } from "../services/recipeService";
import { RecipeLibrary } from "../components/library/RecipeLibrary";
import { RecipeBuilder } from "../components/builder/RecipeBuilder";
import { Inspector2_0 } from "../components/inspector/Inspector2.0";
import { RecipePreview } from "../components/preview/RecipePreview";
import { RecipeStudioProvider, useRecipeStudio } from "../contexts/RecipeStudioContext";
import { VariantBuilder } from "../components/builder/VariantBuilder";
import { RecipeTimeline } from "../components/intelligence/RecipeTimeline";
import { RecipeAnalyticsMini } from "../components/intelligence/RecipeAnalyticsMini";
import { RecipeWarnings } from "../components/intelligence/RecipeWarnings";
import { FormulaSuggestions } from "../components/intelligence/FormulaSuggestions";
import { TechniqueCard } from "../components/builder/TechniqueCard";
import { DecorationCard } from "../components/builder/DecorationCard";

type StudioMode = 'library' | 'builder' | 'studio' | 'variants' | 'techniques' | 'decorations' | 'collections' | 'analytics' | 'timeline' | 'versions' | 'warnings' | 'suggestions' | 'trash';

/**
 * NebulaRecipeStudio - Página principal del sistema de recetas
 * Reemplaza completamente al antiguo RecipesPage
 * Integra Library, Builder, Inspector y Preview en un entorno unificado
 */
export default function NebulaRecipeStudio() {
  const [mode, setMode] = useState<StudioMode>('library');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<StudioMode[]>(['library']);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
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
      setMode('library');
      setNavigationHistory(['library']);
    }
  };

  if (loading) {
    return <div className="loading-screen">Cargando Nebula Recipe Studio...</div>;
  }

  return (
    <RecipeStudioProvider recipe={selectedRecipe || recipes[0]} inventoryItems={[]} allRecipes={recipes}>
      <div className="nebula-recipe-studio">
        <StudioHeader mode={mode} onModeChange={handleModeChange} navigationHistory={navigationHistory} />
        
        <div className="studio-content">
          {mode === 'library' && (
            <RecipeLibrary 
              recipes={recipes}
              onRecipeSelect={handleRecipeSelect}
              onRecipeEdit={handleRecipeEdit}
            />
          )}
          
          {mode === 'builder' && selectedRecipe && (
            <div className="builder-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <RecipeBuilder 
                recipe={selectedRecipe}
                onRecipeChange={handleRecipeChange}
                inventoryItems={[]}
              />
            </div>
          )}
          
          {mode === 'studio' && selectedRecipe && (
            <RecipeStudioView 
              recipe={selectedRecipe}
              onBack={() => setMode('library')}
              onEdit={() => setMode('builder')}
            />
          )}

          {mode === 'variants' && selectedRecipe && (
            <div className="variants-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <VariantBuilder 
                variant={selectedRecipe}
                masterRecipe={selectedRecipe}
                onVariantChange={handleRecipeChange}
              />
            </div>
          )}

          {mode === 'analytics' && selectedRecipe && (
            <div className="analytics-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <RecipeAnalyticsMini />
            </div>
          )}

          {mode === 'timeline' && selectedRecipe && (
            <div className="timeline-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <RecipeTimeline />
            </div>
          )}

          {mode === 'warnings' && selectedRecipe && (
            <div className="warnings-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <RecipeWarningsWrapper />
            </div>
          )}

          {mode === 'suggestions' && selectedRecipe && (
            <div className="suggestions-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <FormulaSuggestionsWrapper />
            </div>
          )}

          {mode === 'techniques' && (
            <div className="techniques-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <div className="techniques-grid">
                <TechniqueCard technique={{ name: 'Shake', description: 'Shake technique', category: 'shake', difficulty: 'easy', time: 30 }} isSelected={false} onSelect={() => {}} />
                <TechniqueCard technique={{ name: 'Stir', description: 'Stir technique', category: 'stir', difficulty: 'easy', time: 20 }} isSelected={false} onSelect={() => {}} />
                <TechniqueCard technique={{ name: 'Muddle', description: 'Muddle technique', category: 'muddle', difficulty: 'medium', time: 15 }} isSelected={false} onSelect={() => {}} />
              </div>
            </div>
          )}

          {mode === 'decorations' && (
            <div className="decorations-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <div className="decorations-grid">
                <DecorationCard decoration={{ name: 'Lemon Twist', type: 'garnish', category: 'Citrus', cost: 0.5 }} isSelected={false} onSelect={() => {}} />
                <DecorationCard decoration={{ name: 'Cherry', type: 'garnish', category: 'Fruit', cost: 0.3 }} isSelected={false} onSelect={() => {}} />
                <DecorationCard decoration={{ name: 'Mint Sprig', type: 'garnish', category: 'Herb', cost: 0.4 }} isSelected={false} onSelect={() => {}} />
              </div>
            </div>
          )}

          {mode === 'collections' && (
            <div className="collections-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <div className="collections-placeholder">
                <h2>Collections</h2>
                <p>Colecciones de recetas organizadas por categorías, estaciones o menús.</p>
              </div>
            </div>
          )}

          {mode === 'trash' && (
            <div className="trash-wrapper">
              <button onClick={() => setMode('library')} className="back-btn">← Volver a Library</button>
              <div className="trash-placeholder">
                <h2>Papelera</h2>
                <p>Recetas eliminadas que pueden ser restauradas.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </RecipeStudioProvider>
  );
}

function StudioHeader({ mode, onModeChange, navigationHistory }: { mode: StudioMode; onModeChange: (mode: StudioMode) => void; navigationHistory: StudioMode[] }) {
  const navItems = [
    { id: 'library' as StudioMode, icon: '📚', label: 'Library' },
    { id: 'builder' as StudioMode, icon: '🛠️', label: 'Builder' },
    { id: 'studio' as StudioMode, icon: '🎬', label: 'Studio' },
    { id: 'variants' as StudioMode, icon: '🔀', label: 'Variants' },
    { id: 'techniques' as StudioMode, icon: '🎨', label: 'Techniques' },
    { id: 'decorations' as StudioMode, icon: '✨', label: 'Decorations' },
    { id: 'collections' as StudioMode, icon: '📁', label: 'Collections' },
    { id: 'analytics' as StudioMode, icon: '📊', label: 'Analytics' },
    { id: 'timeline' as StudioMode, icon: '📅', label: 'Timeline' },
    { id: 'warnings' as StudioMode, icon: '⚠️', label: 'Warnings' },
    { id: 'suggestions' as StudioMode, icon: '💡', label: 'Suggestions' },
    { id: 'trash' as StudioMode, icon: '🗑️', label: 'Trash' },
  ];

  const getLabelForMode = (m: StudioMode) => {
    return navItems.find(item => item.id === m)?.label || m;
  };

  return (
    <div className="studio-header">
      <h1 className="studio-title">Nebula Recipe Studio</h1>
      
      {/* Breadcrumbs */}
      <div className="studio-breadcrumbs">
        {navigationHistory.map((historyMode, index) => (
          <span key={`${historyMode}-${index}`} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">/</span>}
            <button
              className={`breadcrumb-link ${index === navigationHistory.length - 1 ? 'active' : ''}`}
              onClick={() => onModeChange(historyMode)}
            >
              {getLabelForMode(historyMode)}
            </button>
          </span>
        ))}
      </div>

      <div className="studio-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-btn ${mode === item.id ? 'active' : ''}`}
            onClick={() => onModeChange(item.id)}
            title={item.label}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeStudioView({ recipe, onBack, onEdit }: { recipe: Recipe; onBack: () => void; onEdit: () => void }) {
  const [showInspector, setShowInspector] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="recipe-studio-view">
      <div className="studio-toolbar">
        <button onClick={onBack} className="toolbar-btn">← Back</button>
        <button onClick={onEdit} className="toolbar-btn primary">Edit Recipe</button>
        <button 
          onClick={() => setShowInspector(!showInspector)} 
          className={`toolbar-btn ${showInspector ? 'active' : ''}`}
        >
          Inspector
        </button>
        <button 
          onClick={() => setShowPreview(!showPreview)} 
          className={`toolbar-btn ${showPreview ? 'active' : ''}`}
        >
          Preview
        </button>
      </div>

      <div className="studio-layout">
        <div className="studio-main">
          <div className="recipe-info">
            <h2>{recipe.product?.name}</h2>
            <p>{recipe.category}</p>
          </div>
        </div>

        {showInspector && (
          <div className="studio-inspector">
            <Inspector2_0 />
          </div>
        )}

        {showPreview && (
          <div className="studio-preview">
            <RecipePreview />
          </div>
        )}
      </div>
    </div>
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
