import { useState, memo } from 'react';
import type { Recipe, RecipeCollection, RecipeTag, RecipeSearchQuery } from '../../types';
import { useRecipeLibrary } from '../../hooks';
import { KnowledgeNavigator } from './KnowledgeNavigator';
import { PremiumRecipeCard } from './PremiumRecipeCard';
import { LibraryTopBar } from './LibraryTopBar';
import { QuickPreview } from './QuickPreview';
import { CollectionDashboardCard } from './CollectionDashboardCard';
import { LibraryEmptyState } from './LibraryEmptyState';
import styles from './RecipeLibrary.module.css';

type ViewMode = 'gallery' | 'masonry' | 'compact' | 'grid' | 'list';
type SortMode = 'name' | 'date' | 'cost' | 'popularity' | 'health';

interface RecipeLibraryProps {
  recipes: Recipe[];
  onRecipeSelect?: (recipe: Recipe) => void;
  onRecipeEdit?: (recipe: Recipe) => void;
  hideNavigator?: boolean; // Prop para ocultar el sidebar interno cuando se usa navegación compartida
}

/**
 * RecipeLibrary - Componente principal de biblioteca profesional
 * Rediseñado estilo Steam/Spotify con visual premium
 */
export const RecipeLibrary = memo(function RecipeLibrary({ recipes, onRecipeSelect, onRecipeEdit, hideNavigator = false }: RecipeLibraryProps) {
  const [activeSection, setActiveSection] = useState('library');
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery === '' || 
      recipe.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const collections: RecipeCollection[] = [];
  const tags: RecipeTag[] = [];
  const favorites = recipes.filter(r => r.isFavorite);
  const popularRecipes = recipes.filter(r => r.analytics?.popularity > 70);
  const recentRecipes = recipes.slice(0, 10);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    onRecipeSelect?.(recipe);
  };

  const handleNewRecipe = () => {
    // TODO: Implement new recipe creation
  };

  const handleImport = () => {
    // TODO: Implement import functionality
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(selectedTag === tag ? undefined : tag);
  };

  const handleCollectionSelect = (collectionId: string) => {
    if (selectedCollection === collectionId) {
      setSelectedCollection(undefined);
    } else {
      setSelectedCollection(collectionId);
    }
  };

  const renderContent = () => {
    if (recipes.length === 0) {
      return <LibraryEmptyState onNewRecipe={handleNewRecipe} onImport={handleImport} />;
    }

    switch (activeSection) {
      case 'library':
      case 'all':
        return (
          <div className={styles.libraryContent}>
            <LibraryTopBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              onNewRecipe={handleNewRecipe}
              onImport={handleImport}
              onExport={handleExport}
            />
            
            {filteredRecipes.length > 0 && (
              <div className={`${styles.recipeGrid} ${styles[viewMode]}`}>
                {filteredRecipes.map((recipe, index) => (
                  <PremiumRecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onSelect={() => handleRecipeSelect(recipe)}
                    onEdit={() => onRecipeEdit?.(recipe)}
                    onPreview={() => setSelectedRecipe(recipe)}
                    isHero={index === 0 && viewMode === 'gallery'}
                  />
                ))}
              </div>
            )}
            
            {filteredRecipes.length === 0 && (
              <div className={styles.noResults}>
                <span className={styles.noResultsIcon}>🔍</span>
                <p className={styles.noResultsText}>No se encontraron recetas con "{searchQuery}"</p>
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className={styles.libraryContent}>
            <LibraryTopBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              onNewRecipe={handleNewRecipe}
              onImport={handleImport}
              onExport={handleExport}
            />
            <div className={`${styles.recipeGrid} ${styles[viewMode]}`}>
              {favorites.map((recipe) => (
                <PremiumRecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={() => handleRecipeSelect(recipe)}
                  onEdit={() => onRecipeEdit?.(recipe)}
                  onPreview={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          </div>
        );

      case 'collections':
        return (
          <div className={styles.libraryContent}>
            <LibraryTopBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              onNewRecipe={handleNewRecipe}
              onImport={handleImport}
              onExport={handleExport}
            />
            <div className={styles.collectionsGrid}>
              {collections.map((collection) => (
                <CollectionDashboardCard
                  key={collection._id}
                  collection={collection}
                  onSelect={() => handleCollectionSelect(collection._id!)}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="library-content">
            <h2 className="library-title">Sección en desarrollo</h2>
            <p>Esta sección estará disponible en próximas fases.</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.recipeLibrary}>
      {!hideNavigator && (
        <KnowledgeNavigator
          collections={collections}
          favoritesCount={favorites.length}
          variantsCount={recipes.filter((r) => !r.isPrimary).length}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}
      <div className={styles.libraryMain}>
        {renderContent()}
      </div>
      <QuickPreview
        recipe={selectedRecipe}
        onEdit={() => selectedRecipe && onRecipeEdit?.(selectedRecipe)}
        onOpenBuilder={() => selectedRecipe && onRecipeSelect?.(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
});

