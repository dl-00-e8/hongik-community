import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClubAdmin, ClubAdminInsert } from '@/types/database.types';
import type { Club } from '@/types/database.types';

// Get clubs that a user manages
export function useManagedClubs(userId: string | undefined) {
  return useQuery({
    queryKey: ['managed-clubs', userId],
    queryFn: async (): Promise<Club[]> => {
      if (!userId) return [];

      // First, try to get clubs from club_admins table (new many-to-many structure)
      const { data: clubAdminsData, error: clubAdminsError } = await supabase
        .from('club_admins')
        .select('club_id, clubs(*)')
        .eq('user_id', userId);

      // If the table exists and query succeeded
      if (!clubAdminsError && clubAdminsData) {
        const clubs = clubAdminsData
          .map((item: any) => item.clubs)
          .filter((club): club is Club => club !== null);

        // If we found clubs using the new structure, return them
        if (clubs.length > 0) {
          return clubs;
        }
      }

      // Fallback: Try to get club from users.club_id (legacy structure)
      // This handles cases where:
      // 1. club_admins table doesn't exist yet
      // 2. club_admins table is empty (migration not run)
      // 3. User has club_admin role but no entry in club_admins table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, club_id, clubs(*)')
        .eq('id', userId)
        .single();

      if (userError) {
        // If error code is PGRST116 (no rows), return empty array
        if (userError.code === 'PGRST116') return [];
        throw userError;
      }

      // Check if user has club_admin role and a club_id
      if (userData?.role === 'club_admin' && userData.club_id && userData.clubs) {
        return [userData.clubs as Club];
      }

      // Check if user is a site admin - they can manage all clubs
      if (userData?.role === 'admin') {
        const { data: allClubs, error: allClubsError } = await supabase
          .from('clubs')
          .select('*')
          .order('name');

        if (allClubsError) throw allClubsError;
        return allClubs || [];
      }

      return [];
    },
    enabled: !!userId,
  });
}

// Get all club_admins for a specific club (for admin use)
export function useClubAdmins(clubId: string | undefined) {
  return useQuery({
    queryKey: ['club-admins', clubId],
    queryFn: async (): Promise<ClubAdmin[]> => {
      if (!clubId) return [];

      const { data, error } = await supabase
        .from('club_admins')
        .select('*')
        .eq('club_id', clubId);

      if (error) throw error;

      return data || [];
    },
    enabled: !!clubId,
  });
}

// Check if a user can manage a specific club
export function useCanManageClub(userId: string | undefined, clubId: string | undefined) {
  return useQuery({
    queryKey: ['can-manage-club', userId, clubId],
    queryFn: async (): Promise<boolean> => {
      if (!userId || !clubId) return false;

      // Check if user is site admin or has the club_id set (fallback)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, club_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Site admins can manage all clubs
      if (userData?.role === 'admin') return true;

      // Check if user is club admin for this club in club_admins table
      const { data: clubAdminData, error: clubAdminError } = await supabase
        .from('club_admins')
        .select('id')
        .eq('user_id', userId)
        .eq('club_id', clubId)
        .single();

      // If found in club_admins table, return true
      if (!clubAdminError && clubAdminData) {
        return true;
      }

      // Fallback: Check if user has club_admin role and their club_id matches
      // This handles legacy data before migration
      if (userData?.role === 'club_admin' && userData.club_id === clubId) {
        return true;
      }

      return false;
    },
    enabled: !!userId && !!clubId,
  });
}

// Add a club admin (admin only)
export function useAddClubAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClubAdminInsert) => {
      const { data: result, error } = await supabase
        .from('club_admins')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['club-admins'] });
    },
  });
}

// Remove a club admin (admin only)
export function useRemoveClubAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('club_admins')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['club-admins'] });
    },
  });
}
