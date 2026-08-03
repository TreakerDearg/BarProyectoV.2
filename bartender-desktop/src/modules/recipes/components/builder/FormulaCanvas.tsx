import { useState } from 'react';
import type { RecipeIngredient, RecipeStep } from '../../types';
import { IngredientCard } from './IngredientCard';
import { RecipeStepCard } from './RecipeStepCard';
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
              <h3>Ingredientes</h3>
              <button className={styles.addButton}>+ Agregar Ingrediente</button>
            </div>
            <div className={styles.ingredientsGrid}>
              {ingredients.map((ingredient, index) => {
                const inventoryItem = inventoryItems.find(
                  (item) => item._id === ingredient.inventoryItem._id
                );
                return (
                  <IngredientCard
                    key={index}
                    ingredient={ingredient}
                    inventoryItem={inventoryItem}
                    onUpdate={(updated) => onIngredientUpdate(index, updated)}
                    onRemove={() => onIngredientRemove(index)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'steps' && (
          <div className={styles.canvasSection}>
            <div className={styles.sectionHeader}>
              <h3>Pasos de Preparación</h3>
              <button className={styles.addButton} onClick={() => onStepAdd({
                stepNumber: steps.length + 1,
                instruction: '',
                duration: 0,
                temperature: null,
              })}>
                + Agregar Paso
              </button>
            </div>
            <div className={styles.stepsList}>
              {steps.map((step, index) => (
                <RecipeStepCard
                  key={index}
                  step={step}
                  stepNumber={index + 1}
                  onUpdate={(updated) => onStepUpdate(index, updated)}
                  onRemove={() => onStepRemove(index)}
                  onMoveUp={() => index > 0 && onStepReorder(index, index - 1)}
                  onMoveDown={() => index < steps.length - 1 && onStepReorder(index, index + 1)}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'presentation' && (
          <div className={styles.canvasSection}>
            <div className={styles.sectionHeader}>
              <h3>Presentación</h3>
            </div>
            <div className={styles.presentationGrid}>
              <div className={styles.presentationCard}>
                <h4>Cristalería</h4>
                <p>{recipe.specifications?.glass || 'No especificado'}</p>
              </div>
              <div className={styles.presentationCard}>
                <h4>Hielo</h4>
                <p>{recipe.specifications?.ice || 'No especificado'}</p>
              </div>
              <div className={styles.presentationCard}>
                <h4>Decoración</h4>
                <p>{recipe.decorationIds?.length || 0} decoraciones</p>
              </div>
              <div className={styles.presentationCard}>
                <h4>Técnica</h4>
                <p>{recipe.method || 'No especificado'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
