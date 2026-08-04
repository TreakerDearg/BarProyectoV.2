import { useState } from 'react';
import type { Recipe } from '../../types';
import { useRecipeTechniques } from '../../hooks';
import styles from './ExplorerPanel.module.css';

interface ExplorerPanelProps {
  activeTab: 'ingredients' | 'techniques' | 'decorations' | 'variants';
  onTabChange: (tab: 'ingredients' | 'techniques' | 'decorations' | 'variants') => void;
  inventoryItems: any[];
  onIngredientAdd: (ingredient: any) => void;
  recipe: Recipe;
}

/**
 * ExplorerPanel - Panel lateral con Ingredientes, Técnicas, Decoraciones, Variantes
 * Búsqueda inteligente y drag & drop
 */
export function ExplorerPanel({ activeTab, onTabChange, inventoryItems, onIngredientAdd, recipe }: ExplorerPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { techniques, decorations, getTechniqueById } = useRecipeTechniques({});

  const filteredInventory = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTechniques = techniques.filter((tech) =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDecorations = decorations.filter((dec) =>
    dec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: any, item: any, type: 'ingredient' | 'technique' | 'decoration') => {
    e.dataTransfer.setData('application/json', JSON.stringify({ item, type }));
  };

  return (
    <div className={styles.explorerPanel}>
      <div className={styles.explorerTabs}>
        <button
          className={`${styles.explorerTab} ${activeTab === 'ingredients' ? styles.active : ''}`}
          onClick={() => onTabChange('ingredients')}
        >
          🥗 Ingredientes
        </button>
        <button
          className={`${styles.explorerTab} ${activeTab === 'techniques' ? styles.active : ''}`}
          onClick={() => onTabChange('techniques')}
        >
          🎯 Técnicas
        </button>
        <button
          className={`${styles.explorerTab} ${activeTab === 'decorations' ? styles.active : ''}`}
          onClick={() => onTabChange('decorations')}
        >
          ✨ Decoraciones
        </button>
        <button
          className={`${styles.explorerTab} ${activeTab === 'variants' ? styles.active : ''}`}
          onClick={() => onTabChange('variants')}
        >
          🔀 Variantes
        </button>
      </div>

      <div className={styles.explorerSearch}>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.explorerContent}>
        {activeTab === 'ingredients' && (
          <div className={styles.explorerList}>
            {filteredInventory.map((item) => (
              <div
                key={item._id}
                className={styles.explorerItem}
                draggable
                onDragStart={(e) => handleDragStart(e, item, 'ingredient')}
                onClick={() => onIngredientAdd({
                  inventoryItem: item,
                  quantity: 1,
                  unit: item.unit || 'ml',
                })}
              >
                <div className={styles.itemIcon}>{item.image ? <img src={item.image} alt={item.name} /> : '🥗'}</div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemStock}>Stock: {item.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className={styles.explorerList}>
            {filteredTechniques.map((tech) => (
              <div
                key={tech._id || tech.name}
                className={styles.explorerItem}
                draggable
                onDragStart={(e) => handleDragStart(e, tech, 'technique')}
              >
                <div className={styles.itemIcon}>{tech.icon}</div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{tech.name}</span>
                  <span className={styles.itemCategory}>{tech.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'decorations' && (
          <div className={styles.explorerList}>
            {filteredDecorations.map((dec) => (
              <div
                key={dec._id || dec.name}
                className={styles.explorerItem}
                draggable
                onDragStart={(e) => handleDragStart(e, dec, 'decoration')}
              >
                <div className={styles.itemIcon}>{dec.icon}</div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{dec.name}</span>
                  <span className={styles.itemType}>{dec.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'variants' && (
          <div className={styles.explorerList}>
            <p className={styles.explorerEmpty}>Crear variantes desde el panel de variantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
