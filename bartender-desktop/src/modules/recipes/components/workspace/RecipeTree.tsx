import type { RecipeTree, RecipeVariant } from '../../types';

interface RecipeTreeProps {
  recipeTree: RecipeTree;
  onVariantSelect?: (variant: RecipeVariant) => void;
  onMasterSelect?: () => void;
  selectedId?: string;
}

/**
 * Componente RecipeTree - Vista en árbol para mostrar relación receta base/variantes
 * Inspirado en exploradores de archivos (Figma, Linear, Obsidian)
 */
export function RecipeTree({ recipeTree, onVariantSelect, onMasterSelect, selectedId }: RecipeTreeProps) {
  const { master, variants } = recipeTree;

  return (
    <div className="recipe-tree">
      <div className="tree-header">
        <h3 className="tree-title">Árbol de Recetas</h3>
        <span className="tree-count">{variants.length + 1} versiones</span>
      </div>

      <div className="tree-content">
        {/* Receta Base */}
        <div
          className={`tree-node master ${selectedId === master._id ? 'selected' : ''}`}
          onClick={onMasterSelect}
        >
          <div className="node-icon">📋</div>
          <div className="node-content">
            <span className="node-name">{master.product?.name || 'Sin nombre'}</span>
            <span className="node-badge master-badge">Base</span>
          </div>
        </div>

        {/* Variantes */}
        {variants.length > 0 && (
          <div className="tree-variants">
            <div className="tree-branch" />
            {variants.map((variant) => (
              <div
                key={variant._id}
 className={`tree-node variant ${selectedId === variant._id ? 'selected' : ''}`}
                onClick={() => onVariantSelect?.(variant)}
              >
                <div className="node-icon">🔀</div>
                <div className="node-content">
                  <span className="node-name">{variant.variantName}</span>
                  {variant.isPrimary && (
                    <span className="node-badge primary-badge">Principal</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
