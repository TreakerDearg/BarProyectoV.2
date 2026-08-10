import { useState, memo, useEffect } from 'react';
import { UtensilsCrossed, Palette, Sparkles, GitBranch, Folder, Search, Plus, Wine, Droplets, Package, RefreshCw } from 'lucide-react';
import { useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import { useInventory } from '../../../inventory/hooks/useInventoryQueries';
import { getDrinkProductsWithRecipes, getRecipes } from '../../services/recipeService';
import { getTechniques, getDecorations } from '../../services/techniqueService';
import { getCollections } from '../../services/collectionService';
import type { Technique, Decoration } from '../../types/technique';
import styles from './BuilderExplorer.module.css';

type ExplorerTab = 'products' | 'ingredients' | 'techniques' | 'decorations' | 'variants' | 'collections';

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

interface Product {
  _id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  available: boolean;
  image?: string;
  hasRecipe: boolean;
}

interface Collection {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface VariantRecipe {
  _id: string;
  name: string;
  variantName: string;
  parentId: string | null;
  isPrimary: boolean;
  product: any;
  category?: string;
}

const tabs = [
  { id: 'products' as ExplorerTab, icon: Package, label: 'Productos', count: 0 },
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
    updateRecipeField,
  } = useRecipeWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [retryCount, setRetryCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [techniquesLoading, setTechniquesLoading] = useState(false);
  const [techniquesError, setTechniquesError] = useState<string | null>(null);

  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [decorationsLoading, setDecorationsLoading] = useState(false);
  const [decorationsError, setDecorationsError] = useState<string | null>(null);
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  
  const [variants, setVariants] = useState<VariantRecipe[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantsError, setVariantsError] = useState<string | null>(null);

  // Usar hook de inventario si no se proporcionan items por props
  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useInventory();
  const items = inventoryItems || inventoryData || [];

  // Load products when products tab is active
  useEffect(() => {
    if (activeTab === 'products') {
      const loadProducts = async () => {
        setProductsLoading(true);
        setProductsError(null);
        try {
          const productsData = await getDrinkProductsWithRecipes({ available: true });
          setProducts(productsData || []);
        } catch (error) {
          setProductsError('Error al cargar productos');
        } finally {
          setProductsLoading(false);
        }
      };
      loadProducts();
    }
  }, [activeTab, retryCount]);
  
  // Load techniques when techniques tab is active
  useEffect(() => {
    if (activeTab === 'techniques') {
      const loadTechniques = async () => {
        setTechniquesLoading(true);
        setTechniquesError(null);
        try {
          const techniquesData = await getTechniques();
          setTechniques(techniquesData as Technique[] || []);
        } catch (error) {
          setTechniquesError('Error al cargar técnicas');
        } finally {
          setTechniquesLoading(false);
        }
      };
      loadTechniques();
    }
  }, [activeTab, retryCount]);
  
  // Load decorations when decorations tab is active
  useEffect(() => {
    if (activeTab === 'decorations') {
      const loadDecorations = async () => {
        setDecorationsLoading(true);
        setDecorationsError(null);
        try {
          const decorationsData = await getDecorations();
          setDecorations(decorationsData as Decoration[] || []);
        } catch (error) {
          setDecorationsError('Error al cargar decoraciones');
        } finally {
          setDecorationsLoading(false);
        }
      };
      loadDecorations();
    }
  }, [activeTab, retryCount]);
  
  // Load collections when collections tab is active
  useEffect(() => {
    if (activeTab === 'collections') {
      const loadCollections = async () => {
        setCollectionsLoading(true);
        setCollectionsError(null);
        try {
          const collectionsData = await getCollections();
          setCollections(collectionsData as Collection[] || []);
        } catch (error) {
          setCollectionsError('Error al cargar colecciones');
        } finally {
          setCollectionsLoading(false);
        }
      };
      loadCollections();
    }
  }, [activeTab, retryCount]);
  
  // Load variants when variants tab is active
  useEffect(() => {
    if (activeTab === 'variants') {
      const loadVariants = async () => {
        setVariantsLoading(true);
        setVariantsError(null);
        try {
          const allRecipes = await getRecipes({ type: 'drink' });
          const variantRecipes = (allRecipes || [])
            .filter((r: any) => !r.isPrimary && r.parentId)
            .map((r: any): VariantRecipe => ({
              _id: r._id,
              name: r.name || r.product?.name || 'Variant',
              variantName: r.variantName || r.name,
              parentId: r.parentId,
              isPrimary: r.isPrimary || false,
              product: r.product,
              category: r.category,
            }));
          setVariants(variantRecipes);
        } catch (error) {
          setVariantsError('Error al cargar variantes');
        } finally {
          setVariantsLoading(false);
        }
      };
      loadVariants();
    }
  }, [activeTab, retryCount]);


  const filteredItems = (items || []).filter((item: any) => {
    if (!item) return false;
    const matchesSearch = item.isActive !== false && (
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredProducts = (products || []).filter((product: Product) => {
    if (!product) return false;
    const matchesSearch = product.type === 'drink' && (
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTechniques = (techniques || []).filter((technique: Technique) => {
    if (!technique) return false;
    const matchesSearch = technique.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (technique.category && technique.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || (technique.category && technique.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredDecorations = (decorations || []).filter((decoration: Decoration) => {
    if (!decoration) return false;
    const matchesSearch = decoration.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (decoration.category && decoration.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || (decoration.category && decoration.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredCollections = (collections || []).filter((collection: Collection) => {
    if (!collection) return false;
    return collection.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredVariants = (variants || []).filter((variant: VariantRecipe) => {
    if (!variant) return false;
    const matchesSearch = variant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (variant.variantName && variant.variantName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || (variant.category && variant.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product: Product) => {
    setSelectedItem(product._id || null);
    updateRecipeField('product', { _id: product._id || '', name: product.name, type: product.type, price: product.price });
    updateRecipeField('category', product.category);
    updateRecipeField('type', product.type);
    // Switch to ingredients tab after selecting product
    setActiveTab('ingredients');
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item._id || null);
    // Use a reasonable default based on unit type
    const defaultQuantity = getDefaultQuantity(item.unit);
    handleIngredientAdd({
      inventoryItem: item,
      quantity: defaultQuantity,
      unit: item.unit as 'ml' | 'l' | 'g' | 'kg' | 'unit' | 'oz' | 'portion',
    });
  };

  function getDefaultQuantity(unit: string): number {
    switch (unit.toLowerCase()) {
      case 'ml': return 30;
      case 'l': return 0.03;
      case 'g': return 15;
      case 'kg': return 0.015;
      case 'oz': return 1;
      case 'portion': return 1;
      case 'unit': return 1;
      default: return 30;
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
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

      {/* Filters */}
      {(activeTab === 'products' || activeTab === 'ingredients' || activeTab === 'techniques' || activeTab === 'decorations' || activeTab === 'variants') && (
        <div className={styles.explorerFilters}>
          <select
            className={styles.filterSelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {activeTab === 'products' && (
              <>
                <option value="Cócteles Clásicos">Cócteles Clásicos</option>
                <option value="Cócteles Modernos">Cócteles Modernos</option>
                <option value="Shots">Shots</option>
                <option value="Mocktails">Mocktails</option>
              </>
            )}
            {activeTab === 'ingredients' && (
              <>
                <option value="spirit">Espirituosos</option>
                <option value="liqueur">Licores</option>
                <option value="mixer">Mixers</option>
                <option value="juice">Jugos</option>
                <option value="syrup">Jarabes</option>
                <option value="garnish">Guarniciones</option>
              </>
            )}
            {activeTab === 'techniques' && (
              <>
                <option value="shake">Shake</option>
                <option value="stir">Stir</option>
                <option value="muddle">Muddle</option>
                <option value="build">Build</option>
                <option value="layer">Layer</option>
              </>
            )}
            {activeTab === 'decorations' && (
              <>
                <option value="fruit">Frutas</option>
                <option value="herb">Hierbas</option>
                <option value="spice">Especias</option>
                <option value="edible">Comestibles</option>
              </>
            )}
            {activeTab === 'variants' && (
              <>
                <option value="seasonal">Estacional</option>
                <option value="signature">Firma</option>
                <option value="classic">Clásico</option>
              </>
            )}
          </select>
          {activeTab === 'ingredients' && (
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="spirit">Espirituosos</option>
              <option value="liqueur">Licores</option>
              <option value="mixer">Mixers</option>
              <option value="juice">Jugos</option>
              <option value="syrup">Jarabes</option>
              <option value="garnish">Guarniciones</option>
            </select>
          )}
          {(filterCategory !== 'all' || filterType !== 'all') && (
            <button
              className={styles.clearFilters}
              onClick={() => {
                setFilterCategory('all');
                setFilterType('all');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.explorerContent}>
        {activeTab === 'products' ? (
          <>
            {productsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsError ? (
              <div className={styles.errorState}>
                <RefreshCw size={32} className={styles.errorIcon} />
                <p className={styles.errorText}>{productsError}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron productos</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className={`${styles.itemCard} ${selectedItem === product._id ? styles.selected : ''}`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className={styles.itemImage}>
                      <Package size={24} className={styles.imagePlaceholder} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{product.name}</h4>
                      <span className={styles.itemProvider}>{product.category}</span>
                      <div className={styles.itemMeta}>
                        <span className={`${styles.itemStatus} ${product.available ? styles.available : styles.unavailable}`}>
                          {product.available ? 'Disponible' : 'No disponible'}
                        </span>
                        <span className={styles.itemStock}>${product.price.toFixed(2)}</span>
                      </div>
                      <div className={styles.itemCost}>{product.type === 'drink' ? '🍸' : '🍰'}</div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.actionBtn} title="Seleccionar">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'ingredients' ? (
          <>
            {inventoryLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                ))}
              </div>
            ) : inventoryError ? (
              <div className={styles.errorState}>
                <RefreshCw size={32} className={styles.errorIcon} />
                <p className={styles.errorText}>Error al cargar ingredientes</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron ingredientes</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredItems.map((item) => (
                  <div
                    key={item._id || item.name}
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
          </>
        ) : activeTab === 'techniques' ? (
          <>
            {techniquesLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                ))}
              </div>
            ) : techniquesError ? (
              <div className={styles.errorState}>
                <RefreshCw size={32} className={styles.errorIcon} />
                <p className={styles.errorText}>{techniquesError}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : filteredTechniques.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron técnicas</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredTechniques.map((technique) => (
                  <div
                    key={technique._id || technique.name}
                    className={`${styles.itemCard} ${selectedItem === technique._id ? styles.selected : ''}`}
                    onClick={() => setSelectedItem(technique._id || null)}
                  >
                    <div className={styles.itemImage}>
                      <Palette size={24} className={styles.imagePlaceholder} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{technique.name}</h4>
                      <span className={styles.itemProvider}>{technique.category}</span>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemStock}>{technique.difficulty}</span>
                        <span className={styles.itemStock}>{technique.time} min</span>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.actionBtn} title="Seleccionar">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'decorations' ? (
          <>
            {decorationsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                ))}
              </div>
            ) : decorationsError ? (
              <div className={styles.errorState}>
                <RefreshCw size={32} className={styles.errorIcon} />
                <p className={styles.errorText}>{decorationsError}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : filteredDecorations.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron decoraciones</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredDecorations.map((decoration) => (
                  <div
                    key={decoration._id || decoration.name}
                    className={`${styles.itemCard} ${selectedItem === decoration._id ? styles.selected : ''}`}
                    onClick={() => setSelectedItem(decoration._id || null)}
                  >
                    <div className={styles.itemImage}>
                      <Sparkles size={24} className={styles.imagePlaceholder} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{decoration.name}</h4>
                      <span className={styles.itemProvider}>{decoration.category}</span>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemStock}>{decoration.type}</span>
                      </div>
                      <div className={styles.itemCost}>${(decoration.cost || 0).toFixed(2)}</div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.actionBtn} title="Seleccionar">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'collections' ? (
          <>
            {collectionsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                ))}
              </div>
            ) : collectionsError ? (
              <div className={styles.errorState}>
                <RefreshCw size={32} className={styles.errorIcon} />
                <p className={styles.errorText}>{collectionsError}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron colecciones</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredCollections.map((collection) => (
                  <div
                    key={collection._id || collection.name}
                    className={`${styles.itemCard} ${selectedItem === collection._id ? styles.selected : ''}`}
                    onClick={() => setSelectedItem(collection._id || null)}
                  >
                    <div className={styles.itemImage}>
                      <Folder size={24} className={styles.imagePlaceholder} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{collection.name}</h4>
                      <span className={styles.itemProvider}>{collection.description || ''}</span>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemStock}>{collection.isSystem ? 'Sistema' : 'Personal'}</span>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.actionBtn} title="Seleccionar">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'variants' ? (
          <>
            {variantsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonMeta} />
                    </div>
                  </div>
                ))}
              </div>
            ) : variantsError ? (
              <div className={styles.errorState}>
                <RefreshCw size={32} className={styles.errorIcon} />
                <p className={styles.errorText}>{variantsError}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            ) : filteredVariants.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron variantes</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredVariants.map((variant) => (
                  <div
                    key={variant._id || variant.name}
                    className={`${styles.itemCard} ${selectedItem === variant._id ? styles.selected : ''}`}
                    onClick={() => setSelectedItem(variant._id || null)}
                  >
                    <div className={styles.itemImage}>
                      <GitBranch size={24} className={styles.imagePlaceholder} />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{variant.variantName || variant.name}</h4>
                      <span className={styles.itemProvider}>{variant.product?.name || 'Sin producto'}</span>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemStock}>Variante</span>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button className={styles.actionBtn} title="Seleccionar">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
});
