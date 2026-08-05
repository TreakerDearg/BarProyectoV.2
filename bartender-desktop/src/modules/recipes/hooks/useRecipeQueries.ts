import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import api from '../../../services/api';
import type { Recipe } from '../types';

/* =========================================================
   QUERY KEYS
========================================================= */
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (filters?: string) => [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  byProduct: (productId: string) => [...recipeKeys.all, 'product', productId] as const,
  withRecipes: (params?: string) => [...recipeKeys.all, 'with-recipes', params] as const,
  dashboard: {
    stats: () => [...recipeKeys.all, 'dashboard', 'stats'] as const,
    recent: (limit?: number) => [...recipeKeys.all, 'dashboard', 'recent', limit] as const,
    warnings: () => [...recipeKeys.all, 'dashboard', 'warnings'] as const,
    suggestions: () => [...recipeKeys.all, 'dashboard', 'suggestions'] as const,
  },
  analytics: (id: string) => [...recipeKeys.all, 'analytics', id] as const,
  timeline: (id: string) => [...recipeKeys.all, 'timeline', id] as const,
  protocol: (id: string) => [...recipeKeys.all, 'protocol', id] as const,
  availability: (id: string) => [...recipeKeys.all, 'availability', id] as const,
};

/* =========================================================
   GET ALL RECIPES
========================================================= */
export function useRecipes(options?: UseQueryOptions<Recipe[]>) {
  return useQuery({
    queryKey: recipeKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/recipes');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET ONE RECIPE
========================================================= */
export function useRecipe(id: string, options?: UseQueryOptions<Recipe>) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   GET RECIPES BY PRODUCT
========================================================= */
export function useRecipesByProduct(productId: string, options?: UseQueryOptions<Recipe[]>) {
  return useQuery({
    queryKey: recipeKeys.byProduct(productId),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/product/${productId}`);
      return data;
    },
    enabled: !!productId,
    ...options,
  });
}

/* =========================================================
   GET DRINK PRODUCTS WITH RECIPES
========================================================= */
export function useDrinkProductsWithRecipes(params?: { category?: string; available?: boolean }, options?: UseQueryOptions<any[]>) {
  const queryString = params ? new URLSearchParams(params as any).toString() : '';
  return useQuery({
    queryKey: recipeKeys.withRecipes(queryString),
    queryFn: async () => {
      const url = `/recipes/drinks/with-recipes${queryString ? `?${queryString}` : ''}`;
      const { data } = await api.get(url);
      return data;
    },
    select: (data) => {
      // Transformar datos para extraer recetas de productos
      const recipes: Recipe[] = [];
      data.forEach((product: any) => {
        if (product.primary) {
          recipes.push(product.primary);
        }
        if (product.variants && Array.isArray(product.variants)) {
          recipes.push(...product.variants);
        }
      });
      return recipes;
    },
    ...options,
  });
}

/* =========================================================
   DASHBOARD STATS
========================================================= */
export function useDashboardStats(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: recipeKeys.dashboard.stats(),
    queryFn: async () => {
      const { data } = await api.get('/recipes/dashboard/stats');
      return data;
    },
    select: (data) => {
      // Transformar datos al formato esperado por componentes
      return {
        stats: data.stats,
        recentActivity: data.recentActivity,
        warnings: data.warnings,
      };
    },
    ...options,
  });
}

/* =========================================================
   DASHBOARD RECENT RECIPES
========================================================= */
export function useDashboardRecent(limit = 10, options?: UseQueryOptions<any[]>) {
  return useQuery({
    queryKey: recipeKeys.dashboard.recent(limit),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/dashboard/recent?limit=${limit}`);
      return data;
    },
    select: (data) => {
      // Transformar datos al formato esperado por componentes
      return data.map((item: any) => ({
        _id: item._id,
        name: item.name,
        image: item.image,
        category: item.category,
        type: item.type,
        price: item.price,
        totalCost: item.totalCost,
        margin: item.margin,
        createdAt: item.createdAt,
      }));
    },
    ...options,
  });
}

/* =========================================================
   DASHBOARD WARNINGS
========================================================= */
export function useDashboardWarnings(options?: UseQueryOptions<any[]>) {
  return useQuery({
    queryKey: recipeKeys.dashboard.warnings(),
    queryFn: async () => {
      const { data } = await api.get('/recipes/dashboard/warnings');
      return data;
    },
    select: (data) => {
      // Transformar datos al formato esperado por componentes
      return data.map((warning: any) => ({
        id: warning.id,
        type: warning.type,
        title: warning.title,
        description: warning.description,
        severity: warning.severity,
        count: warning.count,
        items: warning.items || [],
      }));
    },
    ...options,
  });
}

/* =========================================================
   DASHBOARD SUGGESTIONS
========================================================= */
export function useDashboardSuggestions(options?: UseQueryOptions<any[]>) {
  return useQuery({
    queryKey: recipeKeys.dashboard.suggestions(),
    queryFn: async () => {
      const { data } = await api.get('/recipes/dashboard/suggestions');
      return data;
    },
    ...options,
  });
}

/* =========================================================
   RECIPE ANALYTICS
========================================================= */
export function useRecipeAnalytics(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: recipeKeys.analytics(id),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/analytics/${id}`);
      return data;
    },
    enabled: !!id,
    select: (data) => {
      // Transformar datos al formato esperado por componentes
      return {
        recipe: data.recipe,
        popularity: data.popularity,
        financial: data.financial,
        production: data.production,
        health: data.health,
        variants: data.variants,
      };
    },
    ...options,
  });
}

/* =========================================================
   RECIPE TIMELINE
========================================================= */
export function useRecipeTimeline(id: string, options?: UseQueryOptions<any[]>) {
  return useQuery({
    queryKey: recipeKeys.timeline(id),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/${id}/timeline`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   RECIPE PROTOCOL
========================================================= */
export function useRecipeProtocol(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: recipeKeys.protocol(id),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/${id}/protocol`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   RECIPE AVAILABILITY
========================================================= */
export function useRecipeAvailability(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: recipeKeys.availability(id),
    queryFn: async () => {
      const { data } = await api.get(`/recipes/${id}/availability`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   CREATE RECIPE
========================================================= */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: Recipe) => {
      const { data } = await api.post('/recipes', recipe);
      return data;
    },
    onSuccess: () => {
      // Invalidar queries de recetas
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.dashboard.stats() });
    },
  });
}

/* =========================================================
   UPDATE RECIPE
========================================================= */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recipe }: { id: string; recipe: Recipe }) => {
      const { data } = await api.patch(`/recipes/${id}`, recipe);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.dashboard.stats() });
      // Invalidar queries de producto si existe
      if (data.product) {
        queryClient.invalidateQueries({ queryKey: recipeKeys.byProduct(data.product) });
      }
    },
  });
}

/* =========================================================
   DELETE RECIPE
========================================================= */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recipes/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries de recetas
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.dashboard.stats() });
    },
  });
}
