import { useState, memo, useEffect } from 'react';
import { Search, Plus, Wine, Droplets, Package, RefreshCw, Sparkles, Palette, Folder, GitBranch } from 'lucide-react';
import { useRecipeWorkspace } from '../../contexts/RecipeWorkspaceContext';
import { getDrinkProductsWithRecipes, getRecipes } from '../../services/recipeService';
import { getTechniques, getDecorations } from '../../services/techniqueService';
import { getCollections } from '../../services/collectionService';
import type { Technique, Decoration } from '../../types/technique';
import styles from './ExplorerWorkspace.module.css';

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

interface ExplorerWorkspaceProps {
  activeTab: ExplorerTab;
}

/**
 * ExplorerWorkspace - Muestra el contenido de la sección seleccionada
 * Cards, búsqueda, filtros en el área principal
 */
export const ExplorerWorkspace = memo(function ExplorerWorkspace({ activeTab }: ExplorerWorkspaceProps) {
  const { inventoryItems, handleIngredientAdd, updateRecipeField } = useRecipeWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
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

  const items = inventoryItems || [];

  // Load products when products tab is active
  useEffect(() => {
    if (activeTab === 'products') {
      const loadProducts = async () => {
        setProductsLoading(true);
        setProductsError(null);
        try {
          const productsData = await getDrinkProductsWithRecipes({ available: true });
          setProducts(productsData as Product[] || []);
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
    return matchesSearch;
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
    updateRecipeField('product', { _id: product._id || '', name: product.name, type: product.type, price: product.price });
    updateRecipeField('category', product.category);
    updateRecipeField('type', product.type);
  };

  const handleItemClick = (item: InventoryItem) => {
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'products': return 'Productos';
      case 'ingredients': return 'Ingredientes';
      case 'techniques': return 'Técnicas';
      case 'decorations': return 'Decoraciones';
      case 'variants': return 'Variantes';
      case 'collections': return 'Colecciones';
      default: return '';
    }
  };

  const getFilteredCount = () => {
    switch (activeTab) {
      case 'products': return filteredProducts.length;
      case 'ingredients': return filteredItems.length;
      case 'techniques': return filteredTechniques.length;
      case 'decorations': return filteredDecorations.length;
      case 'variants': return filteredVariants.length;
      case 'collections': return filteredCollections.length;
      default: return 0;
    }
  };

  return (
    <div className={styles.explorerWorkspace}>
      {/* Header */}
      <div className={styles.workspaceHeader}>
        <h2 className={styles.workspaceTitle}>{getTabTitle()}</h2>
        <p className={styles.workspaceSubtitle}>
          {getFilteredCount()} elementos disponibles
        </p>
      </div>

      {/* Search and Filters */}
      <div className={styles.workspaceControls}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={`Buscar ${getTabTitle().toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {(activeTab === 'products' || activeTab === 'ingredients' || activeTab === 'techniques' || activeTab === 'decorations') && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas las categorías</option>
            {activeTab === 'products' && (
              <>
                <option value="cocktail">Cócteles</option>
                <option value="shot">Shots</option>
                <option value="mocktail">Mocktails</option>
              </>
            )}
            {activeTab === 'ingredients' && (
              <>
                <option value="spirit">Espirituosos</option>
                <option value="liqueur">Licores</option>
                <option value="mixer">Mixers</option>
                <option value="fruit">Frutas</option>
                <option value="garnish">Guarniciones</option>
              </>
            )}
            {activeTab === 'techniques' && (
              <>
                <option value="shake">Shake</option>
                <option value="stir">Stir</option>
                <option value="build">Build</option>
                <option value="blend">Blend</option>
              </>
            )}
            {activeTab === 'decorations' && (
              <>
                <option value="garnish">Guarnición</option>
                <option value="glassware">Vajilla</option>
                <option value="presentation">Presentación</option>
              </>
            )}
          </select>
        )}
      </div>

      {/* Content */}
      <div className={styles.workspaceContent}>
        {activeTab === 'products' && (
          <>
            {productsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className={styles.skeletonCard}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonTitle} />
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
                    key={product._id || product.name}
                    className={styles.itemCard}
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
        )}

        {activeTab === 'ingredients' && (
          <>
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No se encontraron ingredientes</p>
              </div>
            ) : (
              <div className={styles.itemsGrid}>
                {filteredItems.map((item) => (
                  <div
                    key={item._id || item.name}
                    className={styles.itemCard}
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
        )}

        {activeTab === 'techniques' && (
          <>
            {techniquesLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                    className={styles.itemCard}
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
        )}

        {activeTab === 'decorations' && (
          <>
            {decorationsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                    className={styles.itemCard}
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
        )}

        {activeTab === 'collections' && (
          <>
            {collectionsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                    className={styles.itemCard}
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
        )}

        {activeTab === 'variants' && (
          <>
            {variantsLoading ? (
              <div className={styles.skeletonGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
                    className={styles.itemCard}
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
        )}
      </div>
    </div>
  );
});
