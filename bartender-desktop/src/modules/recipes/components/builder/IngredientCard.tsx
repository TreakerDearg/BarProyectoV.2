import type { RecipeIngredient } from '../../types';

interface IngredientCardProps {
  ingredient: RecipeIngredient;
  inventoryItem?: any;
  onUpdate?: (updated: RecipeIngredient) => void;
  onRemove?: () => void;
  isDraggable?: boolean;
  showSubstitutions?: boolean;
}

/**
 * IngredientCard - Card inteligente para ingredientes
 * Muestra imagen, nombre, unidad, cantidad, stock, costo, proveedor, estado
 */
export function IngredientCard({
  ingredient,
  inventoryItem,
  onUpdate,
  onRemove,
  isDraggable = true,
  showSubstitutions = false,
}: IngredientCardProps) {
  const stock = inventoryItem?.stock || 0;
  const cost = inventoryItem?.cost || 0;
  const supplier = inventoryItem?.supplier || 'N/A';
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock < 10;
  const isCritical = isLowStock || isOutOfStock;

  const handleQuantityChange = (value: number) => {
    if (onUpdate) {
      onUpdate({ ...ingredient, quantity: value });
    }
  };

  const handleUnitChange = (unit: string) => {
    if (onUpdate) {
      onUpdate({ ...ingredient, unit });
    }
  };

  return (
    <div
      className={`ingredient-card ${isCritical ? 'critical' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
      draggable={isDraggable}
    >
      <div className="card-header">
        <div className="card-image">
          {inventoryItem?.image ? (
            <img src={inventoryItem.image} alt={inventoryItem.name} />
          ) : (
            <div className="image-placeholder">🥗</div>
          )}
        </div>
        <div className="card-info">
          <h4 className="ingredient-name">{inventoryItem?.name || ingredient.inventoryItem.name}</h4>
          <span className="ingredient-supplier">{supplier}</span>
        </div>
        {onRemove && (
          <button className="card-remove" onClick={onRemove}>
            ✕
          </button>
        )}
      </div>

      <div className="card-quantity">
        <input
          type="number"
          value={ingredient.quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          className="quantity-input"
          min="0"
          step="0.1"
        />
        <select
          value={ingredient.unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="unit-select"
        >
          <option value="ml">ml</option>
          <option value="oz">oz</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
          <option value="unidad">unidad</option>
          <option value="cdta">cdta</option>
          <option value="cda">cda</option>
          <option value="taza">taza</option>
        </select>
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">Stock</span>
          <span className={`stat-value ${isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}`}>
            {stock} {ingredient.unit}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Costo</span>
          <span className="stat-value">${(cost * ingredient.quantity).toFixed(2)}</span>
        </div>
      </div>

      {showSubstitutions && (
        <div className="card-substitutions">
          <span className="substitutions-label">Sustituciones disponibles</span>
          <div className="substitutions-list">
            <button className="substitution-item">Alternativa 1</button>
            <button className="substitution-item">Alternativa 2</button>
          </div>
        </div>
      )}

      {isCritical && (
        <div className="card-warning">
          {isOutOfStock ? '⚠️ Agotado' : '⚠️ Stock bajo'}
        </div>
      )}
    </div>
  );
}
