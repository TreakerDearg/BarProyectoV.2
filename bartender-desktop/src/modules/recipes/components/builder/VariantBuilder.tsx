import type { Recipe } from '../../types';
import { useRecipeInheritance } from '../../hooks';

interface VariantBuilderProps {
  masterRecipe: Recipe;
  variant: Recipe;
  onVariantChange: (variant: Recipe) => void;
}

/**
 * VariantBuilder - Constructor visual de variantes
 * Muestra diferencias respecto a la receta principal
 * Destaca herencia y sobrescrituras
 */
export function VariantBuilder({ masterRecipe, variant, onVariantChange }: VariantBuilderProps) {
  const { overriddenFields } = useRecipeInheritance({ 
    variant, 
    masterRecipe 
  });

  const handleToggleInheritance = (field: string) => {
    const currentSettings = variant.inheritanceSettings || {
      inheritIngredients: true,
      inheritSteps: true,
      inheritMethod: true,
      inheritSpecifications: true,
      inheritCategory: true,
      inheritDrinkStyle: true,
    };

    const updatedSettings = { ...currentSettings };
    switch (field) {
      case 'ingredients':
        updatedSettings.inheritIngredients = !updatedSettings.inheritIngredients;
        break;
      case 'steps':
        updatedSettings.inheritSteps = !updatedSettings.inheritSteps;
        break;
      case 'method':
        updatedSettings.inheritMethod = !updatedSettings.inheritMethod;
        break;
      case 'specifications':
        updatedSettings.inheritSpecifications = !updatedSettings.inheritSpecifications;
        break;
      case 'category':
        updatedSettings.inheritCategory = !updatedSettings.inheritCategory;
        break;
      case 'drinkStyle':
        updatedSettings.inheritDrinkStyle = !updatedSettings.inheritDrinkStyle;
        break;
    }

    onVariantChange({ ...variant, inheritanceSettings: updatedSettings });
  };

  return (
    <div className="variant-builder">
      <div className="variant-header">
        <h2 className="variant-title">Constructor de Variante</h2>
        <div className="variant-names">
          <span className="master-name">{masterRecipe.product?.name}</span>
          <span className="arrow">→</span>
          <span className="variant-name">{variant.variantName}</span>
        </div>
      </div>

      <div className="variant-summary">
        <h3 className="summary-title">Resumen de Cambios</h3>
        <div className="changes-list">
          {Object.keys(overriddenFields).length === 0 ? (
            <p className="no-changes">Sin cambios - Todo heredado de la receta base</p>
          ) : (
            Object.keys(overriddenFields).map((field) => (
              <div key={field} className="change-item">
                <span className="change-badge">✓ Modificado</span>
                <span className="change-field">{field}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="inheritance-controls">
        <h3 className="controls-title">Configuración de Herencia</h3>
        <div className="inheritance-list">
          <InheritanceToggle
            label="Ingredientes"
            isOverridden={Object.keys(overriddenFields).includes('ingredients')}
            isInherited={variant.inheritanceSettings?.inheritIngredients ?? true}
            onToggle={() => handleToggleInheritance('ingredients')}
          />
          <InheritanceToggle
            label="Pasos de Preparación"
            isOverridden={Object.keys(overriddenFields).includes('steps')}
            isInherited={variant.inheritanceSettings?.inheritSteps ?? true}
            onToggle={() => handleToggleInheritance('steps')}
          />
          <InheritanceToggle
            label="Método"
            isOverridden={Object.keys(overriddenFields).includes('method')}
            isInherited={variant.inheritanceSettings?.inheritMethod ?? true}
            onToggle={() => handleToggleInheritance('method')}
          />
          <InheritanceToggle
            label="Especificaciones (Cristalería, Hielo)"
            isOverridden={Object.keys(overriddenFields).includes('specifications')}
            isInherited={variant.inheritanceSettings?.inheritSpecifications ?? true}
            onToggle={() => handleToggleInheritance('specifications')}
          />
          <InheritanceToggle
            label="Categoría"
            isOverridden={Object.keys(overriddenFields).includes('category')}
            isInherited={variant.inheritanceSettings?.inheritCategory ?? true}
            onToggle={() => handleToggleInheritance('category')}
          />
          <InheritanceToggle
            label="Estilo de Bebida"
            isOverridden={Object.keys(overriddenFields).includes('drinkStyle')}
            isInherited={variant.inheritanceSettings?.inheritDrinkStyle ?? true}
            onToggle={() => handleToggleInheritance('drinkStyle')}
          />
        </div>
      </div>

      <div className="variant-comparison">
        <h3 className="comparison-title">Comparación Detallada</h3>
        <div className="comparison-table">
          <div className="comparison-row header">
            <span>Campo</span>
            <span>Receta Base</span>
            <span>Variante</span>
            <span>Estado</span>
          </div>
          <ComparisonRow
            label="Categoría"
            masterValue={masterRecipe.category}
            variantValue={variant.category}
            isOverridden={Object.keys(overriddenFields).includes('category')}
          />
          <ComparisonRow
            label="Método"
            masterValue={masterRecipe.method}
            variantValue={variant.method}
            isOverridden={Object.keys(overriddenFields).includes('method')}
          />
          <ComparisonRow
            label="Cristalería"
            masterValue={masterRecipe.specifications?.glass}
            variantValue={variant.specifications?.glass}
            isOverridden={Object.keys(overriddenFields).includes('specifications')}
          />
          <ComparisonRow
            label="Hielo"
            masterValue={masterRecipe.specifications?.ice}
            variantValue={variant.specifications?.ice}
            isOverridden={Object.keys(overriddenFields).includes('specifications')}
          />
        </div>
      </div>
    </div>
  );
}

function InheritanceToggle({ label, isOverridden, isInherited, onToggle }: any) {
  return (
    <div className="inheritance-item">
      <span className="inheritance-label">{label}</span>
      <button
        className={`inheritance-toggle ${isInherited ? 'inherited' : 'overridden'}`}
        onClick={onToggle}
      >
        {isInherited ? '→ Heredado' : '✓ Sobrescrito'}
      </button>
      {isOverridden && <span className="override-badge">Modificado</span>}
    </div>
  );
}

function ComparisonRow({ label, masterValue, variantValue, isOverridden }: any) {
  return (
    <div className={`comparison-row ${isOverridden ? 'overridden' : ''}`}>
      <span className="row-label">{label}</span>
      <span className="row-master">{masterValue || '-'}</span>
      <span className="row-variant">{variantValue || '-'}</span>
      <span className={`row-status ${isOverridden ? 'modified' : 'inherited'}`}>
        {isOverridden ? '✓ Modificado' : '→ Heredado'}
      </span>
    </div>
  );
}
