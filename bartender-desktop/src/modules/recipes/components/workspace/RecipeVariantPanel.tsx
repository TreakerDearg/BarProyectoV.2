import { useState } from 'react';
import type { Recipe, InheritanceSettings } from '../../types';
import { useRecipeInheritance, createVariantFromMaster } from '../../hooks';

interface RecipeVariantPanelProps {
  currentRecipe: Recipe;
  masterRecipe?: Recipe;
  onInheritanceChange?: (settings: InheritanceSettings) => void;
  onCreateVariant?: (variant: Partial<Recipe>) => void;
}

/**
 * Componente RecipeVariantPanel - Panel para gestionar variantes y herencia
 * Permite configurar qué campos hereda una variante de la receta base
 */
export function RecipeVariantPanel({
  currentRecipe,
  masterRecipe,
  onInheritanceChange,
  onCreateVariant,
}: RecipeVariantPanelProps) {
  const [inheritanceSettings, setInheritanceSettings] = useState<InheritanceSettings>(
    currentRecipe.inheritanceSettings || {
      inheritIngredients: true,
      inheritSteps: true,
      inheritMethod: true,
      inheritSpecifications: true,
      inheritCategory: true,
      inheritDrinkStyle: true,
    }
  );

  const [newVariantName, setNewVariantName] = useState('');

  const { inheritedFields, overriddenFields } = useRecipeInheritance({
    variant: currentRecipe,
    masterRecipe: masterRecipe || currentRecipe,
    inheritanceSettings,
  });

  const handleSettingChange = (key: keyof InheritanceSettings, value: boolean) => {
    const newSettings = { ...inheritanceSettings, [key]: value };
    setInheritanceSettings(newSettings);
    onInheritanceChange?.(newSettings);
  };

  const handleCreateVariant = () => {
    if (!newVariantName.trim() || !masterRecipe) return;

    const variant = createVariantFromMaster(masterRecipe, newVariantName, inheritanceSettings);
    onCreateVariant?.(variant);
    setNewVariantName('');
  };

  return (
    <div className="recipe-variant-panel">
      <h3 className="panel-title">Configuración de Variante</h3>

      {/* Información de la variante */}
      {currentRecipe.parentId && (
        <div className="variant-info">
          <span className="variant-label">Variante de:</span>
          <span className="variant-master">{masterRecipe?.product?.name || 'Receta base'}</span>
        </div>
      )}

      {/* Configuración de herencia */}
      <div className="inheritance-settings">
        <h4 className="settings-title">Herencia de Campos</h4>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritIngredients}
              onChange={(e) => handleSettingChange('inheritIngredients', e.target.checked)}
            />
            <span>Ingredientes</span>
          </label>
          <span className="setting-status">
            {inheritedFields.includes('ingredients') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritSteps}
              onChange={(e) => handleSettingChange('inheritSteps', e.target.checked)}
            />
            <span>Pasos de preparación</span>
          </label>
          <span className="setting-status">
            {inheritedFields.includes('steps') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritMethod}
              onChange={(e) => handleSettingChange('inheritMethod', e.target.checked)}
            />
            <span>Método</span>
          </label>
          <span className="setting-status">
            {inheritedFields.includes('method') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritSpecifications}
              onChange={(e) => handleSettingChange('inheritSpecifications', e.target.checked)}
            />
            <span>Especificaciones (vaso, hielo)</span>
          </label>
          <span className="setting-status">
            {inheritedFields.includes('specifications') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritCategory}
              onChange={(e) => handleSettingChange('inheritCategory', e.target.checked)}
            />
            <span>Categoría</span>
          </label>
          <span className="setting-status">
            {inheritedFields.includes('category') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritDrinkStyle}
              onChange={(e) => handleSettingChange('inheritDrinkStyle', e.target.checked)}
            />
            <span>Estilo de bebida</span>
          </label>
          <span className="setting-status">
            {inheritedFields.includes('drinkStyle') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>
      </div>

      {/* Crear nueva variante */}
      {masterRecipe && (
        <div className="create-variant">
          <h4 className="create-title">Crear Nueva Variante</h4>
          <div className="create-form">
            <input
              type="text"
              placeholder="Nombre de la variante (ej. Premium, Sin Alcohol)"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              className="variant-input"
            />
            <button
              onClick={handleCreateVariant}
              disabled={!newVariantName.trim()}
              className="btn-create-variant"
            >
              Crear Variante
            </button>
          </div>
        </div>
      )}

      {/* Resumen de cambios */}
      {overriddenFields.length > 0 && (
        <div className="override-summary">
          <h4 className="summary-title">Campos Sobrescritos</h4>
          <ul className="summary-list">
            {overriddenFields.map((field) => (
              <li key={field} className="summary-item">
                {translateFieldName(field)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function translateFieldName(field: string): string {
  const translations: Record<string, string> = {
    ingredients: 'Ingredientes',
    steps: 'Pasos de preparación',
    method: 'Método',
    specifications: 'Especificaciones',
    category: 'Categoría',
    drinkStyle: 'Estilo de bebida',
  };
  return translations[field] || field;
}
