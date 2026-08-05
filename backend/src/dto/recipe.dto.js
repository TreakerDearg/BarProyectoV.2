/**
 * Recipe DTOs - Data Transfer Objects específicos para cada vista
 * Cada DTO contiene solo los datos necesarios para su vista correspondiente
 * Centraliza la lógica de transformación y enriquecimiento de datos
 */

import Recipe from "../models/Recipe.js";
import Product from "../models/Product.js";
import InventoryItem from "../models/InventoryItem.js";

/* =========================================================
   RECIPE BUILDER DTO
   Para el Recipe Builder - necesita inventario completo y detalles de ingredientes
========================================================= */
export async function toRecipeBuilderDTO(recipe) {
  // Populate con todos los campos necesarios para el builder
  const populatedRecipe = await Recipe.findById(recipe._id)
    .populate("product", "name price category type drinkStyle available image imagePublicId")
    .populate("ingredients.inventoryItem", "name cost unit stock minStock maxStock supplier category location image imagePublicId")
    .lean();

  if (!populatedRecipe) return null;

  // Enriquecer con datos calculados por el backend
  const enrichedIngredients = populatedRecipe.ingredients.map(ing => ({
    ...ing,
    inventoryItem: {
      ...ing.inventoryItem,
      // Datos adicionales que el builder necesita
      stockStatus: getStockStatus(ing.inventoryItem),
      costPerUnit: ing.inventoryItem.cost,
      isAvailable: ing.inventoryItem.stock >= ing.quantity,
      missingQuantity: Math.max(0, ing.quantity - ing.inventoryItem.stock),
    }
  }));

  return {
    // Datos básicos de receta
    _id: populatedRecipe._id,
    product: populatedRecipe.product,
    type: populatedRecipe.type,
    category: populatedRecipe.category,
    method: populatedRecipe.method,
    steps: populatedRecipe.steps,
    image: populatedRecipe.image,
    imagePublicId: populatedRecipe.imagePublicId,
    specifications: populatedRecipe.specifications,
    
    // Datos de variantes
    isPrimary: populatedRecipe.isPrimary,
    variantName: populatedRecipe.variantName,
    parentId: populatedRecipe.parentId,
    
    // Ingredientes enriquecidos
    ingredients: enrichedIngredients,
    
    // Datos calculados por backend (no recalcular en frontend)
    totalCost: populatedRecipe.totalCost,
    margin: calculateMargin(populatedRecipe.product?.price, populatedRecipe.totalCost),
    
    // Metadata
    createdAt: populatedRecipe.createdAt,
    updatedAt: populatedRecipe.updatedAt,
  };
}

/* =========================================================
   RECIPE LIBRARY DTO
   Para la Recipe Library - necesita datos enriquecidos para cards
========================================================= */
export async function toRecipeLibraryDTO(recipe) {
  const populatedRecipe = await Recipe.findById(recipe._id)
    .populate("product", "name price category type available image imagePublicId featured tags")
    .lean();

  if (!populatedRecipe) return null;

  return {
    // Datos para mostrar en cards
    _id: populatedRecipe._id,
    name: populatedRecipe.product?.name || "Sin nombre",
    image: populatedRecipe.image || populatedRecipe.product?.image || "",
    category: populatedRecipe.category,
    type: populatedRecipe.type,
    
    // Datos de producto
    product: {
      _id: populatedRecipe.product?._id,
      name: populatedRecipe.product?.name,
      price: populatedRecipe.product?.price,
      available: populatedRecipe.product?.available,
      featured: populatedRecipe.product?.featured,
      tags: populatedRecipe.product?.tags || [],
    },
    
    // Datos de variantes
    isPrimary: populatedRecipe.isPrimary,
    variantName: populatedRecipe.variantName,
    parentId: populatedRecipe.parentId,
    
    // Métricas calculadas por backend
    totalCost: populatedRecipe.totalCost,
    margin: calculateMargin(populatedRecipe.product?.price, populatedRecipe.totalCost),
    ingredientCount: populatedRecipe.ingredients?.length || 0,
    stepCount: populatedRecipe.steps?.length || 0,
    estimatedTime: calculateEstimatedTime(populatedRecipe),
    complexity: calculateComplexity(populatedRecipe),
    
    // Metadata para filtros
    createdAt: populatedRecipe.createdAt,
    updatedAt: populatedRecipe.updatedAt,
  };
}

