import { useState, memo } from 'react';
import { UtensilsCrossed, Palette, Sparkles, GitBranch, Folder, Search, Plus, Wine, Droplets } from 'lucide-react';
import type { Recipe } from '../../types';
import styles from './BuilderExplorer.module.css';

type ExplorerTab = 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections';

interface BuilderExplorerProps {
  activeTab: ExplorerTab;
  onTabChange: (tab: ExplorerTab) => void;
  inventoryItems: any[];
  onIngredientAdd?: (ingredient: any) => void;
  recipe: Recipe;
}

interface InventoryItem {
  _id: string;
  name: string;
  type: string;
  category: string;
  cost: number;
  stock: number;
  unit: string;
  provider: string;
  image?: string;
  isAvailable: boolean;
}

const tabs = [
  { id: 'ingredients' as ExplorerTab, icon: UtensilsCrossed, label: 'Ingredientes', count: 0 },
  { id: 'techniques' as ExplorerTab, icon: Palette, label: 'Técnicas', count: 0 },
  { id: 'decorations' as ExplorerTab, icon: Sparkles, label: 'Decoraciones', count: 0 },
  { id: 'variants' as ExplorerTab, icon: GitBranch, label: 'Variantes', count: 0 },
  { id: 'collections' as ExplorerTab, icon: Folder, label: 'Colecciones', count: 0 },
];

/**
 * BuilderExplorer - Panel estilo Assets de Figma
 * Tabs, buscador, tarjetas de elementos
 */
export const BuilderExplorer = memo(function BuilderExplorer({
  activeTab,
  onTabChange,
  inventoryItems,
  onIngredientAdd,
  recipe,
}: BuilderExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const mockInventoryItems: InventoryItem[] = [
    {
      _id: '1',
      name: 'Vodka Absolut',
      type: 'spirit',
      category: 'Licores',
      cost: 2.50,
      stock: 100,
      unit: 'ml',
      provider: 'Diageo',
      isAvailable: true,
    },
    {
      _id: '2',
      name: 'Gin Tanqueray',
      type: 'spirit',
      category: 'Licores',
      cost: 3.00,
      stock: 85,
      unit: 'ml',
      provider: 'Diageo',
      isAvailable: true,
    },
    {
      _id: '3',
      name: 'Ron Bacardi',
      type: 'spirit',
      category: 'Licores',
      cost: 1.80,
      stock: 120,
      unit: 'ml',
      provider: 'Bacardi',
      isAvailable: true,
    },
    {
      _id: '4',
      name: 'Jugo de Limón',
      type: 'mixer',
      category: 'Mixers',
      cost: 0.30,
      stock: 2000,
      unit: 'ml',
      provider: 'Local',
      isAvailable: true,
    },
    {
      _id: '5',
      name: 'Jarabe de Azúcar',
      type: 'mixer',
      category: 'Mixers',
      cost: 0.20,
      stock: 1500,
      unit: 'ml',
      provider: 'Local',
      isAvailable: true,
    },
  ];

  const filteredItems = mockInventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item._id);
    onIngredientAdd?.({
      inventoryItem: item,
      quantity: 30,
      unit: item.unit,
    });
  };

  return (
    <div className={styles.builderExplorer}>
      {/* Tabs */}
      <div className={styles.explorerTabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} className={styles.tabIcon} />
              <span className={styles.tabLabel}>{tab.label}</span>
              <span className={styles.tabCount}>{tab.count}</span>
              {activeTab === tab.id && <span className={styles.tabIndicator} />}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className={styles.explorerSearch}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className={styles.explorerContent}>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>No se encontraron resultados</p>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`${styles.itemCard} ${selectedItem === item._id ? styles.selected : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className={styles.itemImage}>
                  {item.type === 'spirit' ? <Wine size={24} className={styles.imagePlaceholder} /> : <Droplets size={24} className={styles.imagePlaceholder} />}
                </div>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <span className={styles.itemProvider}>{item.provider}</span>
                  <div className={styles.itemMeta}>
                    <span className={`${styles.itemStatus} ${item.isAvailable ? styles.available : styles.unavailable}`}>
                      {item.isAvailable ? 'Disponible' : 'Sin stock'}
                    </span>
                    <span className={styles.itemStock}>{item.stock} {item.unit}</span>
                  </div>
                  <div className={styles.itemCost}>${item.cost.toFixed(2)}/{item.unit}</div>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.actionBtn} title="Añadir">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
