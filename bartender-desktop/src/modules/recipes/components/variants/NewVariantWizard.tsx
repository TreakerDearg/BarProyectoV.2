import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, GitBranch, Star, Clock, DollarSign, Activity } from 'lucide-react';
import type { Recipe, InheritanceSettings } from '../../types';
import styles from './NewVariantWizard.module.css';

interface NewVariantWizardProps {
  masterRecipe: Recipe;
  onClose: () => void;
  onCreate: (variant: Partial<Recipe>) => void;
}

type WizardStep = 'select-base' | 'name' | 'inheritance' | 'summary' | 'confirm';

/**
 * NewVariantWizard - Wizard de 5 pasos para crear variantes
 */
export function NewVariantWizard({ masterRecipe, onClose, onCreate }: NewVariantWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-base');
  const [variantData, setVariantData] = useState({
    baseRecipe: masterRecipe,
    name: '',
    variantName: '',
    inheritanceSettings: {
      inheritIngredients: true,
      inheritSteps: true,
      inheritMethod: true,
      inheritSpecifications: true,
      inheritCategory: true,
      inheritDrinkStyle: true,
    } as InheritanceSettings,
  });

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'select-base', title: 'Select Base', icon: GitBranch },
    { id: 'name', title: 'Name Variant', icon: Star },
    { id: 'inheritance', title: 'Inheritance', icon: GitBranch },
    { id: 'summary', title: 'Summary', icon: Activity },
    { id: 'confirm', title: 'Confirm', icon: Check },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleCreate = () => {
    onCreate({
      ...variantData.baseRecipe,
      _id: undefined,
      parentId: variantData.baseRecipe._id,
      variantName: variantData.variantName,
      product: {
        ...variantData.baseRecipe.product,
        name: variantData.name,
      },
      inheritanceSettings: variantData.inheritanceSettings,
      isPrimary: false,
    });
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'select-base':
        return !!variantData.baseRecipe;
      case 'name':
        return variantData.name.trim().length > 0 && variantData.variantName.trim().length > 0;
      case 'inheritance':
        return true;
      case 'summary':
        return true;
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={styles.wizardOverlay}>
      <div className={styles.wizard}>
        {/* Wizard Header */}
        <div className={styles.wizardHeader}>
          <h2>Create New Variant</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Progress Steps */}
        <div className={styles.progressSteps}>
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`${styles.stepItem} ${currentStep === step.id ? styles.active : ''} ${idx < currentStepIndex ? styles.completed : ''}`}
            >
              <div className={styles.stepIcon}>
                {idx < currentStepIndex ? <Check /> : <step.icon />}
              </div>
              <span className={styles.stepLabel}>{step.title}</span>
              {idx < steps.length - 1 && <div className={styles.stepConnector} />}
            </div>
          ))}
        </div>

        {/* Wizard Content */}
        <div className={styles.wizardContent}>
          {currentStep === 'select-base' && (
            <SelectBaseStep
              baseRecipe={variantData.baseRecipe}
              onSelect={(recipe) => setVariantData({ ...variantData, baseRecipe: recipe })}
            />
          )}
          {currentStep === 'name' && (
            <NameStep
              name={variantData.name}
              variantName={variantData.variantName}
              onChange={(name, variantName) => setVariantData({ ...variantData, name, variantName })}
            />
          )}
          {currentStep === 'inheritance' && (
            <InheritanceStep
              settings={variantData.inheritanceSettings}
              onChange={(settings) => setVariantData({ ...variantData, inheritanceSettings: settings })}
            />
          )}
          {currentStep === 'summary' && (
            <SummaryStep variantData={variantData} />
          )}
          {currentStep === 'confirm' && (
            <ConfirmStep variantData={variantData} onConfirm={handleCreate} />
          )}
        </div>

        {/* Wizard Footer */}
        <div className={styles.wizardFooter}>
          <button
            className={styles.footerButton}
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft />
            Previous
          </button>
          <div className={styles.footerInfo}>
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <button
            className={styles.footerButton}
            onClick={currentStep === 'confirm' ? handleCreate : handleNext}
            disabled={!canProceed()}
          >
            {currentStep === 'confirm' ? 'Create Variant' : 'Next'}
            {currentStep !== 'confirm' && <ChevronRight />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function SelectBaseStep({ baseRecipe, onSelect }: { baseRecipe?: Recipe; onSelect: (recipe: Recipe) => void }) {
  if (!baseRecipe || typeof baseRecipe !== 'object') {
    return (
      <div className={styles.stepContent}>
        <h3>Select Base Recipe</h3>
        <p className={styles.stepDescription}>No base recipe available. Please select a recipe first.</p>
      </div>
    );
  }

  const recipeName = baseRecipe.product?.name || baseRecipe.name || 'Unnamed Recipe';
  const recipeCategory = baseRecipe.category || 'Uncategorized';
  const recipeImage = baseRecipe.image || baseRecipe.product?.image || null;
  const recipeCost = baseRecipe.totalCost || baseRecipe.cost || 0;
  const ingredientCount = baseRecipe.ingredients?.length || 0;

  return (
    <div className={styles.stepContent}>
      <h3>Select Base Recipe</h3>
      <p className={styles.stepDescription}>Choose the recipe that will serve as the base for your variant.</p>
      <div className={styles.baseRecipeCard}>
        <div className={styles.baseRecipeImage}>
          {recipeImage ? (
            <img src={recipeImage} alt={recipeName} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Star />
            </div>
          )}
        </div>
        <div className={styles.baseRecipeInfo}>
          <h4>{recipeName}</h4>
          <p>{recipeCategory}</p>
          <div className={styles.baseRecipeStats}>
            <span className={styles.stat}>
              <DollarSign className={styles.statIcon} />
              ${typeof recipeCost === 'number' ? recipeCost.toFixed(2) : '0.00'}
            </span>
            <span className={styles.stat}>
              <Activity className={styles.statIcon} />
              {ingredientCount} ingredients
            </span>
          </div>
        </div>
        <div className={styles.selectedBadge}>
          <Check />
          Selected
        </div>
      </div>
    </div>
  );
}

function NameStep({ name, variantName, onChange }: { name: string; variantName: string; onChange: (name: string, variantName: string) => void }) {
  return (
    <div className={styles.stepContent}>
      <h3>Name Your Variant</h3>
      <p className={styles.stepDescription}>Give your variant a descriptive name and variant identifier.</p>
      <div className={styles.formGroup}>
        <label>Recipe Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value, variantName)}
          placeholder="e.g., Mojito Mango"
          className={styles.formInput}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Variant Identifier</label>
        <input
          type="text"
          value={variantName}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="e.g., Mango"
          className={styles.formInput}
        />
      </div>
    </div>
  );
}

