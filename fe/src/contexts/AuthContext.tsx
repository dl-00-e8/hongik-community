import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, ensureSupabaseInitialized } from '@/lib/supabase';
import { authService, User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'club_admin' | 'admin';
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 프로필을 로드하는 헬퍼 함수
  const loadUserProfile = async (userId: string): Promise<User | null> => {
    try {
      return await authService.getUserProfileById(userId);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // 1. Supabase 초기화 완료를 기다림
      await ensureSupabaseInitialized();

      if (!isMounted) return;

      // 2. 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      if (session?.user) {
        setSupabaseUser(session.user);

        const userData = await loadUserProfile(session.user.id);
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      } else {
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
      }

      // 3. 인증 상태 변경 리스너 등록
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          setSupabaseUser(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setSupabaseUser(session.user);

            const userData = await loadUserProfile(session.user.id);
            if (isMounted) {
              setUser(userData);
              setLoading(false);
            }
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    let cleanup: (() => void) | undefined;

    initialize().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      const data = await authService.signIn({ email, password });

      // 즉각적인 UI 업데이트를 위해 상태를 미리 설정
      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        const userData = await loadUserProfile(data.session.user.id);
        setUser(userData);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'club_admin' | 'admin';
  }) => {
    setLoading(true);
    try {
      await authService.signUp(data);
      // onAuthStateChange가 자동으로 사용자 정보를 업데이트합니다
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      // onAuthStateChange가 자동으로 상태를 정리합니다
    } catch (error) {
      // 에러가 발생해도 로컬 상태는 정리
      setUser(null);
      setSupabaseUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  };

  // 디버깅을 위해 window에 노출
  if (typeof window !== 'undefined') {
    (window as any).authDebug = () => {
      console.log('🔍 AuthContext State:', {
        user: user,
        supabaseUser: supabaseUser,
        loading: loading,
        hasUser: !!user,
        hasSupabaseUser: !!supabaseUser,
      });
    };
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
