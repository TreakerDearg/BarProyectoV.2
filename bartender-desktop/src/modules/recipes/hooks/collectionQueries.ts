import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import api from '../../../services/api';
import type { RecipeCollection } from '../types/collection';

/* =========================================================
   QUERY KEYS
========================================================= */
export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters?: string) => [...collectionKeys.lists(), filters] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  bySystem: (isSystem: boolean) => [...collectionKeys.all, 'system', isSystem] as const,
};

/* =========================================================
   GET ALL COLLECTIONS
========================================================= */
export function useCollections(options?: UseQueryOptions<RecipeCollection[]>) {
  return useQuery({
    queryKey: collectionKeys.list(),
    queryFn: async () => {
      const { data } = await api.get('/collections');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   GET ONE COLLECTION
========================================================= */
export function useCollection(id: string, options?: UseQueryOptions<RecipeCollection>) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/collections/${id}`);
      return data;
    },
    enabled: !!id,
    ...options,
  });
}

/* =========================================================
   GET SYSTEM COLLECTIONS
========================================================= */
export function useSystemCollections(options?: UseQueryOptions<RecipeCollection[]>) {
  return useQuery({
    queryKey: collectionKeys.bySystem(true),
    queryFn: async () => {
      const { data } = await api.get('/collections?isSystem=true');
      return data || [];
    },
    ...options,
  });
}

/* =========================================================
   CREATE COLLECTION
========================================================= */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: RecipeCollection) => {
      const { data } = await api.post('/collections', collection);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

/* =========================================================
   UPDATE COLLECTION
========================================================= */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, collection }: { id: string; collection: RecipeCollection }) => {
      await api.patch(`/collections/${id}`, collection);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

/* =========================================================
   DELETE COLLECTION
========================================================= */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}
