import { useState } from 'react';
import { useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import { PremiumIngredientCard } from './PremiumIngredientCard';
import { RecipeStepBlock } from './RecipeStepBlock';
import { PresentationSection } from './PresentationSection';
import styles from './FormulaCanvas.module.css';

/**
 * FormulaCanvas - Espacio central para ver toda la receta como flujo continuo
 * Inspirado en Notion, Milanote, FigJam
 */
export function FormulaCanvas() {
  const {
    recipe,
    handleIngredientUpdate,
    handleIngredientRemove,
    handleStepAdd,
    handleStepUpdate,
    handleStepRemove,
    handleStepReorder,
  } = useRecipeWorkspace();

  const ingredients = recipe.ingredients || [];
  const steps = recipe.steps || [];
  const [activeSection, setActiveSection] = useState<'ingredients' | 'steps' | 'presentation'>('ingredients');

  const handleDrop = (e: any) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (data.type === 'ingredient') {
      // TODO: Implement ingredient add via context
      console.log('Add ingredient:', data.item);
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
                return (
                  <PremiumIngredientCard
                    key={index}
                    ingredient={ingredient}
                    index={index}
                    onUpdate={(updated) => handleIngredientUpdate(index, updated)}
                    onRemove={() => handleIngredientRemove(index)}
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
              <button className={styles.addButton} onClick={() => handleStepAdd({
                stepNumber: steps.length + 1,
                instruction: '',
                time: 30,
                temperature: '',
                technique: undefined,
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
                  onUpdate={(updated) => handleStepUpdate(index, updated)}
                  onRemove={() => handleStepRemove(index)}
                  onDuplicate={() => console.log('Duplicate')}
                  onMoveUp={() => index > 0 && handleStepReorder(index, index - 1)}
                  onMoveDown={() => index < steps.length - 1 && handleStepReorder(index, index + 1)}
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
