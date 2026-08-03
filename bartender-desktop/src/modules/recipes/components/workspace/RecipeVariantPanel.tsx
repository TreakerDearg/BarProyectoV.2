import { useState } from 'react';
import type { Recipe, InheritanceSettings } from '../../types';
import { useRecipeInheritance, createVariantFromMaster } from '../../hooks';
import styles from './RecipeVariantPanel.module.css';

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
    <div className={styles.recipeVariantPanel}>
      <h3 className={styles.panelTitle}>Configuración de Variante</h3>

      {/* Información de la variante */}
      {currentRecipe.parentId && (
        <div className={styles.variantInfo}>
          <span className={styles.variantLabel}>Variante de:</span>
          <span className={styles.variantMaster}>{masterRecipe?.product?.name || 'Receta base'}</span>
        </div>
      )}

      {/* Configuración de herencia */}
      <div className={styles.inheritanceSettings}>
        <h4 className={styles.settingsTitle}>Herencia de Campos</h4>
        
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritIngredients}
              onChange={(e) => handleSettingChange('inheritIngredients', e.target.checked)}
            />
            <span>Ingredientes</span>
          </label>
          <span className={styles.settingStatus} data-status={inheritedFields.includes('ingredients') ? 'inherited' : 'overridden'}>
            {inheritedFields.includes('ingredients') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritSteps}
              onChange={(e) => handleSettingChange('inheritSteps', e.target.checked)}
            />
            <span>Pasos de preparación</span>
          </label>
          <span className={styles.settingStatus} data-status={inheritedFields.includes('steps') ? 'inherited' : 'overridden'}>
            {inheritedFields.includes('steps') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritMethod}
              onChange={(e) => handleSettingChange('inheritMethod', e.target.checked)}
            />
            <span>Método</span>
          </label>
          <span className={styles.settingStatus} data-status={inheritedFields.includes('method') ? 'inherited' : 'overridden'}>
            {inheritedFields.includes('method') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritSpecifications}
              onChange={(e) => handleSettingChange('inheritSpecifications', e.target.checked)}
            />
            <span>Especificaciones (vaso, hielo)</span>
          </label>
          <span className={styles.settingStatus} data-status={inheritedFields.includes('specifications') ? 'inherited' : 'overridden'}>
            {inheritedFields.includes('specifications') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritCategory}
              onChange={(e) => handleSettingChange('inheritCategory', e.target.checked)}
            />
            <span>Categoría</span>
          </label>
          <span className={styles.settingStatus} data-status={inheritedFields.includes('category') ? 'inherited' : 'overridden'}>
            {inheritedFields.includes('category') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>

        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            <input
              type="checkbox"
              checked={inheritanceSettings.inheritDrinkStyle}
              onChange={(e) => handleSettingChange('inheritDrinkStyle', e.target.checked)}
            />
            <span>Estilo de bebida</span>
          </label>
          <span className={styles.settingStatus} data-status={inheritedFields.includes('drinkStyle') ? 'inherited' : 'overridden'}>
            {inheritedFields.includes('drinkStyle') ? 'Heredado' : 'Sobrescrito'}
          </span>
        </div>
      </div>

      {/* Crear nueva variante */}
      {masterRecipe && (
        <div className={styles.createVariant}>
          <h4 className={styles.createTitle}>Crear Nueva Variante</h4>
          <div className={styles.createForm}>
            <input
              type="text"
              placeholder="Nombre de la variante (ej. Premium, Sin Alcohol)"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              className={styles.variantInput}
            />
            <button
              onClick={handleCreateVariant}
              disabled={!newVariantName.trim()}
              className={styles.btnCreateVariant}
            >
              Crear Variante
            </button>
          </div>
        </div>
      )}

      {/* Resumen de cambios */}
      {overriddenFields.length > 0 && (
        <div className={styles.overrideSummary}>
          <h4 className={styles.summaryTitle}>Campos Sobrescritos</h4>
          <ul className={styles.summaryList}>
            {overriddenFields.map((field) => (
              <li key={field} className={styles.summaryItem}>
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
