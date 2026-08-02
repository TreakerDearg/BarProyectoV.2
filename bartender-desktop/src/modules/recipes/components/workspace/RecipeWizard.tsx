import { useState } from 'react';
import type { Recipe, InheritanceSettings } from '../../types';

type WizardStep = 'info' | 'ingredients' | 'preparation' | 'presentation' | 'costs' | 'validation';

interface RecipeWizardProps {
  masterRecipe?: Recipe;
  onComplete: (recipe: Partial<Recipe>) => void;
  onCancel: () => void;
}

interface WizardFormData {
  // Info
  productName: string;
  type: 'drink' | 'food';
  category: string;
  drinkStyle?: 'author' | 'classic';
  
  // Ingredients
  ingredients: Recipe['ingredients'];
  
  // Preparation
  method?: string;
  steps?: Recipe['steps'];
  
  // Presentation
  specifications?: Recipe['specifications'];
  image?: string;
  
  // Variant settings
  isVariant: boolean;
  variantName?: string;
  inheritanceSettings?: InheritanceSettings;
}

/**
 * RecipeWizard - Flujo guiado de creación de recetas
 * Reemplaza el formulario tradicional por una experiencia paso a paso
 * El usuario siente que está construyendo una fórmula, no llenando un formulario
 */
export function RecipeWizard({ masterRecipe, onComplete, onCancel }: RecipeWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [formData, setFormData] = useState<WizardFormData>({
    productName: '',
    type: 'drink',
    category: '',
    ingredients: [],
    method: '',
    steps: [],
    specifications: {},
    isVariant: !!masterRecipe,
    variantName: '',
    inheritanceSettings: masterRecipe ? {
      inheritIngredients: true,
      inheritSteps: true,
      inheritMethod: true,
      inheritSpecifications: true,
      inheritCategory: true,
      inheritDrinkStyle: true,
    } : undefined,
  });

  const steps: Array<{ id: WizardStep; label: string; description: string }> = [
    { id: 'info', label: 'Información', description: 'Nombre, tipo y categoría' },
    { id: 'ingredients', label: 'Ingredientes', description: 'Selecciona y configura ingredientes' },
    { id: 'preparation', label: 'Preparación', description: 'Método y pasos de preparación' },
    { id: 'presentation', label: 'Presentación', description: 'Vaso, hielo y decoración' },
    { id: 'costs', label: 'Costos', description: 'Revisa el desglose de costos' },
    { id: 'validation', label: 'Validación', description: 'Verifica y guarda la receta' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleComplete = () => {
    const recipe: Partial<Recipe> = {
      product: {
        _id: '',
        name: formData.productName,
        type: formData.type,
      },
      type: formData.type,
      category: formData.category,
      drinkStyle: formData.drinkStyle,
      ingredients: formData.ingredients,
      method: formData.method,
      steps: formData.steps,
      specifications: formData.specifications,
      image: formData.image,
      isPrimary: !formData.isVariant,
      variantName: formData.variantName,
      parentId: masterRecipe?._id,
      inheritanceSettings: formData.inheritanceSettings,
    };
    onComplete(recipe);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="wizard-step-content">
            <h3 className="step-title">Información Básica</h3>
            <div className="form-group">
              <label>Nombre del Producto</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Ej: Gin Tonic"
              />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'drink' | 'food' })}
              >
                <option value="drink">Bebida</option>
                <option value="food">Comida</option>
              </select>
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Cócteles, Postres"
              />
            </div>
            {formData.type === 'drink' && (
              <div className="form-group">
                <label>Estilo</label>
                <select
                  value={formData.drinkStyle || ''}
                  onChange={(e) => setFormData({ ...formData, drinkStyle: e.target.value as 'author' | 'classic' })}
                >
                  <option value="">Seleccionar...</option>
                  <option value="author">Autor</option>
                  <option value="classic">Clásico</option>
                </select>
              </div>
            )}
          </div>
        );
      case 'ingredients':
        return (
          <div className="wizard-step-content">
            <h3 className="step-title">Ingredientes</h3>
            <p className="step-description">
              {masterRecipe && formData.inheritanceSettings?.inheritIngredients
                ? `Heredando ${masterRecipe.ingredients.length} ingredientes de la receta base`
                : 'Agrega los ingredientes de tu receta'}
            </p>
            <div className="ingredients-placeholder">
              {/* Aquí se integrará RecipeIngredientCard en fases posteriores */}
              <p className="placeholder-text">Selector de ingredientes (próxima fase)</p>
            </div>
          </div>
        );
      case 'preparation':
        return (
          <div className="wizard-step-content">
            <h3 className="step-title">Preparación</h3>
            <div className="form-group">
              <label>Método</label>
              <textarea
                value={formData.method || ''}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                placeholder="Ej: Directo en vaso, Batido, Mezclado"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Pasos de Preparación</label>
              <div className="steps-placeholder">
                {/* Aquí se integrará RecipeStepCard en fases posteriores */}
                <p className="placeholder-text">Constructor de pasos (próxima fase)</p>
              </div>
            </div>
          </div>
        );
      case 'presentation':
        return (
          <div className="wizard-step-content">
            <h3 className="step-title">Presentación</h3>
            <div className="form-group">
              <label>Vaso</label>
              <input
                type="text"
                value={formData.specifications?.glass || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, glass: e.target.value }
                })}
                placeholder="Ej: Copa de martini, Vaso old fashioned"
              />
            </div>
            <div className="form-group">
              <label>Hielo</label>
              <input
                type="text"
                value={formData.specifications?.ice || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, ice: e.target.value }
                })}
                placeholder="Ej: Cubos, Picado, Sin hielo"
              />
            </div>
            <div className="form-group">
              <label>Imagen</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="URL de la imagen"
              />
            </div>
          </div>
        );
      case 'costs':
        return (
          <div className="wizard-step-content">
            <h3 className="step-title">Costos</h3>
            <p className="step-description">
              El costo total se calculará automáticamente basado en los ingredientes
            </p>
            <div className="costs-summary">
              <div className="cost-item">
                <span className="cost-label">Ingredientes:</span>
                <span className="cost-value">{formData.ingredients.length}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Pasos:</span>
                <span className="cost-value">{formData.steps?.length || 0}</span>
              </div>
            </div>
          </div>
        );
      case 'validation':
        return (
          <div className="wizard-step-content">
            <h3 className="step-title">Validación</h3>
            <div className="validation-summary">
              <div className="validation-item">
                <span className="validation-label">Nombre:</span>
                <span className="validation-value">{formData.productName || 'No especificado'}</span>
              </div>
              <div className="validation-item">
                <span className="validation-label">Tipo:</span>
                <span className="validation-value">{formData.type}</span>
              </div>
              <div className="validation-item">
                <span className="validation-label">Categoría:</span>
                <span className="validation-value">{formData.category || 'No especificada'}</span>
              </div>
              <div className="validation-item">
                <span className="validation-label">Ingredientes:</span>
                <span className="validation-value">{formData.ingredients.length}</span>
              </div>
              <div className="validation-item">
                <span className="validation-label">Pasos:</span>
                <span className="validation-value">{formData.steps?.length || 0}</span>
              </div>
              {formData.isVariant && (
                <div className="validation-item variant-info">
                  <span className="validation-label">Variante de:</span>
                  <span className="validation-value">{masterRecipe?.product?.name}</span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="recipe-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">
          {masterRecipe ? `Crear Variante: ${masterRecipe.product?.name}` : 'Crear Nueva Receta'}
        </h2>
        <button onClick={onCancel} className="btn-cancel">
          Cancelar
        </button>
      </div>

      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`progress-step ${currentStep === step.id ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-info">
              <span className="step-label">{step.label}</span>
              <span className="step-desc">{step.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        {renderStepContent()}
      </div>

      <div className="wizard-footer">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="btn-previous"
        >
          Anterior
        </button>
        {currentStep === 'validation' ? (
          <button
            onClick={handleComplete}
            disabled={!formData.productName || !formData.category}
            className="btn-complete"
          >
            Guardar Receta
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentStep === 'info' && (!formData.productName || !formData.category)}
            className="btn-next"
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}
