/**
 * useActivities Hook
 *
 * Custom React hook for managing club activities data with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ActivitiesService from '@/services/activities.service';
import type { ClubActivityInsert, ClubActivityUpdate } from '@/types/database.types';
import { toast } from 'sonner';

/**
 * Hook to fetch all activities
 */
export function useActivities(options?: {
  clubId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['activities', options],
    queryFn: async () => {
      const { data, error } = await ActivitiesService.getAllActivities(options);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch activities by club ID
 */
export function useClubActivities(clubId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ['activities', 'club', clubId, limit],
    queryFn: async () => {
      if (!clubId) return [];
      const { data, error } = await ActivitiesService.getActivitiesByClub(clubId, limit);
      if (error) throw error;
      return data;
    },
    enabled: !!clubId,
  });
}

/**
 * Hook to fetch a single activity by ID
 */
export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await ActivitiesService.getActivityById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch recent activities
 */
export function useRecentActivities(limit: number = 10) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await ActivitiesService.getRecentActivities(limit);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch Instagram activities
 */
export function useInstagramActivities(clubId?: string) {
  return useQuery({
    queryKey: ['activities', 'instagram', clubId],
    queryFn: async () => {
      const { data, error } = await ActivitiesService.getInstagramActivities(clubId);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get activity count by club
 */
export function useActivityCount(clubId: string | undefined) {
  return useQuery({
    queryKey: ['activities', 'count', clubId],
    queryFn: async () => {
      if (!clubId) return 0;
      const { data, error } = await ActivitiesService.getActivityCountByClub(clubId);
      if (error) throw error;
      return data;
    },
    enabled: !!clubId,
  });
}

/**
 * Hook to create a new activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: ClubActivityInsert) => {
      const { data, error } = await ActivitiesService.createActivity(activity);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'club', variables.club_id] });
      toast.success('활동이 등록되었습니다');
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast.error('활동 등록에 실패했습니다');
    },
  });
}

/**
 * Hook to batch create activities
 */
export function useBatchCreateActivities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activities: ClubActivityInsert[]) => {
      const { data, error } = await ActivitiesService.batchCreateActivities(activities);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('활동들이 등록되었습니다');
    },
    onError: (error) => {
      console.error('Error batch creating activities:', error);
      toast.error('활동 등록에 실패했습니다');
    },
  });
}

/**
 * Hook to update an activity
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClubActivityUpdate }) => {
      const { data, error } = await ActivitiesService.updateActivity(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['activities', variables.id] });
      toast.success('활동이 수정되었습니다');
    },
    onError: (error) => {
      console.error('Error updating activity:', error);
      toast.error('활동 수정에 실패했습니다');
    },
  });
}

/**
 * Hook to delete an activity
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { success, error } = await ActivitiesService.deleteActivity(id);
      if (error) throw error;
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('활동이 삭제되었습니다');
    },
    onError: (error) => {
      console.error('Error deleting activity:', error);
      toast.error('활동 삭제에 실패했습니다');
    },
  });
}
