import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import api from '../../../services/api';
import type { Decoration } from '../types/technique';

/* =========================================================
   QUERY KEYS
========================================================= */
export const decorationKeys = {
  all: ['decorations'] as const,
  lists: () => [...decorationKeys.all, 'list'] as const,
  list: (filters?: string) => [...decorationKeys.lists(), filters] as const,
  details: () => [...decorationKeys.all, 'detail'] as const,
  detail: (id: string) => [...decorationKeys.details(), id] as const,
  byType: (type: string) => [...decorationKeys.all, 'type', type] as const,
  byCategory: (category: string) => [...decorationKeys.all, 'category', category] as const,
};

/* =========================================================
   GET ALL DECORATIONS
========================================================= */
export function useDecorations(options?: UseQueryOptions<Decoration[]>) {
  return useQuery({
    queryKey: decorationKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/decorations');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET ONE DECORATION
========================================================= */
export function useDecoration(id: string, options?: UseQueryOptions<Decoration>) {
  return useQuery({
    queryKey: decorationKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/decorations/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   GET DECORATIONS BY TYPE
========================================================= */
export function useDecorationsByType(type: string, options?: UseQueryOptions<Decoration[]>) {
  return useQuery({
    queryKey: decorationKeys.byType(type),
    queryFn: async () => {
      const { data } = await api.get(`/decorations?type=${type}`);
      return data || [];
    },
    enabled: !!type,
    ...options,
  });
}

/* =========================================================
   GET DECORATIONS BY CATEGORY
========================================================= */
export function useDecorationsByCategory(category: string, options?: UseQueryOptions<Decoration[]>) {
  return useQuery({
    queryKey: decorationKeys.byCategory(category),
    queryFn: async () => {
      const { data } = await api.get(`/decorations?category=${category}`);
      return data || [];
    },
    enabled: !!category,
    ...options,
  });
}

/* =========================================================
   CREATE DECORATION
========================================================= */
export function useCreateDecoration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (decoration: Decoration) => {
      const { data } = await api.post('/decorations', decoration);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: decorationKeys.lists() });
    },
  });
}

/* =========================================================
   UPDATE DECORATION
========================================================= */
export function useUpdateDecoration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decoration }: { id: string; decoration: Decoration }) => {
      await api.patch(`/decorations/${id}`, decoration);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: decorationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: decorationKeys.lists() });
    },
  });
}

/* =========================================================
   DELETE DECORATION
========================================================= */
export function useDeleteDecoration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/decorations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: decorationKeys.lists() });
    },
  });
}
