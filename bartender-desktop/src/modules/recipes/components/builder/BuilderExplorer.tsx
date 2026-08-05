import { useState, memo } from 'react';
import { UtensilsCrossed, Palette, Sparkles, GitBranch, Folder, Search, Plus, Wine, Droplets, Loader2 } from 'lucide-react';
import { useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import { useInventory } from '../../../inventory/hooks/useInventoryQueries';
import styles from './BuilderExplorer.module.css';

type ExplorerTab = 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections';

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
export const BuilderExplorer = memo(function BuilderExplorer() {
  const {
    activeTab,
    setActiveTab,
    inventoryItems,
    handleIngredientAdd,
  } = useRecipeWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Usar hook de inventario si no se proporcionan items por props
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useInventory();
  const items = inventoryItems || inventoryData || [];

  // Load resources based on active tab (TODO: implement content for each tab)
  // const { data: techniques } = useTechniques();
  // const { data: decorations } = useDecorations();
  // const { data: collections } = useCollections();

  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item._id);
    handleIngredientAdd({
      inventoryItem: item,
      quantity: 30,
      unit: item.unit as 'ml' | 'l' | 'g' | 'kg' | 'unit' | 'oz' | 'portion',
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
              onClick={() => setActiveTab(tab.id)}
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
        {inventoryLoading ? (
          <div className={styles.loadingState}>
            <Loader2 size={32} className={styles.loadingIcon} />
            <p className={styles.loadingText}>Cargando inventario...</p>
          </div>
        ) : inventoryError ? (
          <div className={styles.errorState}>
            <p className={styles.errorText}>Error al cargar inventario</p>
          </div>
        ) : filteredItems.length === 0 ? (
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
                  <span className={styles.itemProvider}>{item.provider || 'N/A'}</span>
                  <div className={styles.itemMeta}>
                    <span className={`${styles.itemStatus} ${item.isAvailable !== false ? styles.available : styles.unavailable}`}>
                      {item.isAvailable !== false ? 'Disponible' : 'Sin stock'}
                    </span>
                    <span className={styles.itemStock}>{item.stock || 0} {item.unit || 'ml'}</span>
                  </div>
                  <div className={styles.itemCost}>${(item.cost || 0).toFixed(2)}/{item.unit || 'ml'}</div>
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
