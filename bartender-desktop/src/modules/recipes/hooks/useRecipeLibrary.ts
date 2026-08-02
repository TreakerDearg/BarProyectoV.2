import { useMemo } from 'react';
import type { Recipe, RecipeCollection, RecipeTag, RecipeSearchQuery } from '../types';

interface UseRecipeLibraryProps {
  recipes: Recipe[];
  searchQuery?: RecipeSearchQuery;
  selectedCollection?: string;
  selectedTag?: string;
}

interface RecipeLibraryData {
  filteredRecipes: Recipe[];
  collections: RecipeCollection[];
  tags: RecipeTag[];
  favorites: Recipe[];
  popularRecipes: Recipe[];
  recentRecipes: Recipe[];
}

/**
 * Hook para gestión de la Biblioteca de Recetas
 * Centraliza filtrado, búsqueda y organización de recetas
 */
export function useRecipeLibrary({
  recipes,
  searchQuery,
  selectedCollection,
  selectedTag,
}: UseRecipeLibraryProps): RecipeLibraryData {
  return useMemo(() => {
    // Filtrar recetas según búsqueda
    let filtered = recipes;

    if (searchQuery?.query) {
      const query = searchQuery.query.toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.product?.name.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (searchQuery?.ingredient) {
      filtered = filtered.filter((recipe) =>
        recipe.ingredients.some((ing) =>
          ing.inventoryItem.name.toLowerCase().includes(searchQuery.ingredient!.toLowerCase())
        )
      );
    }

    if (searchQuery?.category) {
      filtered = filtered.filter((recipe) => recipe.category === searchQuery.category);
    }

    if (searchQuery?.collection) {
      filtered = filtered.filter((recipe) =>
        recipe.collections?.includes(searchQuery.collection!)
      );
    }

    if (searchQuery?.tag) {
      filtered = filtered.filter((recipe) =>
        recipe.tags?.includes(searchQuery.tag!)
      );
    }

    if (searchQuery?.author) {
      filtered = filtered.filter((recipe) => recipe.author === searchQuery.author);
    }

    if (searchQuery?.minCost) {
      filtered = filtered.filter((recipe) => (recipe.totalCost || 0) >= searchQuery.minCost!);
    }

    if (searchQuery?.maxCost) {
      filtered = filtered.filter((recipe) => (recipe.totalCost || 0) <= searchQuery.maxCost!);
    }

    // Filtrar por colección seleccionada
    if (selectedCollection) {
      filtered = filtered.filter((recipe) =>
        recipe.collections?.includes(selectedCollection)
      );
    }

    // Filtrar por etiqueta seleccionada
    if (selectedTag) {
      filtered = filtered.filter((recipe) =>
        recipe.tags?.includes(selectedTag)
      );
    }

    // Generar colecciones basadas en etiquetas
    const collections = generateCollections(recipes);

    // Generar etiquetas únicas
    const tags = generateTags(recipes);

    // Recetas favoritas
    const favorites = recipes.filter((recipe) => recipe.isFavorite);

    // Recetas populares (por popularidad)
    const popularRecipes = [...recipes]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 10);

    // Recetas recientes (por fecha de actualización)
    const recentRecipes = [...recipes]
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 10);

    return {
      filteredRecipes: filtered,
      collections,
      tags,
      favorites,
      popularRecipes,
      recentRecipes,
    };
  }, [recipes, searchQuery, selectedCollection, selectedTag]);
}

