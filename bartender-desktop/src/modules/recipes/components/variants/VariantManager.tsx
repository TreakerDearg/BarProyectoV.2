import { useState, useMemo, useEffect } from 'react';
import type { Recipe, RecipeVariant, RecipeTree } from '../../types';
import { useRecipeVariants, useRecipeInheritance, useRecipeCost, useRecipeHealthScore } from '../../hooks';
import { GitBranch, GitMerge, Plus, GitCompare, ChevronRight, ChevronDown, Star, Clock, DollarSign, Activity, AlertTriangle, TrendingUp, BarChart3, Package, CheckCircle, XCircle, X } from 'lucide-react';
import { DiffViewer, DiffBadge, type DiffItem, type DiffType } from './DiffViewer';
import { VariantTimeline, type TimelineEvent } from './VariantTimeline';
import { VariantCard } from './VariantCard';
import { NewVariantWizard } from './NewVariantWizard';
import { VariantAnalytics } from './VariantAnalytics';
import { getBeverageProducts } from '../../../products/services/productService';
import { getRecipes, createRecipeVariant } from '../../services/recipeService';
import styles from './VariantManager.module.css';

interface VariantManagerProps {
  recipes: Recipe[];
  masterRecipeId?: string;
  onVariantSelect?: (variant: Recipe) => void;
  onCreateVariant?: (variant: Partial<Recipe>) => void;
  onCompare?: (recipeA: Recipe, recipeB: Recipe) => void;
}

type ProductView = 'products' | 'variants';
type ProductFilter = 'all' | 'with-recipe' | 'without-recipe';

type InspectorTab = 'overview' | 'inheritance' | 'health' | 'costs' | 'relations' | 'versions' | 'warnings' | 'analytics';

/**
 * VariantManager - Sistema profesional de gestión de variantes
 * Inspirado en GitHub Branches, Figma Components, Notion Database
 */
