import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import api from '../../../services/api';
import type { InventoryItem } from '../types/inventory';

/* =========================================================
   QUERY KEYS
========================================================= */
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters?: string) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
  withProducts: () => [...inventoryKeys.all, 'with-products'] as const,
};

/* =========================================================
   GET ALL INVENTORY
========================================================= */
export function useInventory(options?: UseQueryOptions<InventoryItem[]>) {
  return useQuery({
    queryKey: inventoryKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/inventory');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET ONE INVENTORY ITEM
========================================================= */
export function useInventoryItem(id: string, options?: UseQueryOptions<InventoryItem>) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/inventory/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   GET INVENTORY CATEGORIES
========================================================= */
export function useInventoryCategories(options?: UseQueryOptions<string[]>) {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: async () => {
      const { data } = await api.get('/inventory/categories');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET INVENTORY STATS
========================================================= */
export function useInventoryStats(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get('/inventory/stats');
      return data;
    },
    ...options,
  });
}

/* =========================================================
   GET INVENTORY WITH PRODUCTS
========================================================= */
export function useInventoryWithProducts(options?: UseQueryOptions<any[]>) {
  return useQuery({
    queryKey: inventoryKeys.withProducts(),
    queryFn: async () => {
      const { data } = await api.get('/inventory/with-products');
      return data;
    },
    ...options,
  });
}

/* =========================================================
   CREATE INVENTORY ITEM
========================================================= */
export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      const { data } = await api.post('/inventory', item);
      return data;
    },
    onSuccess: () => {
      // Invalidar queries de inventario
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
}

/* =========================================================
   UPDATE INVENTORY ITEM
========================================================= */
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: InventoryItem }) => {
      await api.patch(`/inventory/${id}`, item);
    },
    onSuccess: (data, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
}

/* =========================================================
   DELETE INVENTORY ITEM
========================================================= */
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries de inventario
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
}

/* =========================================================
   ADJUST STOCK
========================================================= */
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) => {
      await api.patch(`/inventory/${id}/stock`, { quantity, reason });
    },
    onSuccess: (data, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
      // También invalidar recetas que dependen de este inventario
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
