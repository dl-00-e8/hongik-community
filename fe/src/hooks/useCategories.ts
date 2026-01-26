/**
 * useCategories Hook
 *
 * Custom React hook for managing categories data with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CategoriesService from '@/services/categories.service';
import type { CategoryInsert, CategoryUpdate } from '@/types/database.types';
import { toast } from 'sonner';

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await CategoriesService.getAllCategories();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Categories don't change often, cache for 5 minutes
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await CategoriesService.getCategoryById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch categories with club count
 */
export function useCategoriesWithClubCount() {
  return useQuery({
    queryKey: ['categories', 'with-club-count'],
    queryFn: async () => {
      const { data, error } = await CategoriesService.getCategoriesWithClubCount();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await CategoriesService.createCategory(category);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('카테고리가 생성되었습니다');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('카테고리 생성에 실패했습니다');
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CategoryUpdate }) => {
      const { data, error } = await CategoriesService.updateCategory(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] });
      toast.success('카테고리가 수정되었습니다');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('카테고리 수정에 실패했습니다');
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { success, error } = await CategoriesService.deleteCategory(id);
      if (error) throw error;
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('카테고리가 삭제되었습니다');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('카테고리 삭제에 실패했습니다');
    },
  });
}

/**
 * Hook to reorder categories
 */
export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryOrders: { id: string; display_order: number }[]) => {
      const { success, error } = await CategoriesService.reorderCategories(categoryOrders);
      if (error) throw error;
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('카테고리 순서가 변경되었습니다');
    },
    onError: (error) => {
      console.error('Error reordering categories:', error);
      toast.error('카테고리 순서 변경에 실패했습니다');
    },
  });
}
