/**
 * Clubs Service
 *
 * This service provides methods to interact with the clubs table in Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Club, ClubInsert, ClubUpdate, ClubWithCategory } from '@/types/database.types';

export class ClubsService {
  /**
   * Get all clubs with category information
   * @param categoryId Optional category filter
   * @param isRecruiting Optional recruitment status filter
   * @returns Array of clubs with category details
   */
  static async getAllClubs(options?: {
    categoryId?: string;
    isRecruiting?: boolean;
    searchQuery?: string;
  }) {
    try {
      let query = supabase
        .from('clubs_with_categories')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.isRecruiting !== undefined) {
        query = query.eq('is_recruiting', options.isRecruiting);
      }

      if (options?.searchQuery) {
        query = query.or(
          `name.ilike.%${options.searchQuery}%,short_description.ilike.%${options.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as ClubWithCategory[], error: null };
    } catch (error) {
      console.error('Error fetching clubs:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single club by ID
   * @param id Club ID
   * @returns Club with category information
   */
  static async getClubById(id: string) {
    try {
      const { data, error } = await supabase
        .from('clubs_with_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as ClubWithCategory, error: null };
    } catch (error) {
      console.error('Error fetching club:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single club by name
   * @param name Club name
   * @returns Club with category information
   */
  static async getClubByName(name: string) {
    try {
      const { data, error } = await supabase
        .from('clubs_with_categories')
        .select('*')
        .eq('name', name)
        .single();

      if (error) throw error;

      return { data: data as ClubWithCategory, error: null };
    } catch (error) {
      console.error('Error fetching club by name:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new club
   * @param club Club data
   * @returns Created club
   */
  static async createClub(club: ClubInsert) {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert(club)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Club, error: null };
    } catch (error) {
      console.error('Error creating club:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing club
   * @param id Club ID
   * @param updates Club updates
   * @returns Updated club
   */
  static async updateClub(id: string, updates: ClubUpdate) {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Club, error: null };
    } catch (error) {
      console.error('Error updating club:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a club
   * @param id Club ID
   * @returns Success status
   */
  static async deleteClub(id: string) {
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting club:', error);
      return { success: false, error };
    }
  }

  /**
   * Get recruiting clubs
   * @returns Array of clubs currently recruiting
   */
  static async getRecruitingClubs() {
    try {
      const { data, error } = await supabase
        .from('clubs_with_categories')
        .select('*')
        .eq('is_recruiting', true)
        .order('recruitment_end', { ascending: true });

      if (error) throw error;

      return { data: data as ClubWithCategory[], error: null };
    } catch (error) {
      console.error('Error fetching recruiting clubs:', error);
      return { data: null, error };
    }
  }

  /**
   * Get clubs by category
   * @param categoryName Category name
   * @returns Array of clubs in the category
   */
  static async getClubsByCategory(categoryName: string) {
    try {
      // First get the category ID
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (categoryError) throw categoryError;

      // Then get clubs by category ID
      const { data, error } = await supabase
        .from('clubs_with_categories')
        .select('*')
        .eq('category_id', category.id)
        .order('name', { ascending: true });

      if (error) throw error;

      return { data: data as ClubWithCategory[], error: null };
    } catch (error) {
      console.error('Error fetching clubs by category:', error);
      return { data: null, error };
    }
  }

  /**
   * Search clubs by name or description
   * @param query Search query
   * @returns Array of matching clubs
   */
  static async searchClubs(query: string) {
    try {
      const { data, error } = await supabase
        .from('clubs_with_categories')
        .select('*')
        .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return { data: data as ClubWithCategory[], error: null };
    } catch (error) {
      console.error('Error searching clubs:', error);
      return { data: null, error };
    }
  }

  /**
   * Get club statistics
   * @returns Club statistics
   */
  static async getClubStatistics() {
    try {
      const { count: totalClubs, error: totalError } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const { count: recruitingClubs, error: recruitingError } = await supabase
        .from('clubs')
        .select('*', { count: 'exact', head: true })
        .eq('is_recruiting', true);

      if (recruitingError) throw recruitingError;

      const { data: memberData, error: memberError } = await supabase
        .from('clubs')
        .select('member_count');

      if (memberError) throw memberError;

      const totalMembers = memberData?.reduce((sum, club) => sum + (club.member_count || 0), 0) || 0;

      return {
        data: {
          totalClubs: totalClubs || 0,
          recruitingClubs: recruitingClubs || 0,
          totalMembers,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching club statistics:', error);
      return { data: null, error };
    }
  }
}

export default ClubsService;
