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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