function InheritanceStep({ settings, onChange }: { settings: InheritanceSettings; onChange: (settings: InheritanceSettings) => void }) {
  const toggleSetting = (key: keyof InheritanceSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  const fields = [
    { key: 'inheritIngredients' as keyof InheritanceSettings, label: 'Ingredients', description: 'All ingredients from base recipe' },
    { key: 'inheritSteps' as keyof InheritanceSettings, label: 'Preparation Steps', description: 'Step-by-step instructions' },
    { key: 'inheritMethod' as keyof InheritanceSettings, label: 'Method', description: 'Shake, stir, build, etc.' },
    { key: 'inheritSpecifications' as keyof InheritanceSettings, label: 'Specifications', description: 'Glassware, ice type' },
    { key: 'inheritCategory' as keyof InheritanceSettings, label: 'Category', description: 'Recipe category' },
    { key: 'inheritDrinkStyle' as keyof InheritanceSettings, label: 'Drink Style', description: 'Author, classic, etc.' },
  ];

  return (
    <div className={styles.stepContent}>
      <h3>Configure Inheritance</h3>
      <p className={styles.stepDescription}>Choose which fields to inherit from the base recipe.</p>
      <div className={styles.inheritanceList}>
        {fields.map((field) => (
          <div key={field.key} className={styles.inheritanceItem}>
            <div className={styles.inheritanceInfo}>
              <span className={styles.inheritanceLabel}>{field.label}</span>
              <span className={styles.inheritanceDescription}>{field.description}</span>
            </div>
            <button
              className={`${styles.inheritanceToggle} ${settings[field.key] ? styles.inherited : styles.overridden}`}
              onClick={() => toggleSetting(field.key)}
            >
              {settings[field.key] ? <Check /> : <X />}
              {settings[field.key] ? 'Inherit' : 'Override'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryStep({ variantData }: { variantData: any }) {
  if (!variantData?.baseRecipe) {
    return (
      <div className={styles.stepContent}>
        <h3>Summary</h3>
        <p className={styles.stepDescription}>No variant data available.</p>
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <h3>Summary</h3>
      <p className={styles.stepDescription}>Review your variant configuration before creating.</p>
      <div className={styles.summaryCard}>
        <div className={styles.summarySection}>
          <h4>Base Recipe</h4>
          <p>{variantData.baseRecipe.product?.name || 'Unnamed Recipe'}</p>
        </div>
        <div className={styles.summarySection}>
          <h4>Variant Name</h4>
          <p>{variantData.name || 'Unnamed Variant'}</p>
          <span className={styles.summaryBadge}>{variantData.variantName || 'No identifier'}</span>
        </div>
        <div className={styles.summarySection}>
          <h4>Inheritance</h4>
          <div className={styles.inheritanceSummary}>
            {variantData.inheritanceSettings && Object.entries(variantData.inheritanceSettings).map(([key, value]) => (
              <span key={key} className={`${styles.summaryTag} ${value ? styles.inherited : styles.overridden}`}>
                {key.replace('inherit', '')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmStep({ variantData, onConfirm }: { variantData: any; onConfirm: () => void }) {
  if (!variantData?.baseRecipe) {
    return (
      <div className={styles.stepContent}>
        <h3>Ready to Create</h3>
        <p className={styles.stepDescription}>No variant data available. Please complete the previous steps.</p>
      </div>
    );
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.confirmIcon}>
        <Check />
      </div>
      <h3>Ready to Create</h3>
      <p className={styles.stepDescription}>
        You're about to create <strong>{variantData.name || 'Unnamed Variant'}</strong> ({variantData.variantName || 'No identifier'}) 
        based on <strong>{variantData.baseRecipe.product?.name || 'Unnamed Recipe'}</strong>.
      </p>
      <div className={styles.confirmActions}>
        <button className={styles.confirmButton} onClick={onConfirm}>
          <Check />
          Create Variant
        </button>
      </div>
    </div>
  );
}
