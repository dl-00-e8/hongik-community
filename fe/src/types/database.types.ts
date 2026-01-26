/**
 * Supabase Database Types
 *
 * 이 파일은 Supabase 데이터베이스 스키마에 대한 TypeScript 타입 정의를 포함합니다.
 * Supabase CLI를 사용하여 자동 생성할 수도 있습니다:
 * npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
 */

export type UserRole = 'user' | 'club_admin' | 'admin';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          club_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          club_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          club_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          category_id: string | null;
          short_description: string;
          description: string;
          president: string;
          contact: string;
          club_room: string | null;
          recruitment_start: string | null;
          recruitment_end: string | null;
          regular_schedule: string | null;
          instagram_handle: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          member_count: number;
          is_recruiting: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category_id?: string | null;
          short_description: string;
          description: string;
          president: string;
          contact: string;
          club_room?: string | null;
          recruitment_start?: string | null;
          recruitment_end?: string | null;
          regular_schedule?: string | null;
          instagram_handle?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          member_count?: number;
          is_recruiting?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category_id?: string | null;
          short_description?: string;
          description?: string;
          president?: string;
          contact?: string;
          club_room?: string | null;
          recruitment_start?: string | null;
          recruitment_end?: string | null;
          regular_schedule?: string | null;
          instagram_handle?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          member_count?: number;
          is_recruiting?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_activities: {
        Row: {
          id: string;
          club_id: string;
          image_url: string;
          caption: string | null;
          is_instagram: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          image_url: string;
          caption?: string | null;
          is_instagram?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          image_url?: string;
          caption?: string | null;
          is_instagram?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      club_members: {
        Row: {
          id: string;
          club_id: string;
          user_id: string;
          position: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          user_id: string;
          position?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          user_id?: string;
          position?: string | null;
          joined_at?: string;
        };
      };
      club_admin_requests: {
        Row: {
          id: string;
          user_id: string;
          club_id: string;
          status: 'pending' | 'approved' | 'rejected';
          message: string | null;
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          club_id: string;
          status: 'pending' | 'approved' | 'rejected';
          message?: string | null;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          club_id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          message?: string | null;
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      clubs_with_categories: {
        Row: {
          id: string;
          name: string;
          category_id: string | null;
          category_name: string | null;
          category_icon: string | null;
          short_description: string;
          description: string;
          president: string;
          contact: string;
          club_room: string | null;
          recruitment_start: string | null;
          recruitment_end: string | null;
          regular_schedule: string | null;
          instagram_handle: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          member_count: number;
          is_recruiting: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      activities_with_clubs: {
        Row: {
          id: string;
          club_id: string;
          club_name: string;
          club_logo_url: string | null;
          image_url: string;
          caption: string | null;
          is_instagram: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

// Helper types for tables
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Club = Database['public']['Tables']['clubs']['Row'];
export type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
export type ClubUpdate = Database['public']['Tables']['clubs']['Update'];

export type ClubActivity = Database['public']['Tables']['club_activities']['Row'];
export type ClubActivityInsert = Database['public']['Tables']['club_activities']['Insert'];
export type ClubActivityUpdate = Database['public']['Tables']['club_activities']['Update'];

export type ClubMember = Database['public']['Tables']['club_members']['Row'];
export type ClubMemberInsert = Database['public']['Tables']['club_members']['Insert'];
export type ClubMemberUpdate = Database['public']['Tables']['club_members']['Update'];

export type ClubAdminRequest = Database['public']['Tables']['club_admin_requests']['Row'];
export type ClubAdminRequestInsert = Database['public']['Tables']['club_admin_requests']['Insert'];
export type ClubAdminRequestUpdate = Database['public']['Tables']['club_admin_requests']['Update'];

// Helper types for views
export type ClubWithCategory = Database['public']['Views']['clubs_with_categories']['Row'];
export type ActivityWithClub = Database['public']['Views']['activities_with_clubs']['Row'];
