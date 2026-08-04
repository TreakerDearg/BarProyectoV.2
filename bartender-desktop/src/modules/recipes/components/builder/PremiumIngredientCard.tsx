import { useState, memo } from 'react';
import { GripVertical, Copy, RefreshCw, ArrowUp, ArrowDown, Trash2, Wine, Droplets, CheckCircle, AlertTriangle, Tag, Package, DollarSign, Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import type { RecipeIngredient } from '../../types';
import styles from './PremiumIngredientCard.module.css';

interface PremiumIngredientCardProps {
  ingredient: RecipeIngredient;
  onUpdate?: (ingredient: RecipeIngredient) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onChangeIngredient?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

/**
 * PremiumIngredientCard - Card estilo Notion/Framer
 * Imagen, nombre, cantidad, unidad, precio, stock, estado, proveedor, acciones
 */
export const PremiumIngredientCard = memo(function PremiumIngredientCard({
  ingredient,
  onUpdate,
  onRemove,
  onDuplicate,
  onChangeIngredient,
  onMoveUp,
  onMoveDown,
}: PremiumIngredientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const inventoryItem = ingredient.inventoryItem;
  const name = inventoryItem?.name || 'Ingrediente';
  const cost = inventoryItem?.cost || 0;
  const stock = inventoryItem?.stock || 0;
  const unit = inventoryItem?.unit || 'ml';
  const provider = inventoryItem?.provider || 'N/A';
  const isAvailable = inventoryItem?.isAvailable !== false;

  const totalCost = (ingredient.quantity * cost).toFixed(2);

  return (
    <div
      className={`${styles.ingredientCard} ${isHovered ? styles.hovered : ''} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left - Image */}
      <div className={styles.cardLeft}>
        <div className={styles.ingredientImage}>
          {inventoryItem?.type === 'spirit' ? <Wine size={28} className={styles.imagePlaceholder} /> : <Droplets size={28} className={styles.imagePlaceholder} />}
        </div>
        <div className={styles.dragHandle}>
          <GripVertical size={12} />
        </div>
      </div>

      {/* Center - Info */}
      <div className={styles.cardCenter}>
        <div className={styles.ingredientHeader}>
          <h4 className={styles.ingredientName}>{name}</h4>
          <span className={`${styles.statusBadge} ${isAvailable ? styles.available : styles.unavailable}`}>
            {isAvailable ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          </span>
        </div>

        <div className={styles.ingredientMeta}>
          <span className={styles.metaItem}>
            <Tag size={12} className={styles.metaIcon} />
            {provider}
          </span>
          <span className={styles.metaItem}>
            <Package size={12} className={styles.metaIcon} />
            Stock: {stock} {unit}
          </span>
        </div>

        {isExpanded && (
          <div className={styles.expandedContent}>
            <div className={styles.expandedRow}>
              <span className={styles.expandedLabel}>Costo unitario:</span>
              <span className={styles.expandedValue}>${cost.toFixed(2)}/{unit}</span>
            </div>
            <div className={styles.expandedRow}>
              <span className={styles.expandedLabel}>Costo total:</span>
              <span className={styles.expandedValue}>${totalCost}</span>
            </div>
            <div className={styles.expandedRow}>
              <span className={styles.expandedLabel}>Categoría:</span>
              <span className={styles.expandedValue}>{inventoryItem?.category || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right - Quantity & Actions */}
      <div className={styles.cardRight}>
        <div className={styles.quantityControl}>
          <button
            className={styles.quantityBtn}
            onClick={() => onUpdate?.({ ...ingredient, quantity: Math.max(0, ingredient.quantity - 5) })}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            className={styles.quantityInput}
            value={ingredient.quantity}
            onChange={(e) => onUpdate?.({ ...ingredient, quantity: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.5"
          />
          <span className={styles.quantityUnit}>{unit}</span>
          <button
            className={styles.quantityBtn}
            onClick={() => onUpdate?.({ ...ingredient, quantity: ingredient.quantity + 5 })}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className={styles.totalCost}><DollarSign size={14} /> {totalCost}</div>

        {isHovered && (
          <div className={styles.cardActions}>
            <button className={styles.actionBtn} onClick={() => setIsExpanded(!isExpanded)} title="Expandir">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <button className={styles.actionBtn} onClick={onMoveUp} title="Mover arriba">
              <ArrowUp size={14} />
            </button>
            <button className={styles.actionBtn} onClick={onMoveDown} title="Mover abajo">
              <ArrowDown size={14} />
            </button>
            <button className={styles.actionBtn} onClick={onDuplicate} title="Duplicar">
              <Copy size={14} />
            </button>
            <button className={styles.actionBtn} onClick={onChangeIngredient} title="Cambiar ingrediente">
              <RefreshCw size={14} />
            </button>
            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={onRemove} title="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
