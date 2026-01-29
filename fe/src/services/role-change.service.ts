import { supabase } from '@/lib/supabase';
import {
  RoleChangeRequest,
  RoleChangeRequestWithUser,
  CreateRoleChangeRequestData,
  UpdateRoleChangeRequestData,
} from '@/types/role-change.types';

export const roleChangeService = {
  /**
   * 역할 변경 신청 생성
   */
  async createRequest(
    userId: string,
    data: CreateRoleChangeRequestData
  ): Promise<RoleChangeRequest> {
    const { data: request, error } = await supabase
      .from('role_change_requests')
      .insert({
        user_id: userId,
        ...data,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create role change request: ${error.message}`);
    }

    return request;
  },

  /**
   * 현재 사용자의 역할 변경 신청 목록 조회
   */
  async getMyRequests(userId: string): Promise<RoleChangeRequest[]> {
    const { data: requests, error } = await supabase
      .from('role_change_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch requests: ${error.message}`);
    }

    return requests || [];
  },

  /**
   * 모든 역할 변경 신청 조회 (관리자용)
   */
  async getAllRequests(): Promise<RoleChangeRequestWithUser[]> {
    const { data: requests, error } = await supabase
      .from('role_change_requests')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          role
        ),
        club:clubs!club_id (
          id,
          name
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch all requests: ${error.message}`);
    }

    return requests || [];
  },

  /**
   * 특정 역할 변경 신청 조회
   */
  async getRequestById(requestId: string): Promise<RoleChangeRequestWithUser> {
    const { data: request, error } = await supabase
      .from('role_change_requests')
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          email,
          role
        ),
        club:clubs!club_id (
          id,
          name
        )
      `
      )
      .eq('id', requestId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch request: ${error.message}`);
    }

    return request;
  },

  /**
   * 역할 변경 신청 승인
   */
  async approveRequest(
    requestId: string,
    reviewerId: string
  ): Promise<RoleChangeRequest> {
    // 트랜잭션으로 처리: 신청 승인 + 사용자 역할 업데이트
    const { data: request, error: fetchError } = await supabase
      .from('role_change_requests')
      .select('*, user:users!user_id(id, role)')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Request not found');
    }

    // 1. 사용자 역할 업데이트
    const updateData: any = {
      role: request.requested_role,
    };

    // 동아리 관리자로 승인하는 경우 club_id 설정
    if (request.requested_role === 'club_admin' && request.club_id) {
      updateData.club_id = request.club_id;
    }

    const { error: userUpdateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', request.user_id);

    if (userUpdateError) {
      throw new Error(`Failed to update user role: ${userUpdateError.message}`);
    }

    // 2. 신청 상태 업데이트
    const { data: updatedRequest, error: updateError } = await supabase
      .from('role_change_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to approve request: ${updateError.message}`);
    }

    return updatedRequest;
  },

  /**
   * 역할 변경 신청 거부
   */
  async rejectRequest(
    requestId: string,
    reviewerId: string
  ): Promise<RoleChangeRequest> {
    const { data: request, error } = await supabase
      .from('role_change_requests')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject request: ${error.message}`);
    }

    return request;
  },

  /**
   * 대기 중인 신청 개수 조회 (관리자용)
   */
  async getPendingCount(): Promise<number> {
    const { count, error } = await supabase
      .from('role_change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to fetch pending count: ${error.message}`);
    }

    return count || 0;
  },
};
