import { useState } from 'react';
import type { Recipe } from '../../types';
import { useRecipeTechniques } from '../../hooks';

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
    <div className="explorer-panel">
      <div className="explorer-tabs">
        <button
          className={`explorer-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
          onClick={() => onTabChange('ingredients')}
        >
          🥗 Ingredientes
        </button>
        <button
          className={`explorer-tab ${activeTab === 'techniques' ? 'active' : ''}`}
          onClick={() => onTabChange('techniques')}
        >
          🎯 Técnicas
        </button>
        <button
          className={`explorer-tab ${activeTab === 'decorations' ? 'active' : ''}`}
          onClick={() => onTabChange('decorations')}
        >
          ✨ Decoraciones
        </button>
        <button
          className={`explorer-tab ${activeTab === 'variants' ? 'active' : ''}`}
          onClick={() => onTabChange('variants')}
        >
          🔀 Variantes
        </button>
      </div>

      <div className="explorer-search">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="explorer-content">
        {activeTab === 'ingredients' && (
          <div className="explorer-list">
            {filteredInventory.map((item) => (
              <div
                key={item._id}
                className="explorer-item"
                draggable
                onDragStart={(e) => handleDragStart(e, item, 'ingredient')}
                onClick={() => onIngredientAdd({
                  inventoryItem: item,
                  quantity: 1,
                  unit: item.unit || 'ml',
                })}
              >
                <div className="item-icon">{item.image ? <img src={item.image} alt={item.name} /> : '🥗'}</div>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-stock">Stock: {item.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="explorer-list">
            {filteredTechniques.map((tech) => (
              <div
                key={tech._id || tech.name}
                className="explorer-item"
                draggable
                onDragStart={(e) => handleDragStart(e, tech, 'technique')}
              >
                <div className="item-icon">{tech.icon}</div>
                <div className="item-info">
                  <span className="item-name">{tech.name}</span>
                  <span className="item-category">{tech.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'decorations' && (
          <div className="explorer-list">
            {filteredDecorations.map((dec) => (
              <div
                key={dec._id || dec.name}
                className="explorer-item"
                draggable
                onDragStart={(e) => handleDragStart(e, dec, 'decoration')}
              >
                <div className="item-icon">{dec.icon}</div>
                <div className="item-info">
                  <span className="item-name">{dec.name}</span>
                  <span className="item-type">{dec.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="explorer-list">
            <p className="explorer-empty">Crear variantes desde el panel de variantes</p>
          </div>
        )}
      </div>
    </div>
  );
}
