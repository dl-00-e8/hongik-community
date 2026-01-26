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
   * Session에서 직접 사용자 프로필 가져오기 (auth.getUser() 우회)
   */
  async getUserProfileById(userId: string): Promise<User | null> {
    try {
      console.log('🔍 getUserProfileById() called for:', userId);

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('🔍 Database query result:', {
        hasData: !!userData,
        error: dbError
      });

      if (dbError) {
        console.error('❌ Error fetching user profile:', dbError);
        throw new Error(`DB Error: ${dbError.message}`);
      }

      if (!userData) {
        console.error('❌ No user profile found for id:', userId);
        return null;
      }

      console.log('✅ User profile loaded:', userData);
      return userData;
    } catch (error) {
      console.error('❌ getUserProfileById() failed:', error);
      throw error;
    }
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
    let retries = 5;
    let profileCreated = false;

    for (let i = 0; i < retries; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (userData && !error) {
        profileCreated = true;
        break;
      }
    }

    if (!profileCreated) {
      console.warn('프로필 생성 확인 실패, 하지만 계속 진행합니다.');
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
   * 참고: 이 메서드는 auth.getUser() timeout 문제로 인해 더 이상 사용하지 않습니다.
   * 대신 getUserProfileById()를 session.user.id와 함께 사용하세요.
   */
  async getCurrentUser(): Promise<User | null> {
    console.warn('⚠️ getCurrentUser() is deprecated. Use getUserProfileById() instead.');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log('ℹ️ No session');
        return null;
      }

      return await this.getUserProfileById(session.user.id);
    } catch (error) {
      console.error('❌ getCurrentUser() failed:', error);
      throw error;
    }
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
