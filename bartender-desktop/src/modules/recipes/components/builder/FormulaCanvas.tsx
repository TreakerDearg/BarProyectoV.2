import { useState } from 'react';
import type { RecipeIngredient, RecipeStep } from '../../types';
import { PremiumIngredientCard } from './PremiumIngredientCard';
import { RecipeStepBlock } from './RecipeStepBlock';
import { PresentationSection } from './PresentationSection';
import styles from './FormulaCanvas.module.css';

interface FormulaCanvasProps {
  recipe: any;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  onIngredientUpdate: (index: number, updated: RecipeIngredient) => void;
  onIngredientRemove: (index: number) => void;
  onStepAdd: (step: RecipeStep) => void;
  onStepUpdate: (index: number, updated: RecipeStep) => void;
  onStepRemove: (index: number) => void;
  onStepReorder: (fromIndex: number, toIndex: number) => void;
  inventoryItems: any[];
}

/**
 * FormulaCanvas - Espacio central para ver toda la receta como flujo continuo
 * Inspirado en Notion, Milanote, FigJam
 */
export function FormulaCanvas({
  recipe,
  ingredients,
  steps,
  onIngredientUpdate,
  onIngredientRemove,
  onStepAdd,
  onStepUpdate,
  onStepRemove,
  onStepReorder,
  inventoryItems,
}: FormulaCanvasProps) {
  const [activeSection, setActiveSection] = useState<'ingredients' | 'steps' | 'presentation'>('ingredients');

  const handleDrop = (e: any) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (data.type === 'ingredient') {
      const newIngredient = {
        inventoryItem: data.item,
        quantity: 1,
        unit: data.item.unit || 'ml',
      };
      // Add ingredient logic would go here
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  return (
    <div className={styles.formulaCanvas} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className={styles.canvasHeader}>
        <div className={styles.canvasTabs}>
          <button
            className={`${styles.canvasTab} ${activeSection === 'ingredients' ? styles.active : ''}`}
            onClick={() => setActiveSection('ingredients')}
          >
            🥗 Ingredientes ({ingredients.length})
          </button>
          <button
            className={`${styles.canvasTab} ${activeSection === 'steps' ? styles.active : ''}`}
            onClick={() => setActiveSection('steps')}
          >
            📝 Pasos ({steps.length})
          </button>
          <button
            className={`${styles.canvasTab} ${activeSection === 'presentation' ? styles.active : ''}`}
            onClick={() => setActiveSection('presentation')}
          >
            ✨ Presentación
          </button>
        </div>
      </div>

      <div className={styles.canvasContent}>
        {activeSection === 'ingredients' && (
          <div className={styles.canvasSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Ingredientes</h3>
              <button className={styles.addButton}>+ Agregar Ingrediente</button>
            </div>
            <div className={styles.ingredientsGrid}>
              {ingredients.map((ingredient, index) => {
                const inventoryItem = inventoryItems.find(
                  (item) => item._id === ingredient.inventoryItem._id
                );
                return (
                  <PremiumIngredientCard
                    key={index}
                    ingredient={ingredient}
                    onUpdate={(updated) => onIngredientUpdate(index, updated)}
                    onRemove={() => onIngredientRemove(index)}
                    onDuplicate={() => console.log('Duplicate')}
                    onChangeIngredient={() => console.log('Change')}
                    onMoveUp={() => index > 0 && console.log('Move up')}
                    onMoveDown={() => index < ingredients.length - 1 && console.log('Move down')}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'steps' && (
          <div className={styles.canvasSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Pasos de Preparación</h3>
              <button className={styles.addButton} onClick={() => onStepAdd({
                title: '',
                description: '',
                time: 0,
                temperature: null,
                technique: '',
                utensils: [],
                notes: '',
              })}>
                + Agregar Paso
              </button>
            </div>
            <div className={styles.stepsList}>
              {steps.map((step, index) => (
                <RecipeStepBlock
                  key={index}
                  step={step}
                  index={index}
                  onUpdate={(updated) => onStepUpdate(index, updated)}
                  onRemove={() => onStepRemove(index)}
                  onDuplicate={() => console.log('Duplicate')}
                  onMoveUp={() => index > 0 && onStepReorder(index, index - 1)}
                  onMoveDown={() => index < steps.length - 1 && onStepReorder(index, index + 1)}
                  onToggleExpand={() => console.log('Toggle expand')}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'presentation' && (
          <div className={styles.canvasSection}>
            <PresentationSection recipe={recipe} />
          </div>
        )}
      </div>
    </div>
  );
}
