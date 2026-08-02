import { useState } from 'react';
import type { Recipe, RecipeVariant } from '../../types';
import { RecipeHeader } from './RecipeHeader';
import { RecipeSidebar } from './RecipeSidebar';
import { RecipeInfoPanel } from './RecipeInfoPanel';
import { RecipeIngredientsPanel } from './RecipeIngredientsPanel';
import { RecipePreparationPanel } from './RecipePreparationPanel';
import { RecipeCostsPanel } from './RecipeCostsPanel';
import { RecipePreviewPanel } from './RecipePreviewPanel';
import { RecipeTree } from './RecipeTree';
import { RecipeVariantPanel } from './RecipeVariantPanel';
import { useInventoryIntegration } from '../../hooks';

interface RecipeWorkspaceProps {
  recipe: Recipe;
  inventoryItems?: Array<{ _id?: string; name: string; stock: number; cost: number; unit: string }>;
  onEdit?: () => void;
  onDelete?: () => void;
  onVariantSelect?: (variant: RecipeVariant) => void;
  onInheritanceChange?: (settings: any) => void;
  onCreateVariant?: (variant: Partial<Recipe>) => void;
}

type WorkspaceSection = 'info' | 'ingredients' | 'preparation' | 'costs' | 'preview' | 'variants' | 'tree';

/**
 * RecipeWorkspace - Layout principal del Nebula Recipe Studio
 * Inspirado en Figma, Notion, Linear, Obsidian
 * Organiza la pantalla en paneles independientes
 */
export function RecipeWorkspace({
  recipe,
  inventoryItems: propInventoryItems,
  onEdit,
  onDelete,
  onVariantSelect,
  onInheritanceChange,
  onCreateVariant,
}: RecipeWorkspaceProps) {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('info');
  const [showInspector, setShowInspector] = useState(true);

  const { inventoryItems: hookInventoryItems } = useInventoryIntegration();
  const finalInventoryItems = propInventoryItems || hookInventoryItems;

  const renderContent = () => {
    switch (activeSection) {
      case 'info':
        return <RecipeInfoPanel recipe={recipe} />;
      case 'ingredients':
        return <RecipeIngredientsPanel recipe={recipe} inventoryItems={finalInventoryItems} />;
      case 'preparation':
        return <RecipePreparationPanel recipe={recipe} />;
      case 'costs':
        return <RecipeCostsPanel recipe={recipe} inventoryItems={finalInventoryItems} />;
      case 'preview':
        return <RecipePreviewPanel recipe={recipe} />;
      case 'variants':
        return (
          <RecipeVariantPanel
            currentRecipe={recipe}
            masterRecipe={recipe.parentId ? undefined : recipe}
            onInheritanceChange={onInheritanceChange}
            onCreateVariant={onCreateVariant}
          />
        );
      case 'tree':
        return (
          <RecipeTree
            recipeTree={{
              master: recipe,
              variants: [],
              depth: 1,
            }}
            onVariantSelect={onVariantSelect}
          />
        );
      default:
        return <RecipeInfoPanel recipe={recipe} />;
    }
  };

  return (
    <div className="recipe-workspace">
      {/* Header */}
      <div className="workspace-header">
        <RecipeHeader recipe={recipe} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Main Content Area */}
      <div className="workspace-main">
        {/* Sidebar */}
        <div className="workspace-sidebar">
          <RecipeSidebar
            activeSection={activeSection}
            onSectionChange={(section) => setActiveSection(section as WorkspaceSection)}
          />
        </div>

        {/* Content */}
        <div className="workspace-content">{renderContent()}</div>

        {/* Inspector */}
        {showInspector && (
          <div className="workspace-inspector">
            <div className="inspector-header">
              <h4 className="inspector-title">Inspector</h4>
              <button
                onClick={() => setShowInspector(false)}
                className="btn-close-inspector"
              >
                ✕
              </button>
            </div>
            <div className="inspector-content">
              <div className="inspector-section">
                <h5 className="inspector-section-title">Estado</h5>
                <span className={`status-badge ${recipe.isActive ? 'active' : 'inactive'}`}>
                  {recipe.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="inspector-section">
                <h5 className="inspector-section-title">Tipo</h5>
                <span className="inspector-value">{recipe.type}</span>
              </div>
              <div className="inspector-section">
                <h5 className="inspector-section-title">Categoría</h5>
                <span className="inspector-value">{recipe.category}</span>
              </div>
              {recipe.drinkStyle && (
                <div className="inspector-section">
                  <h5 className="inspector-section-title">Estilo</h5>
                  <span className="inspector-value">{recipe.drinkStyle}</span>
                </div>
              )}
              <div className="inspector-section">
                <h5 className="inspector-section-title">Costo Total</h5>
                <span className="inspector-value">${recipe.totalCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="inspector-section">
                <h5 className="inspector-section-title">Ingredientes</h5>
                <span className="inspector-value">{recipe.ingredients.length}</span>
              </div>
              <div className="inspector-section">
                <h5 className="inspector-section-title">Pasos</h5>
                <span className="inspector-value">{recipe.steps?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Inspector Toggle */}
        {!showInspector && (
          <button
            onClick={() => setShowInspector(true)}
            className="btn-toggle-inspector"
          >
            Inspector
          </button>
        )}
      </div>
    </div>
  );
}
