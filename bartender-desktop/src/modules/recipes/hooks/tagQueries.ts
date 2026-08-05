import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import api from '../../../services/api';
import type { RecipeTag } from '../types/collection';

/* =========================================================
   QUERY KEYS
========================================================= */
export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters?: string) => [...tagKeys.lists(), filters] as const,
  details: () => [...tagKeys.all, 'detail'] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
  byCategory: (category: string) => [...tagKeys.all, 'category', category] as const,
};

/* =========================================================
   GET ALL TAGS
========================================================= */
export function useTags(options?: UseQueryOptions<RecipeTag[]>) {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET ONE TAG
========================================================= */
export function useTag(id: string, options?: UseQueryOptions<RecipeTag>) {
  return useQuery({
    queryKey: tagKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/tags/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   GET TAGS BY CATEGORY
========================================================= */
export function useTagsByCategory(category: string, options?: UseQueryOptions<RecipeTag[]>) {
  return useQuery({
    queryKey: tagKeys.byCategory(category),
    queryFn: async () => {
      const { data } = await api.get(`/tags?category=${category}`);
      return data || [];
    },
    enabled: !!category,
    ...options,
  });
}

/* =========================================================
   CREATE TAG
========================================================= */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: RecipeTag) => {
      const { data } = await api.post('/tags', tag);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

/* =========================================================
   UPDATE TAG
========================================================= */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tag }: { id: string; tag: RecipeTag }) => {
      await api.patch(`/tags/${id}`, tag);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}

/* =========================================================
   DELETE TAG
========================================================= */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
}
