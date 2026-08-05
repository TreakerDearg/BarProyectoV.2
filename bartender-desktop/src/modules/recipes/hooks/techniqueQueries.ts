import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import api from '../../../services/api';
import type { Technique } from '../types/technique';

/* =========================================================
   QUERY KEYS
========================================================= */
export const techniqueKeys = {
  all: ['techniques'] as const,
  lists: () => [...techniqueKeys.all, 'list'] as const,
  list: (filters?: string) => [...techniqueKeys.lists(), filters] as const,
  details: () => [...techniqueKeys.all, 'detail'] as const,
  detail: (id: string) => [...techniqueKeys.details(), id] as const,
  byCategory: (category: string) => [...techniqueKeys.all, 'category', category] as const,
};

/* =========================================================
   GET ALL TECHNIQUES
========================================================= */
export function useTechniques(options?: UseQueryOptions<Technique[]>) {
  return useQuery({
    queryKey: techniqueKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/techniques');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET ONE TECHNIQUE
========================================================= */
export function useTechnique(id: string, options?: UseQueryOptions<Technique>) {
  return useQuery({
    queryKey: techniqueKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/techniques/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   GET TECHNIQUES BY CATEGORY
========================================================= */
export function useTechniquesByCategory(category: string, options?: UseQueryOptions<Technique[]>) {
  return useQuery({
    queryKey: techniqueKeys.byCategory(category),
    queryFn: async () => {
      const { data } = await api.get(`/techniques?category=${category}`);
      return data || [];
    },
    enabled: !!category,
    ...options,
  });
}

/* =========================================================
   CREATE TECHNIQUE
========================================================= */
export function useCreateTechnique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (technique: Technique) => {
      const { data } = await api.post('/techniques', technique);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: techniqueKeys.lists() });
    },
  });
}

/* =========================================================
   UPDATE TECHNIQUE
========================================================= */
export function useUpdateTechnique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, technique }: { id: string; technique: Technique }) => {
      await api.patch(`/techniques/${id}`, technique);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: techniqueKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: techniqueKeys.lists() });
    },
  });
}

/* =========================================================
   DELETE TECHNIQUE
========================================================= */
export function useDeleteTechnique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/techniques/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: techniqueKeys.lists() });
    },
  });
}