function generateCollections(recipes: Recipe[]): RecipeCollection[] {
  const collectionMap = new Map<string, RecipeCollection>();

  // Colecciones del sistema
  const systemCollections: RecipeCollection[] = [
    {
      _id: 'all',
      name: 'Todas las Recetas',
      icon: '📚',
      description: 'Todas las recetas del sistema',
      color: '#6366f1',
      tags: [],
      recipeCount: recipes.length,
      isSystem: true,
    },
    {
      _id: 'favorites',
      name: 'Favoritas',
      icon: '⭐',
      description: 'Recetas marcadas como favoritas',
      color: '#f59e0b',
      tags: ['favorite'],
      recipeCount: recipes.filter((r) => r.isFavorite).length,
      isSystem: true,
    },
    {
      _id: 'popular',
      name: 'Populares',
      icon: '🔥',
      description: 'Recetas más utilizadas',
      color: '#ef4444',
      tags: ['popular'],
      recipeCount: recipes.filter((r) => (r.popularity || 0) > 50).length,
      isSystem: true,
    },
    {
      _id: 'recent',
      name: 'Recientes',
      icon: '🕐',
      description: 'Recetas actualizadas recientemente',
      color: '#10b981',
      tags: ['recent'],
      recipeCount: 10,
      isSystem: true,
    },
    {
      _id: 'drinks',
      name: 'Bebidas',
      icon: '🍸',
      description: 'Todas las bebidas',
      color: '#8b5cf6',
      tags: ['drink'],
      recipeCount: recipes.filter((r) => r.type === 'drink').length,
      isSystem: true,
    },
    {
      _id: 'food',
      name: 'Comida',
      icon: '🍰',
      description: 'Todas las comidas',
      color: '#ec4899',
      tags: ['food'],
      recipeCount: recipes.filter((r) => r.type === 'food').length,
      isSystem: true,
    },
  ];

  systemCollections.forEach((col) => collectionMap.set(col._id!, col));

  // Colecciones personalizadas basadas en etiquetas
  const tagCounts = new Map<string, number>();
  recipes.forEach((recipe) => {
    recipe.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  tagCounts.forEach((count, tag) => {
    if (count >= 2) {
      collectionMap.set(tag, {
        _id: tag,
        name: tag.charAt(0).toUpperCase() + tag.slice(1),
        icon: getCollectionIcon(tag),
        description: `Recetas etiquetadas como ${tag}`,
        color: getCollectionColor(tag),
        tags: [tag],
        recipeCount: count,
        isSystem: false,
      });
    }
  });

  return Array.from(collectionMap.values());
}

function generateTags(recipes: Recipe[]): RecipeTag[] {
  const tagMap = new Map<string, RecipeTag>();

  recipes.forEach((recipe) => {
    recipe.tags?.forEach((tagName) => {
      const existing = tagMap.get(tagName);
      if (existing) {
        existing.usageCount = (existing.usageCount || 0) + 1;
      } else {
        tagMap.set(tagName, {
          _id: tagName,
          name: tagName,
          category: getTagCategory(tagName),
          color: getTagColor(tagName),
          usageCount: 1,
        });
      }
    });
  });

  return Array.from(tagMap.values());
}

function getCollectionIcon(tag: string): string {
  const iconMap: Record<string, string> = {
    'premium': '⭐',
    'navidad': '🎄',
    'verano': '☀️',
    'happy hour': '🍹',
    'sin alcohol': '🚫',
    'signature': '✨',
    'rápido': '⚡',
    'experimental': '🧪',
  };
  return iconMap[tag.toLowerCase()] || '📁';
}

function getCollectionColor(tag: string): string {
  const colorMap: Record<string, string> = {
    'premium': '#f59e0b',
    'navidad': '#dc2626',
    'verano': '#f97316',
    'happy hour': '#8b5cf6',
    'sin alcohol': '#6b7280',
    'signature': '#06b6d4',
    'rápido': '#10b981',
    'experimental': '#ec4899',
  };
  return colorMap[tag.toLowerCase()] || '#6366f1';
}

function getTagCategory(tag: string): RecipeTag['category'] {
  const categoryMap: Record<string, RecipeTag['category']> = {
    'autor': 'author',
    'premium': 'premium',
    'navidad': 'season',
    'verano': 'season',
    'happy hour': 'event',
    'sin alcohol': 'style',
    'signature': 'style',
    'rápido': 'speed',
    'popular': 'popularity',
    'alto margen': 'margin',
    'bajo stock': 'stock',
  };
  return categoryMap[tag.toLowerCase()] || 'style';
}

function getTagColor(tag: string): string {
  return getCollectionColor(tag);
}
