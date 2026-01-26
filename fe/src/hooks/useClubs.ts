/**
 * useClubs Hook
 *
 * Custom React hook for managing clubs data with TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ClubsService from '@/services/clubs.service';
import type { ClubInsert, ClubUpdate } from '@/types/database.types';
import { toast } from 'sonner';

/**
 * Hook to fetch all clubs
 */
export function useClubs(options?: {
  categoryId?: string;
  isRecruiting?: boolean;
  searchQuery?: string;
}) {
  return useQuery({
    queryKey: ['clubs', options],
    queryFn: async () => {
      const { data, error } = await ClubsService.getAllClubs(options);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch a single club by ID
 */
export function useClub(id: string | undefined) {
  return useQuery({
    queryKey: ['clubs', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await ClubsService.getClubById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch recruiting clubs
 */
export function useRecruitingClubs() {
  return useQuery({
    queryKey: ['clubs', 'recruiting'],
    queryFn: async () => {
      const { data, error } = await ClubsService.getRecruitingClubs();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to search clubs
 */
export function useSearchClubs(query: string) {
  return useQuery({
    queryKey: ['clubs', 'search', query],
    queryFn: async () => {
      if (!query) return [];
      const { data, error } = await ClubsService.searchClubs(query);
      if (error) throw error;
      return data;
    },
    enabled: query.length > 0,
  });
}

/**
 * Hook to get club statistics
 */
export function useClubStatistics() {
  return useQuery({
    queryKey: ['clubs', 'statistics'],
    queryFn: async () => {
      const { data, error } = await ClubsService.getClubStatistics();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to create a new club
 */
export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (club: ClubInsert) => {
      const { data, error } = await ClubsService.createClub(club);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast.success('동아리가 생성되었습니다');
    },
    onError: (error) => {
      console.error('Error creating club:', error);
      toast.error('동아리 생성에 실패했습니다');
    },
  });
}

/**
 * Hook to update a club
 */
export function useUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClubUpdate }) => {
      const { data, error } = await ClubsService.updateClub(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['clubs', variables.id] });
      toast.success('동아리 정보가 수정되었습니다');
    },
    onError: (error) => {
      console.error('Error updating club:', error);
      toast.error('동아리 정보 수정에 실패했습니다');
    },
  });
}

/**
 * Hook to delete a club
 */
export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { success, error } = await ClubsService.deleteClub(id);
      if (error) throw error;
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast.success('동아리가 삭제되었습니다');
    },
    onError: (error) => {
      console.error('Error deleting club:', error);
      toast.error('동아리 삭제에 실패했습니다');
    },
  });
}
