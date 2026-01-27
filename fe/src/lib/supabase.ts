import { createClient } from '@supabase/supabase-js';
import { debugAuth, clearAuthStorage } from './debug';

// Vite 환경에서는 import.meta.env를, Node.js에서는 process.env를 사용
const supabaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  }
});

// Supabase 초기화 완료를 보장하는 헬퍼
let initializationPromise: Promise<void> | null = null;

export const ensureSupabaseInitialized = async (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // getSession()을 호출하여 초기화 완료를 기다림
      // 이렇게 하면 내부적으로 _initialize와 _recoverAndRefresh가 완료됨
      await supabase.auth.getSession();
    } catch (error) {
      console.error('Supabase initialization failed:', error);
    }
  })();

  return initializationPromise;
};

// 디버깅 함수를 전역으로 노출 (개발 환경)
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuthStorage = clearAuthStorage;
  (window as any).ensureSupabaseInitialized = ensureSupabaseInitialized;
}
