import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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

  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('🔐 Session found:', session.user.email, 'id:', session.user.id);
          setSupabaseUser(session.user);

          try {
            // auth.getUser() 대신 session에서 직접 user.id를 사용
            const userData = await authService.getUserProfileById(session.user.id);
            console.log('👤 initializeAuth - User data loaded:', userData);
            setUser(userData);
          } catch (userError) {
            console.error('❌ initializeAuth - Error loading user data:', userError);
            // 프로필 로드 실패 시에도 세션은 유지하되, user는 null로 설정
            setUser(null);
          }
        } else {
          console.log('ℹ️ No session found');
          setSupabaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setSupabaseUser(null);
        setUser(null);
      } finally {
        console.log('✅ Auth initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, 'session:', session?.user?.email);

      try {
        if (session?.user) {
          setSupabaseUser(session.user);
          setLoading(true);
          console.log('🔄 Loading user data in onAuthStateChange for user:', session.user.id);

          try {
            // auth.getUser() 대신 session에서 직접 user.id를 사용
            const userData = await authService.getUserProfileById(session.user.id);
            console.log('✅ onAuthStateChange - User data loaded:', userData);
            setUser(userData);
          } catch (userError) {
            console.error('❌ onAuthStateChange - Error loading user data:', userError);
            console.error('❌ Error details:', {
              message: userError instanceof Error ? userError.message : 'Unknown error',
              stack: userError instanceof Error ? userError.stack : null
            });
            setUser(null);
          }
        } else {
          console.log('ℹ️ No session in onAuthStateChange');
          setSupabaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Unexpected error in onAuthStateChange:', error);
        setSupabaseUser(null);
        setUser(null);
      } finally {
        console.log('🔄 onAuthStateChange complete - setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in:', email);
      setLoading(true);

      const { data } = await authService.signIn({ email, password });
      console.log('✅ Sign in successful, session:', data.session?.user?.email);

      // 즉시 user 데이터 로드 (onAuthStateChange를 기다리지 않음)
      if (data.session?.user) {
        setSupabaseUser(data.session.user);
        try {
          const userData = await authService.getUserProfileById(data.session.user.id);
          console.log('✅ User data loaded after sign in:', userData);
          setUser(userData);
        } catch (userError) {
          console.error('❌ Error loading user data after sign in:', userError);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    } finally {
      setLoading(false);
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
      setUser(null);
      setSupabaseUser(null);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
