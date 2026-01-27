export interface RoleChangeRequest {
  id: string;
  user_id: string;
  from_role: 'user' | 'club_admin' | 'admin';
  requested_role: 'club_admin' | 'admin';
  club_id?: string | null;
  new_club_name?: string | null;
  new_club_description?: string | null;
  reason?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleChangeRequestWithUser extends RoleChangeRequest {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  club?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateRoleChangeRequestData {
  from_role: 'user' | 'club_admin' | 'admin';
  requested_role: 'club_admin' | 'admin';
  club_id?: string;
  new_club_name?: string;
  new_club_description?: string;
  reason?: string;
}

export interface UpdateRoleChangeRequestData {
  status: 'approved' | 'rejected';
  reviewed_by: string;
  reviewed_at: string;
}