import { supabase } from '@/lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'club_admin' | 'admin';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'club_admin' | 'admin';
  created_at: string;
}

export const authService = {
  /**
   * 회원가입
   */
  async signUp({ email, password, name, role }: SignUpData) {
    // 1. Supabase Auth를 통한 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('회원가입에 실패했습니다.');
    }

    // 2. users 테이블에 추가 정보 저장
    const { error: profileError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        email,
        name,
        role,
      },
    ]);

    if (profileError) {
      throw new Error(profileError.message);
    }

    return authData;
  },

  /**
   * 로그인
   */
  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * 로그아웃
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * 현재 로그인된 사용자 정보 가져오기
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // users 테이블에서 추가 정보 가져오기
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return userData;
  },

  /**
   * 세션 확인
   */
  async getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * 비밀번호 업데이트
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
};
