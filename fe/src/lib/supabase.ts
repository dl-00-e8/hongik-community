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

console.log('🔧 Supabase client initialized:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  }
});

// 디버깅 함수를 전역으로 노출
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAuthStorage = clearAuthStorage;
  console.log('🔧 Debug functions available: debugAuth(), clearAuthStorage()');
}
