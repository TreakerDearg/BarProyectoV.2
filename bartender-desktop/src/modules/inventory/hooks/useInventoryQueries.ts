import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  getInventory, getInventoryStats, getInventoryCategories,
  getInventoryMovements, adjustStock as adjustStockFn,
  createInventoryItem, updateInventoryItem, deleteInventoryItem,
  type InventoryStats, type InventoryMovement,
} from '../services/inventoryService';
import type { InventoryItem } from '../types/inventory';

// ── Query keys ────────────────────────────────────────────────────

export const inventoryKeys = {
  all:          ['inventory'] as const,
  lists:        ()           => [...inventoryKeys.all, 'list']          as const,
  list:         (f?: string) => [...inventoryKeys.lists(), f]           as const,
  details:      ()           => [...inventoryKeys.all, 'detail']        as const,
  detail:       (id: string) => [...inventoryKeys.details(), id]        as const,
  movements:    (id: string) => [...inventoryKeys.all, 'movements', id] as const,
  categories:   ()           => [...inventoryKeys.all, 'categories']    as const,
  stats:        ()           => [...inventoryKeys.all, 'stats']         as const,
  withProducts: ()           => [...inventoryKeys.all, 'with-products'] as const,
};

// ── Queries ───────────────────────────────────────────────────────

export const useInventory = (params?: Parameters<typeof getInventory>[0]) =>
  useQuery({
    queryKey: inventoryKeys.list(JSON.stringify(params ?? {})),
    queryFn:  () => getInventory(params),
  });

export function useInventoryStats(options?: UseQueryOptions<InventoryStats>) {
  return useQuery({
    queryKey: inventoryKeys.stats(),
    queryFn:  () => getInventoryStats(),
    ...options,
  });
}

export function useInventoryCategories(options?: UseQueryOptions<string[]>) {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn:  () => getInventoryCategories(),
    ...options,
  });
}

export function useInventoryMovements(id: string, options?: UseQueryOptions<InventoryMovement[]>) {
  return useQuery({
    queryKey: inventoryKeys.movements(id),
    queryFn:  () => getInventoryMovements(id),
    enabled:  !!id,
    ...options,
  });
}

// ── Mutations ─────────────────────────────────────────────────────

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ item, imageFile }: { item: InventoryItem; imageFile?: File | null }) =>
      createInventoryItem(item, imageFile),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() });
      qc.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, item, imageFile }: { id: string; item: InventoryItem; imageFile?: File | null }) =>
      updateInventoryItem(id, item, imageFile),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(v.id) });
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() });
    },
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() });
      qc.invalidateQueries({ queryKey: inventoryKeys.categories() });
    },
  });
}

/**
 * Ajuste de stock — alineado con el backend:
 * body: { amount: number, type: "add"|"subtract", reason: string }
 */
export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, amount, type, reason,
    }: {
      id: string; amount: number; type: "add" | "subtract"; reason?: string;
    }) => adjustStockFn(id, amount, type, reason ?? ""),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.detail(v.id) });
      qc.invalidateQueries({ queryKey: inventoryKeys.movements(v.id) });
      qc.invalidateQueries({ queryKey: inventoryKeys.lists() });
      qc.invalidateQueries({ queryKey: inventoryKeys.stats() });
      qc.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
