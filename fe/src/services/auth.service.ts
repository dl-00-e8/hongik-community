import { supabase } from '@/lib/supabase';
import {
  isHongikEmail,
  validatePasswordStrength,
  validatePasswordMatch,
  validateName,
} from '@/lib/utils/validation';

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword?: string;
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
   * 사용자 프로필 가져오기
   */
  async getUserProfileById(userId: string, retries = 2): Promise<User | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (dbError) {
          // RLS 에러인 경우 재시도
          if (dbError.code === 'PGRST116' && attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
          throw new Error(`Database error: ${dbError.message}`);
        }

        return userData || null;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return null;
  },
  /**
   * 회원가입
   */
  async signUp({ email, password, confirmPassword, name, role }: SignUpData) {
    // 1. 클라이언트 측 검증
    // 이름 검증
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    // 이메일 도메인 검증
    if (!isHongikEmail(email)) {
      throw new Error(
        '홍익대학교 이메일(@g.hongik.ac.kr 또는 @hongik.ac.kr)만 사용 가능합니다.'
      );
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // 비밀번호 확인 검증 (제공된 경우)
    if (confirmPassword !== undefined) {
      const matchValidation = validatePasswordMatch(password, confirmPassword);
      if (!matchValidation.isValid) {
        throw new Error(matchValidation.message);
      }
    }

    // 2. Supabase Auth를 통한 사용자 생성
    // 트리거가 자동으로 public.users 테이블에 레코드를 생성합니다
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        emailRedirectTo: `${appUrl}/`,
      },
    });

    if (authError) {
      // 더 명확한 에러 메시지
      if (authError.message.includes('already registered')) {
        throw new Error('이미 가입된 이메일입니다.');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('회원가입에 실패했습니다.');
    }

    // 3. 트리거가 users 테이블에 레코드를 생성할 때까지 잠시 대기
    // 프로필이 생성되었는지 확인
    for (let i = 0; i < 5; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (userData && !error) {
        break;
      }
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
   * @deprecated Use getUserProfileById() with session.user.id instead
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        return null;
      }

      return await this.getUserProfileById(session.user.id);
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  /**
   * 세션 확인
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return error ? null : session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async resetPassword(email: string) {
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/`,
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
