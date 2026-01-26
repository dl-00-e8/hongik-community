/**
 * 디버깅 유틸리티
 */

export const debugAuth = () => {
  console.log('🔍 Debug: Checking localStorage');
  
  // Supabase 관련 localStorage 확인
  const keys = Object.keys(localStorage);
  const supabaseKeys = keys.filter(key => key.includes('supabase'));
  
  console.log('🔍 Supabase localStorage keys:', supabaseKeys);
  
  supabaseKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        console.log(`🔍 ${key}:`, {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: parsed.expires_at,
          user: parsed.user?.email
        });
      }
    } catch (e) {
      console.log(`🔍 ${key}: (not JSON)`);
    }
  });
};

export const clearAuthStorage = () => {
  console.log('🧹 Clearing auth storage...');
  const keys = Object.keys(localStorage);
  const supabaseKeys = keys.filter(key => key.includes('supabase'));
  supabaseKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🧹 Removed: ${key}`);
  });
  console.log('✅ Auth storage cleared');
};
