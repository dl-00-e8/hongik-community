/**
 * Categories Service
 *
 * This service provides methods to interact with the categories table in Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Category, CategoryInsert, CategoryUpdate } from '@/types/database.types';

export class CategoriesService {
  /**
   * Get all categories
   * @returns Array of categories ordered by display_order
   */
  static async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      return { data: data as Category[], error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single category by ID
   * @param id Category ID
   * @returns Category
   */
  static async getCategoryById(id: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Category, error: null };
    } catch (error) {
      console.error('Error fetching category:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single category by name
   * @param name Category name
   * @returns Category
   */
  static async getCategoryByName(name: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;

      return { data: data as Category, error: null };
    } catch (error) {
      console.error('Error fetching category by name:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new category
   * @param category Category data
   * @returns Created category
   */
  static async createCategory(category: CategoryInsert) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Category, error: null };
    } catch (error) {
      console.error('Error creating category:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing category
   * @param id Category ID
   * @param updates Category updates
   * @returns Updated category
   */
  static async updateCategory(id: string, updates: CategoryUpdate) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Category, error: null };
    } catch (error) {
      console.error('Error updating category:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a category
   * @param id Category ID
   * @returns Success status
   */
  static async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error };
    }
  }

  /**
   * Reorder categories
   * @param categoryOrders Array of { id, display_order } pairs
   * @returns Success status
   */
  static async reorderCategories(categoryOrders: { id: string; display_order: number }[]) {
    try {
      // Update each category's display order
      const updates = categoryOrders.map(({ id, display_order }) =>
        supabase
          .from('categories')
          .update({ display_order })
          .eq('id', id)
      );

      await Promise.all(updates);

      return { success: true, error: null };
    } catch (error) {
      console.error('Error reordering categories:', error);
      return { success: false, error };
    }
  }

  /**
   * Get category with club count
   * @returns Array of categories with club counts
   */
  static async getCategoriesWithClubCount() {
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (catError) throw catError;

      // Get club counts for each category
      const categoriesWithCount = await Promise.all(
        (categories || []).map(async (category) => {
          const { count, error } = await supabase
            .from('clubs')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          if (error) {
            console.error('Error counting clubs:', error);
            return { ...category, club_count: 0 };
          }

          return { ...category, club_count: count || 0 };
        })
      );

      return { data: categoriesWithCount, error: null };
    } catch (error) {
      console.error('Error fetching categories with club count:', error);
      return { data: null, error };
    }
  }
}

export default CategoriesService;
