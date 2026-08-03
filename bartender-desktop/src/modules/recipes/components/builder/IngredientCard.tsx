import type { RecipeIngredient } from '../../types';
import styles from './IngredientCard.module.css';

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
      className={`${styles.ingredientCard} ${isCritical ? styles.critical : ''} ${isOutOfStock ? styles.outOfStock : ''}`}
      draggable={isDraggable}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardImage}>
          {inventoryItem?.image ? (
            <img src={inventoryItem.image} alt={inventoryItem.name} />
          ) : (
            <div className={styles.imagePlaceholder}>🥗</div>
          )}
        </div>
        <div className={styles.cardInfo}>
          <h4 className={styles.ingredientName}>{inventoryItem?.name || ingredient.inventoryItem.name}</h4>
          <span className={styles.ingredientSupplier}>{supplier}</span>
        </div>
        {onRemove && (
          <button className={styles.cardRemove} onClick={onRemove}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.cardQuantity}>
        <input
          type="number"
          value={ingredient.quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          className={styles.quantityInput}
          min="0"
          step="0.1"
        />
        <select
          value={ingredient.unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className={styles.unitSelect}
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

      <div className={styles.cardStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Stock</span>
          <span className={`${styles.statValue} ${isOutOfStock ? styles.danger : isLowStock ? styles.warning : styles.success}`}>
            {stock} {ingredient.unit}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Costo</span>
          <span className={styles.statValue}>${(cost * ingredient.quantity).toFixed(2)}</span>
        </div>
      </div>

      {showSubstitutions && (
        <div className={styles.cardSubstitutions}>
          <span className={styles.substitutionsLabel}>Sustituciones disponibles</span>
          <div className={styles.substitutionsList}>
            <button className={styles.substitutionItem}>Alternativa 1</button>
            <button className={styles.substitutionItem}>Alternativa 2</button>
          </div>
        </div>
      )}

      {isCritical && (
        <div className={styles.cardWarning}>
          {isOutOfStock ? '⚠️ Agotado' : '⚠️ Stock bajo'}
        </div>
      )}
    </div>
  );
}