/* =========================================================
   RECIPE DASHBOARD DTO
   Para el Dashboard - necesita datos agregados y estadísticas
========================================================= */
export async function toRecipeDashboardDTO(recipes) {
  // Calcular estadísticas agregadas
  const totalRecipes = recipes.length;
  const primaryRecipes = recipes.filter(r => r.isPrimary).length;
  const variantRecipes = recipes.filter(r => !r.isPrimary).length;
  
  const drinkRecipes = recipes.filter(r => r.type === "drink").length;
  const foodRecipes = recipes.filter(r => r.type === "food").length;
  
  const totalCost = recipes.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const avgCost = totalRecipes > 0 ? totalCost / totalRecipes : 0;
  
  const avgMargin = recipes.length > 0 
    ? recipes.reduce((sum, r) => sum + calculateMargin(r.product?.price, r.totalCost), 0) / recipes.length 
    : 0;
  
  // Categorías más comunes
  const categoryCounts = {};
  recipes.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  
  // Recetas recientes (últimas 7 días)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentRecipes = recipes.filter(r => new Date(r.createdAt) > sevenDaysAgo);
  
  // Recetas sin imagen
  const recipesWithoutImage = recipes.filter(r => !r.image && !r.product?.image);
  
  // Recetas con bajo margen (< 30%)
  const lowMarginRecipes = recipes.filter(r => calculateMargin(r.product?.price, r.totalCost) < 30);
  
  return {
    stats: {
      totalRecipes,
      primaryRecipes,
      variantRecipes,
      drinkRecipes,
      foodRecipes,
      avgCost: Number(avgCost.toFixed(2)),
      avgMargin: Number(avgMargin.toFixed(2)),
      categoryCounts,
    },
    
    recentActivity: {
      recentRecipesCount: recentRecipes.length,
      recentRecipes: recentRecipes.slice(0, 10).map(r => ({
        _id: r._id,
        name: r.product?.name || "Sin nombre",
        createdAt: r.createdAt,
        type: r.type,
      })),
    },
    
    warnings: {
      recipesWithoutImage: recipesWithoutImage.length,
      lowMarginRecipes: lowMarginRecipes.length,
      recipesWithoutImageList: recipesWithoutImage.slice(0, 5).map(r => ({
        _id: r._id,
        name: r.product?.name || "Sin nombre",
      })),
      lowMarginRecipesList: lowMarginRecipes.slice(0, 5).map(r => ({
        _id: r._id,
        name: r.product?.name || "Sin nombre",
        margin: calculateMargin(r.product?.price, r.totalCost),
      })),
    },
  };
}