export function VariantManager({
  recipes,
  masterRecipeId,
  onVariantSelect,
  onCreateVariant,
  onCompare,
}: VariantManagerProps) {
  const { masterRecipes, variantsByMaster, recipeTree, allVariants } = useRecipeVariants({
    recipes,
    masterRecipeId,
  });

  const [selectedVariant, setSelectedVariant] = useState<Recipe | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareVariant, setCompareVariant] = useState<Recipe | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('overview');
  const [showWizard, setShowWizard] = useState(false);
  
  // New state for beverage products view
  const [productView, setProductView] = useState<ProductView>('products');
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [beverageProducts, setBeverageProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const masterRecipe = recipeTree?.master;
  const variants = recipeTree?.variants || [];

  // Load all beverage products
  useEffect(() => {
    const loadBeverageProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const products = await getBeverageProducts();
        setBeverageProducts(products || []);
      } catch (error) {
        console.error('[VariantManager] Error loading beverage products:', error);
        setProductsError('Error al cargar productos bebida');
      } finally {
        setProductsLoading(false);
      }
    };
    loadBeverageProducts();
  }, []);

  // Load available recipes when selector opens
  useEffect(() => {
    const loadRecipes = async () => {
      if (!showRecipeSelector) return;
      setRecipesLoading(true);
      try {
        const recipes = await getRecipes({ type: 'drink' });
        setAvailableRecipes(recipes || []);
      } catch (error) {
        console.error('[VariantManager] Error loading recipes:', error);
      } finally {
        setRecipesLoading(false);
      }
    };
    loadRecipes();
  }, [showRecipeSelector]);

  // Filter products based on recipe assignment
  const filteredProducts = useMemo(() => {
    return beverageProducts.filter((product: any) => {
      const hasRecipe = !!product.recipeId;
      if (productFilter === 'with-recipe') return hasRecipe;
      if (productFilter === 'without-recipe') return !hasRecipe;
      return true; // 'all'
    });
  }, [beverageProducts, productFilter]);

  // Filter recipes by search query
  const filteredRecipes = useMemo(() => {
    if (!recipeSearchQuery) return availableRecipes;
    const query = recipeSearchQuery.toLowerCase();
    return availableRecipes.filter(recipe => 
      recipe.product?.name?.toLowerCase().includes(query) ||
      recipe.category?.toLowerCase().includes(query)
    );
  }, [availableRecipes, recipeSearchQuery]);

  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleVariantSelect = (variant: Recipe) => {
    setSelectedVariant(variant);
    onVariantSelect?.(variant);
  };

  const handleCompare = (variant: Recipe) => {
    setCompareVariant(variant);
    setCompareMode(true);
    onCompare?.(masterRecipe || recipes[0], variant);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    if (!product.recipeId) {
      // Product without recipe - show recipe selector
      setShowRecipeSelector(true);
    } else {
      // Product with recipe - could show variant creation option
      // For now, just select it
    }
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!selectedProduct) {
      console.error('[VariantManager] No product selected');
      return;
    }

    try {
      const variant = await createRecipeVariant(recipe._id, {
        productId: selectedProduct._id,
        variantName: `${selectedProduct.name} - Variante`
      });
      
      // Refresh beverage products to update recipe status
      const products = await getBeverageProducts();
      setBeverageProducts(products || []);
      
      setShowRecipeSelector(false);
      setSelectedRecipe(null);
    } catch (error) {
      console.error('[VariantManager] Error creating variant:', error);
    }
  };

  const inheritedData = useMemo(() => {
    if (!selectedVariant || !masterRecipe) return null;
    return useRecipeInheritance({ variant: selectedVariant, masterRecipe });
  }, [selectedVariant, masterRecipe]);

  const costData = useMemo(() => {
    if (!selectedVariant) return null;
    return useRecipeCost(selectedVariant.ingredients || []);
  }, [selectedVariant]);

  const healthData = useMemo(() => {
    if (!selectedVariant) return null;
    return useRecipeHealthScore(selectedVariant);
  }, [selectedVariant]);

  return (
    <div className={styles.variantManager}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitle}>
            <GitBranch className={styles.headerIcon} />
            <h1>Variant Manager</h1>
          </div>
          <div className={styles.headerBreadcrumb}>
            <span className={styles.breadcrumbItem}>Library</span>
            <ChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbItem}>{masterRecipe?.product?.name || 'Recipes'}</span>
            <ChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbActive}>Variants</span>
          </div>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <Star className={styles.statIcon} />
            <span>{masterRecipe?.product?.name || 'Master'}</span>
          </div>
          <div className={styles.statBadge}>
            <GitBranch className={styles.statIcon} />
            <span>{variants.length} Variants</span>
          </div>
          <div className={styles.statBadge}>
            <Activity className={styles.statIcon} />
            <span>Active</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.actionButton} 
            onClick={() => setProductView(productView === 'products' ? 'variants' : 'products')}
          >
            <Package className={styles.buttonIcon} />
            {productView === 'products' ? 'View Variants' : 'View Products'}
          </button>
          <button className={styles.actionButton} onClick={() => setShowWizard(true)}>
            <Plus className={styles.buttonIcon} />
            New Variant
          </button>
          <button className={styles.actionButton} onClick={() => setCompareMode(!compareMode)}>
            <GitCompare className={styles.buttonIcon} />
            Compare
          </button>
          <button className={styles.actionButton}>
            <GitMerge className={styles.buttonIcon} />
            Merge
          </button>
          <button className={styles.actionButton}>
            <TrendingUp className={styles.buttonIcon} />
            Publish
          </button>
        </div>
      </header>

      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Seleccionar Receta</h2>
              <button className={styles.closeButton} onClick={() => setShowRecipeSelector(false)}>
                <X className={styles.closeIcon} />
              </button>
            </div>
            <div className={styles.modalSearch}>
              <input
                type="text"
                placeholder="Buscar receta..."
                value={recipeSearchQuery}
                onChange={(e) => setRecipeSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.modalRecipesList}>
              {recipesLoading ? (
                <div className={styles.loadingState}>Cargando recetas...</div>
              ) : filteredRecipes.length === 0 ? (
                <div className={styles.emptyState}>No se encontraron recetas</div>
              ) : (
                filteredRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className={`${styles.recipeItem} ${selectedRecipe?._id === recipe._id ? styles.selected : ''}`}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <div className={styles.recipeItemInfo}>
                      <div className={styles.recipeItemName}>{recipe.product?.name}</div>
                      <div className={styles.recipeItemMeta}>
                        <span className={styles.recipeItemCategory}>{recipe.category}</span>
                        {recipe.isPrimary && <span className={styles.primaryBadge}>PRIMARIA</span>}
                        {!recipe.isPrimary && <span className={styles.variantBadge}>VARIANTE</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Products View */}
        {productView === 'products' && (
          <aside className={styles.variantTree}>
            <div className={styles.treeHeader}>
              <h2>Beverage Products</h2>
              <div className={styles.filterButtons}>
                <button 
                  className={`${styles.filterButton} ${productFilter === 'all' ? styles.active : ''}`}
                  onClick={() => setProductFilter('all')}
                >
                  All ({beverageProducts.length})
                </button>
                <button 
                  className={`${styles.filterButton} ${productFilter === 'with-recipe' ? styles.active : ''}`}
                  onClick={() => setProductFilter('with-recipe')}
                >
                  With Recipe
                </button>
                <button 
                  className={`${styles.filterButton} ${productFilter === 'without-recipe' ? styles.active : ''}`}
                  onClick={() => setProductFilter('without-recipe')}
                >
                  Without Recipe
                </button>
              </div>
            </div>
            <div className={styles.treeContent}>
              {productsLoading ? (
                <div className={styles.loadingState}>Loading beverages...</div>
              ) : productsError ? (
                <div className={styles.errorState}>{productsError}</div>
              ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>No beverages found</div>
              ) : (
                filteredProducts.map((product: any) => (
                  <div 
                    key={product._id}
                    className={`${styles.productItem} ${selectedProduct?._id === product._id ? styles.selected : ''}`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productMeta}>
                        <span className={styles.productCategory}>{product.category}</span>
                        {product.recipeId ? (
                          <span className={styles.recipeStatus withRecipe}>
                            <CheckCircle className={styles.statusIcon} />
                            Has Recipe
                          </span>
                        ) : (
                          <span className={styles.recipeStatus withoutRecipe}>
                            <XCircle className={styles.statusIcon} />
                            No Recipe
                          </span>
                        )}
                      </div>
                    </div>
                    {!product.recipeId && (
                      <button className={styles.assignButton}>
                        Assign Recipe
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Variant Tree */}
        {productView === 'variants' && (
          <aside className={styles.variantTree}>
            <div className={styles.treeHeader}>
              <h2>Variant Tree</h2>
            </div>
            <div className={styles.treeContent}>
              {masterRecipe && (
                <VariantTreeNode
                  recipe={masterRecipe}
                  variants={variants}
                  variantsByMaster={variantsByMaster}
                  expandedNodes={expandedNodes}
                  onToggle={handleNodeToggle}
                  onSelect={handleVariantSelect}
                  onCompare={handleCompare}
                  selectedId={selectedVariant?._id}
                  depth={0}
                  isMaster
                />
              )}
            </div>
          </aside>
        )}

        {/* Variant Workspace */}
        <main className={styles.variantWorkspace}>
          {selectedVariant ? (
            <VariantWorkspace
              variant={selectedVariant}
              masterRecipe={masterRecipe}
              inheritedData={inheritedData}
              costData={costData}
              healthData={healthData}
            />
          ) : (
            <div className={styles.emptyWorkspace}>
              <GitBranch className={styles.emptyIcon} />
              <h2>Select a Variant</h2>
              <p>Choose a variant from the tree to view its details</p>
            </div>
          )}
        </main>

        {/* Comparison Panel */}
        {compareMode && (
          <section className={styles.comparisonPanel}>
            <ComparisonPanel
              recipeA={masterRecipe || recipes[0]}
              recipeB={compareVariant || selectedVariant || recipes[0]}
            />
          </section>
        )}

        {/* Inspector */}
        <aside className={styles.inspector}>
          <Inspector
            tab={inspectorTab}
            onTabChange={setInspectorTab}
            variant={selectedVariant}
            masterRecipe={masterRecipe}
            inheritedData={inheritedData}
            costData={costData}
            healthData={healthData}
          />
        </aside>
      </div>

      {/* New Variant Wizard */}
      {showWizard && (
        <NewVariantWizardWrapper
          masterRecipe={masterRecipe || recipes[0]}
          onClose={() => setShowWizard(false)}
          onCreate={onCreateVariant}
        />
      )}
    </div>
  );
}

// Variant Tree Node Component
interface VariantTreeNodeProps {
  recipe: Recipe;
  variants: RecipeVariant[];
  variantsByMaster: Map<string, RecipeVariant[]>;
  expandedNodes: Set<string>;
  onToggle: (nodeId: string) => void;
  onSelect: (recipe: Recipe) => void;
  onCompare: (recipe: Recipe) => void;
  selectedId?: string;
  depth: number;
  isMaster?: boolean;
}

function VariantTreeNode({
  recipe,
  variants,
  variantsByMaster,
  expandedNodes,
  onToggle,
  onSelect,
  onCompare,
  selectedId,
  depth,
  isMaster = false,
}: VariantTreeNodeProps) {
  const isExpanded = expandedNodes.has(recipe._id || '');
  const isSelected = selectedId === recipe._id;
  const childVariants = variantsByMaster.get(recipe._id || '') || [];

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.nodeContent} ${isSelected ? styles.selected : ''} ${isMaster ? styles.master : ''}`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => onSelect(recipe)}
      >
        {childVariants.length > 0 && (
          <button
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(recipe._id || '');
            }}
          >
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </button>
        )}
        <div className={styles.nodeImage}>
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.product?.name} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Star />
            </div>
          )}
        </div>
        <div className={styles.nodeInfo}>
          <span className={styles.nodeName}>{recipe.product?.name}</span>
          <span className={styles.nodeStatus}>{isMaster ? 'Master' : 'Variant'}</span>
        </div>
        <div className={styles.nodeMetrics}>
          <span className={styles.nodeMetric}>
            <Activity className={styles.metricIcon} />
            {recipe.totalCost ? `$${recipe.totalCost.toFixed(2)}` : '-'}
          </span>
        </div>
      </div>

      {isExpanded && childVariants.length > 0 && (
        <div className={styles.nodeChildren}>
          {childVariants.map((variant) => (
            <VariantTreeNode
              key={variant._id}
              recipe={variant.recipe}
              variants={variantsByMaster.get(variant._id) || []}
              variantsByMaster={variantsByMaster}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onSelect={onSelect}
              onCompare={onCompare}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Variant Workspace Component
interface VariantWorkspaceProps {
  variant: Recipe;
  masterRecipe?: Recipe;
  inheritedData?: any;
  costData?: any;
  healthData?: any;
}

function VariantWorkspace({
  variant,
  masterRecipe,
  inheritedData,
  costData,
  healthData,
}: VariantWorkspaceProps) {
  return (
    <div className={styles.workspace}>
      <div className={styles.workspaceHeader}>
        <div className={styles.workspaceImage}>
          {variant.image ? (
            <img src={variant.image} alt={variant.product?.name} />
          ) : (
            <div className={styles.imagePlaceholderLarge}>
              <Star />
            </div>
          )}
        </div>
        <div className={styles.workspaceInfo}>
          <h1 className={styles.workspaceTitle}>{variant.product?.name}</h1>
          <p className={styles.workspaceDescription}>{variant.variantName || 'Variant'}</p>
          <div className={styles.workspaceBadges}>
            <span className={styles.badge}>Active</span>
            {variant.isPrimary && <span className={styles.badge}>Primary</span>}
          </div>
        </div>
        <div className={styles.workspaceMetrics}>
          <div className={styles.metricCard}>
            <DollarSign className={styles.metricIcon} />
            <span className={styles.metricValue}>{costData?.totalCost ? `$${costData.totalCost.toFixed(2)}` : '-'}</span>
            <span className={styles.metricLabel}>Cost</span>
          </div>
          <div className={styles.metricCard}>
            <Activity className={styles.metricIcon} />
            <span className={styles.metricValue}>{healthData?.score || '-'}</span>
            <span className={styles.metricLabel}>Health</span>
          </div>
          <div className={styles.metricCard}>
            <Clock className={styles.metricIcon} />
            <span className={styles.metricValue}>-</span>
            <span className={styles.metricLabel}>Time</span>
          </div>
        </div>
      </div>

      <div className={styles.workspaceContent}>
        <div className={styles.workspaceSection}>
          <h3>Ingredients</h3>
          <div className={styles.ingredientsList}>
            {variant.ingredients?.map((ing, idx) => (
              <div key={idx} className={styles.ingredientItem}>
                <span className={styles.ingredientName}>{ing.inventoryItem?.name || ing.name}</span>
                <span className={styles.ingredientQuantity}>
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.workspaceSection}>
          <h3>Steps</h3>
          <div className={styles.stepsList}>
            {variant.steps?.map((step, idx) => (
              <div key={idx} className={styles.stepItem}>
                <span className={styles.stepNumber}>{idx + 1}</span>
                <span className={styles.stepDescription}>{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comparison Panel Component
interface ComparisonPanelProps {
  recipeA: Recipe;
  recipeB: Recipe;
}

function ComparisonPanel({ recipeA, recipeB }: ComparisonPanelProps) {
  const diffs = useMemo((): DiffItem[] => {
    const items: DiffItem[] = [];

    // Compare ingredients
    const ingredientsA = recipeA.ingredients || [];
    const ingredientsB = recipeB.ingredients || [];

    ingredientsA.forEach((ingA) => {
      const ingB = ingredientsB.find(b => b.inventoryItem?._id === ingA.inventoryItem?._id);
      if (!ingB) {
        items.push({
          type: 'removed',
          field: 'ingredient',
          valueA: ingA,
          label: ingA.inventoryItem?.name || ingA.name,
        });
      } else if (ingA.quantity !== ingB.quantity || ingA.unit !== ingB.unit) {
        items.push({
          type: 'modified',
          field: 'ingredient',
          valueA: `${ingA.quantity} ${ingA.unit}`,
          valueB: `${ingB.quantity} ${ingB.unit}`,
          label: ingA.inventoryItem?.name || ingA.name,
        });
      }
    });

    ingredientsB.forEach((ingB) => {
      const ingA = ingredientsA.find(a => a.inventoryItem?._id === ingB.inventoryItem?._id);
      if (!ingA) {
        items.push({
          type: 'added',
          field: 'ingredient',
          valueB: ingB,
          label: ingB.inventoryItem?.name || ingB.name,
        });
      }
    });

    // Compare category
    if (recipeA.category !== recipeB.category) {
      items.push({
        type: 'modified',
        field: 'category',
        valueA: recipeA.category,
        valueB: recipeB.category,
        label: 'Category',
      });
    }

    // Compare method
    if (recipeA.method !== recipeB.method) {
      items.push({
        type: 'modified',
        field: 'method',
        valueA: recipeA.method,
        valueB: recipeB.method,
        label: 'Method',
      });
    }

    return items;
  }, [recipeA, recipeB]);

  return (
    <div className={styles.comparisonPanelContent}>
      <div className={styles.comparisonHeader}>
        <h2>Comparison</h2>
        <DiffBadge type="modified" count={diffs.length} />
      </div>
      <DiffViewer diffs={diffs} />
    </div>
  );
}

// Inspector Component
interface InspectorProps {
  variant: Recipe | null;
  masterRecipe?: Recipe | null;
  inheritedData?: any;
  costData?: any;
  healthData?: any;
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
}

function Inspector({
  variant,
  masterRecipe,
  inheritedData,
  costData,
  healthData,
  tab,
  onTabChange,
}: InspectorProps) {
  const tabs: { id: InspectorTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Star },
    { id: 'inheritance', label: 'Inheritance', icon: GitBranch },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'relations', label: 'Relations', icon: GitMerge },
    { id: 'versions', label: 'Versions', icon: Clock },
    { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className={styles.inspector}>
      <div className={styles.inspectorTabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.inspectorTab} ${tab === t.id ? styles.active : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            <t.icon className={styles.tabIcon} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.inspectorContent}>
        {tab === 'overview' && <OverviewTab variant={variant} />}
        {tab === 'inheritance' && <InheritanceTab variant={variant} masterRecipe={masterRecipe} inheritedData={inheritedData} />}
        {tab === 'health' && <HealthTab healthData={healthData} />}
        {tab === 'costs' && <CostsTab costData={costData} />}
        {tab === 'relations' && <RelationsTab variant={variant} />}
        {tab === 'versions' && <VersionsTab variant={variant} />}
        {tab === 'warnings' && <WarningsTab variant={variant} />}
        {tab === 'analytics' && <AnalyticsTab variant={variant} />}
      </div>
    </div>
  );
}

function OverviewTab({ variant }: { variant: Recipe | null }) {
  if (!variant) return <div className={styles.emptyTab}>Select a variant</div>;
  return (
    <div className={styles.tabContent}>
      <h3>{variant.product?.name}</h3>
      <p>{variant.variantName}</p>
      <p>Category: {variant.category}</p>
      <p>Method: {variant.method}</p>
    </div>
  );
}

function InheritanceTab({ variant, masterRecipe, inheritedData }: any) {
  return (
    <div className={styles.tabContent}>
      <h3>Inheritance Settings</h3>
      {variant?.inheritanceSettings && (
        <div className={styles.inheritanceList}>
          <InheritanceToggle label="Ingredients" value={variant.inheritanceSettings.inheritIngredients} />
          <InheritanceToggle label="Steps" value={variant.inheritanceSettings.inheritSteps} />
          <InheritanceToggle label="Method" value={variant.inheritanceSettings.inheritMethod} />
          <InheritanceToggle label="Specifications" value={variant.inheritanceSettings.inheritSpecifications} />
          <InheritanceToggle label="Category" value={variant.inheritanceSettings.inheritCategory} />
          <InheritanceToggle label="Drink Style" value={variant.inheritanceSettings.inheritDrinkStyle} />
        </div>
      )}
    </div>
  );
}

function InheritanceToggle({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={styles.inheritanceToggle}>
      <span>{label}</span>
      <span className={`${styles.toggleStatus} ${value ? styles.inherited : styles.overridden}`}>
        {value ? '✓' : '✗'}
      </span>
    </div>
  );
}

function HealthTab({ healthData }: any) {
  return (
    <div className={styles.tabContent}>
      <h3>Health Score</h3>
      <p>Score: {healthData?.score || '-'}</p>
      {healthData?.warnings && healthData.warnings.length > 0 && (
        <div className={styles.warningsList}>
          {healthData.warnings.map((warning: string, idx: number) => (
            <div key={idx} className={styles.warningItem}>
              <AlertTriangle className={styles.warningIcon} />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CostsTab({ costData }: any) {
  return (
    <div className={styles.tabContent}>
      <h3>Cost Analysis</h3>
      <p>Total Cost: ${costData?.totalCost?.toFixed(2) || '-'}</p>
    </div>
  );
}

function RelationsTab({ variant }: { variant: Recipe | null }) {
  return (
    <div className={styles.tabContent}>
      <h3>Relations</h3>
      <p>Parent ID: {variant?.parentId || '-'}</p>
    </div>
  );
}

function VersionsTab({ variant }: { variant: Recipe | null }) {
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    if (!variant) return [];
    return [
      {
        id: '1',
        type: 'created',
        date: variant.createdAt || new Date().toISOString(),
        author: variant.author || 'Unknown',
        description: `Created ${variant.product?.name}`,
        variantId: variant._id,
      },
      {
        id: '2',
        type: 'modified',
        date: variant.updatedAt || new Date().toISOString(),
        author: variant.author || 'Unknown',
        description: 'Last modification',
        details: variant.versionHistory?.[0]?.changes || [],
        variantId: variant._id,
        version: variant.versionHistory?.[0]?.version,
      },
    ];
  }, [variant]);

  return (
    <div className={styles.tabContent}>
      <h3>Version History</h3>
      <VariantTimeline events={timelineEvents} variantId={variant?._id} />
    </div>
  );
}

function WarningsTab({ variant }: { variant: Recipe | null }) {
  return (
    <div className={styles.tabContent}>
      <h3>Warnings</h3>
      <p>No warnings</p>
    </div>
  );
}

function AnalyticsTab({ variant }: { variant: Recipe | null }) {
  return (
    <div className={styles.tabContent}>
      <VariantAnalytics variant={variant} />
    </div>
  );
}

// New Variant Wizard
function NewVariantWizardWrapper({ masterRecipe, onClose, onCreate }: any) {
  return <NewVariantWizard masterRecipe={masterRecipe} onClose={onClose} onCreate={onCreate} />;
}
