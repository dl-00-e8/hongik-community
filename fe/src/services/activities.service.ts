/**
 * Activities Service
 *
 * This service provides methods to interact with the club_activities table in Supabase
 */

import { supabase } from '@/lib/supabase';
import type { ClubActivity, ClubActivityInsert, ClubActivityUpdate, ActivityWithClub } from '@/types/database.types';

export class ActivitiesService {
  /**
   * Get all activities with club information
   * @param options Filter options
   * @returns Array of activities with club details
   */
  static async getAllActivities(options?: {
    clubId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('activities_with_clubs')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.clubId) {
        query = query.eq('club_id', options.clubId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as ActivityWithClub[], error: null };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Get activities by club ID
   * @param clubId Club ID
   * @param limit Optional limit
   * @returns Array of activities for the club
   */
  static async getActivitiesByClub(clubId: string, limit?: number) {
    try {
      let query = supabase
        .from('club_activities')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as ClubActivity[], error: null };
    } catch (error) {
      console.error('Error fetching club activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single activity by ID
   * @param id Activity ID
   * @returns Activity with club information
   */
  static async getActivityById(id: string) {
    try {
      const { data, error } = await supabase
        .from('activities_with_clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as ActivityWithClub, error: null };
    } catch (error) {
      console.error('Error fetching activity:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a new activity
   * @param activity Activity data
   * @returns Created activity
   */
  static async createActivity(activity: ClubActivityInsert) {
    try {
      const { data, error } = await supabase
        .from('club_activities')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;

      return { data: data as ClubActivity, error: null };
    } catch (error) {
      console.error('Error creating activity:', error);
      return { data: null, error };
    }
  }

  /**
   * Update an existing activity
   * @param id Activity ID
   * @param updates Activity updates
   * @returns Updated activity
   */
  static async updateActivity(id: string, updates: ClubActivityUpdate) {
    try {
      const { data, error } = await supabase
        .from('club_activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as ClubActivity, error: null };
    } catch (error) {
      console.error('Error updating activity:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete an activity
   * @param id Activity ID
   * @returns Success status
   */
  static async deleteActivity(id: string) {
    try {
      const { error } = await supabase
        .from('club_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting activity:', error);
      return { success: false, error };
    }
  }

  /**
   * Get recent activities across all clubs
   * @param limit Number of activities to fetch
   * @returns Array of recent activities
   */
  static async getRecentActivities(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('activities_with_clubs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data as ActivityWithClub[], error: null };
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Get Instagram activities
   * @param clubId Optional club filter
   * @returns Array of Instagram activities
   */
  static async getInstagramActivities(clubId?: string) {
    try {
      let query = supabase
        .from('activities_with_clubs')
        .select('*')
        .eq('is_instagram', true)
        .order('created_at', { ascending: false });

      if (clubId) {
        query = query.eq('club_id', clubId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data as ActivityWithClub[], error: null };
    } catch (error) {
      console.error('Error fetching Instagram activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Batch create activities (useful for Instagram imports)
   * @param activities Array of activity data
   * @returns Created activities
   */
  static async batchCreateActivities(activities: ClubActivityInsert[]) {
    try {
      const { data, error } = await supabase
        .from('club_activities')
        .insert(activities)
        .select();

      if (error) throw error;

      return { data: data as ClubActivity[], error: null };
    } catch (error) {
      console.error('Error batch creating activities:', error);
      return { data: null, error };
    }
  }

  /**
   * Get activity count by club
   * @param clubId Club ID
   * @returns Activity count
   */
  static async getActivityCountByClub(clubId: string) {
    try {
      const { count, error } = await supabase
        .from('club_activities')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (error) throw error;

      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Error fetching activity count:', error);
      return { data: null, error };
    }
  }
}

export default ActivitiesService;