/* =========================================================
   RECIPE ANALYTICS DTO
   Para Analytics - necesita métricas detalladas de una receta
========================================================= */
export async function toRecipeAnalyticsDTO(recipeId) {
  const recipe = await Recipe.findById(recipeId)
    .populate("product", "name price category type")
    .lean();

  if (!recipe) return null;

  // Calcular métricas de analytics
  const popularity = await calculatePopularity(recipeId);
  const salesData = await getSalesData(recipeId);
  const productionData = await getProductionData(recipeId);
  
  return {
    recipe: {
      _id: recipe._id,
      name: recipe.product?.name || "Sin nombre",
      category: recipe.category,
      type: recipe.type,
    },
    
    popularity: {
      score: popularity.score,
      rank: popularity.rank,
      trend: popularity.trend,
      totalOrders: popularity.totalOrders,
      lastOrdered: popularity.lastOrdered,
    },
    
    financial: {
      cost: recipe.totalCost,
      price: recipe.product?.price || 0,
      margin: calculateMargin(recipe.product?.price, recipe.totalCost),
      profit: (recipe.product?.price || 0) - recipe.totalCost,
      avgOrderValue: salesData.avgOrderValue,
      totalRevenue: salesData.totalRevenue,
    },
    
    production: {
      avgTime: productionData.avgTime,
      complexity: calculateComplexity(recipe),
      difficulty: productionData.difficulty,
      stepsCount: recipe.steps?.length || 0,
      ingredientsCount: recipe.ingredients?.length || 0,
    },
    
    health: {
      overall: calculateHealthScore(recipe),
      costScore: calculateCostScore(recipe),
      availabilityScore: await calculateAvailabilityScore(recipe),
      timeScore: calculateTimeScore(recipe),
      complexityScore: calculateComplexityScore(recipe),
    },
    
    variants: {
      total: await Recipe.countDocuments({ parentId: recipeId }),
      list: await Recipe.find({ parentId: recipeId })
        .populate("product", "name")
        .select("variantName product totalCost createdAt")
        .lean(),
    },
  };
}

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getStockStatus(inventoryItem) {
  if (inventoryItem.stock <= 0) return "empty";
  if (inventoryItem.stock <= inventoryItem.minStock) return "critical";
  if (inventoryItem.stock <= inventoryItem.minStock * 2) return "low";
  return "optimal";
}

function calculateMargin(price, cost) {
  if (!price || price === 0) return 0;
  return Number(((price - cost) / price * 100).toFixed(2));
}

function calculateEstimatedTime(recipe) {
  const stepCount = recipe.steps?.length || 0;
  const ingredientCount = recipe.ingredients?.length || 0;
  return Math.round(stepCount * 2 + ingredientCount * 0.5);
}

function calculateComplexity(recipe) {
  const ingredientCount = recipe.ingredients?.length || 0;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return "low";
  if (ingredientCount <= 5 && stepCount <= 4) return "medium";
  return "high";
}

async function calculatePopularity(recipeId) {
  // TODO: Implementar con datos reales de órdenes
  // Por ahora retorna datos simulados
  return {
    score: Math.floor(Math.random() * 100),
    rank: Math.floor(Math.random() * 50) + 1,
    trend: Math.random() > 0.5 ? "up" : "down",
    totalOrders: Math.floor(Math.random() * 1000),
    lastOrdered: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  };
}

async function getSalesData(recipeId) {
  // TODO: Implementar con datos reales de órdenes
  return {
    avgOrderValue: 0,
    totalRevenue: 0,
  };
}

async function getProductionData(recipeId) {
  // TODO: Implementar con datos reales de producción
  return {
    avgTime: 0,
    difficulty: "medium",
  };
}

function calculateHealthScore(recipe) {
  // TODO: Implementar cálculo completo de health score
  return 75;
}

function calculateCostScore(recipe) {
  const margin = calculateMargin(recipe.product?.price, recipe.totalCost);
  if (margin >= 80) return 100;
  if (margin >= 70) return 90;
  if (margin >= 60) return 80;
  if (margin >= 50) return 70;
  if (margin >= 40) return 60;
  if (margin >= 30) return 50;
  return 30;
}

async function calculateAvailabilityScore(recipe) {
  // TODO: Implementar verificación real de disponibilidad
  return 100;
}

function calculateTimeScore(recipe) {
  const estimatedTime = calculateEstimatedTime(recipe);
  if (estimatedTime <= 3) return 100;
  if (estimatedTime <= 5) return 90;
  if (estimatedTime <= 7) return 80;
  if (estimatedTime <= 10) return 70;
  return 50;
}

function calculateComplexityScore(recipe) {
  const ingredientCount = recipe.ingredients?.length || 0;
  const stepCount = recipe.steps?.length || 0;
  
  if (ingredientCount <= 3 && stepCount <= 2) return 100;
  if (ingredientCount <= 5 && stepCount <= 4) return 90;
  if (ingredientCount <= 7 && stepCount <= 6) return 80;
  return 60;
}
