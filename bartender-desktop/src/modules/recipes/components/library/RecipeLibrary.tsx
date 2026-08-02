import { useState } from 'react';
import type { Recipe, RecipeCollection, RecipeTag, RecipeSearchQuery } from '../../types';
import { useRecipeLibrary } from '../../hooks';
import { GrimoireSidebar } from './GrimoireSidebar';

interface RecipeLibraryProps {
  recipes: Recipe[];
  onRecipeSelect?: (recipe: Recipe) => void;
  onRecipeEdit?: (recipe: Recipe) => void;
}

/**
 * RecipeLibrary - Componente principal de biblioteca profesional
 * Inspirado en Obsidian, Notion, Figma Assets, Unreal Content Browser, Adobe Lightroom
 */
export function RecipeLibrary({ recipes, onRecipeSelect, onRecipeEdit }: RecipeLibraryProps) {
  const [activeSection, setActiveSection] = useState('library');
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<RecipeSearchQuery>({});

  const {
    filteredRecipes,
    collections,
    tags,
    favorites,
    popularRecipes,
    recentRecipes,
  } = useRecipeLibrary({
    recipes,
    searchQuery,
    selectedCollection,
    selectedTag,
  });

  const handleSearch = (query: string) => {
    setSearchQuery({ ...searchQuery, query });
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
    switch (activeSection) {
      case 'library':
        return (
          <div className="library-content">
            <div className="library-header">
              <h2 className="library-title">Biblioteca de Recetas</h2>
              <div className="library-search">
                <input
                  type="text"
                  placeholder="Buscar recetas..."
                  value={searchQuery.query || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="library-filters">
              <div className="filter-section">
                <h4 className="filter-title">Colecciones</h4>
                <div className="filter-tags">
                  {collections.slice(0, 8).map((collection) => (
                    <button
                      key={collection._id}
                      className={`filter-tag ${selectedCollection === collection._id ? 'active' : ''}`}
                      onClick={() => handleCollectionSelect(collection._id!)}
                      style={{ borderColor: collection.color }}
                    >
                      <span>{collection.icon}</span>
                      <span>{collection.name}</span>
                      <span className="tag-count">{collection.recipeCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4 className="filter-title">Etiquetas</h4>
                <div className="filter-tags">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag._id}
                      className={`filter-tag ${selectedTag === tag.name ? 'active' : ''}`}
                      onClick={() => handleTagFilter(tag.name)}
                      style={{ borderColor: tag.color }}
                    >
                      <span>{tag.name}</span>
                      <span className="tag-count">{tag.usageCount}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="library-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={() => onRecipeSelect?.(recipe)}
                  onEdit={() => onRecipeEdit?.(recipe)}
                />
              ))}
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="library-content">
            <h2 className="library-title">Favoritas</h2>
            <div className="library-grid">
              {favorites.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  onSelect={() => onRecipeSelect?.(recipe)}
                  onEdit={() => onRecipeEdit?.(recipe)}
                />
              ))}
            </div>
          </div>
        );

      case 'collections':
        return (
          <div className="library-content">
            <h2 className="library-title">Colecciones</h2>
            <div className="collections-grid">
              {collections.map((collection) => (
                <CollectionCard
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
    <div className="recipe-library">
      <GrimoireSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collections={collections}
        favoritesCount={favorites.length}
        variantsCount={recipes.filter((r) => !r.isPrimary).length}
      />
      <div className="library-main">
        {renderContent()}
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onSelect, onEdit }: { recipe: Recipe; onSelect?: () => void; onEdit?: () => void }) {
  return (
    <div className="recipe-card" onClick={onSelect}>
      <div className="card-image">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.product?.name} />
        ) : (
          <div className="card-placeholder">{recipe.type === 'drink' ? '🍸' : '🍰'}</div>
        )}
        {recipe.isFavorite && <span className="card-favorite">⭐</span>}
      </div>
      <div className="card-content">
        <h3 className="card-title">{recipe.product?.name}</h3>
        <p className="card-category">{recipe.category}</p>
        <div className="card-meta">
          <span className="card-cost">${recipe.totalCost?.toFixed(2) || '0.00'}</span>
          <span className="card-ingredients">{recipe.ingredients.length} ingredientes</span>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="card-tags">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="card-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionCard({ collection, onSelect }: { collection: RecipeCollection; onSelect?: () => void }) {
  return (
    <div className="collection-card" onClick={onSelect} style={{ borderColor: collection.color }}>
      <div className="collection-header">
        <span className="collection-icon" style={{ backgroundColor: collection.color }}>
          {collection.icon}
        </span>
        <h3 className="collection-title">{collection.name}</h3>
      </div>
      <p className="collection-description">{collection.description}</p>
      <div className="collection-footer">
        <span className="collection-count">{collection.recipeCount} recetas</span>
        {collection.tags && collection.tags.length > 0 && (
          <div className="collection-tags">
            {collection.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="mini-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
