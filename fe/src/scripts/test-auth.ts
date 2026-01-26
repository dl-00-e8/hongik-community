/**
 * 인증 기능 테스트 스크립트
 *
 * 이 스크립트는 회원가입과 로그인 기능을 자동으로 테스트합니다.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  isHongikEmail,
  validatePasswordStrength,
  validatePasswordMatch,
  validateName,
} from '../lib/utils/validation';

// .env 파일 로드
config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl);
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// authService와 유사한 함수들을 직접 구현
const authTest = {
  async signUp(data: {
    email: string;
    password: string;
    name: string;
    role: 'user' | 'club_admin' | 'admin';
  }) {
    // 1. 클라이언트 측 검증
    const nameValidation = validateName(data.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    if (!isHongikEmail(data.email)) {
      throw new Error(
        '홍익대학교 이메일(@g.hongik.ac.kr 또는 @hongik.ac.kr)만 사용 가능합니다.'
      );
    }

    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // 2. Supabase Auth를 통한 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('이미 가입된 이메일입니다.');
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('회원가입에 실패했습니다.');
    }

    // 3. users 테이블에 추가 정보 저장
    let profileError;
    let retries = 3;

    for (let i = 0; i < retries; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const { error } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
        },
      ]);

      profileError = error;

      if (!error) {
        break;
      }

      if (error.message.includes('duplicate key')) {
        profileError = null;
        break;
      }

      if (error.message.includes('foreign key constraint') && i < retries - 1) {
        console.log(`   프로필 삽입 재시도 ${i + 1}...`);
        continue;
      }

      if (!error.message.includes('foreign key constraint')) {
        break;
      }
    }

    if (profileError) {
      throw new Error(`프로필 생성 실패: ${profileError.message}`);
    }

    return authData;
  },

  async signIn(data: { email: string; password: string }) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

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

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },
};

const testEmail = 'test@g.hongik.ac.kr';
const testPassword = 'Test1234!';
const testName = '테스트유저';

async function testAuth() {
  console.log('=== 인증 기능 테스트 시작 ===\n');

  try {
    // 1. 회원가입 테스트
    console.log('1. 회원가입 테스트...');
    console.log(`   - 이메일: ${testEmail}`);
    console.log(`   - 이름: ${testName}`);
    console.log(`   - 비밀번호: ${testPassword}`);

    try {
      const signUpResult = await authTest.signUp({
        email: testEmail,
        password: testPassword,
        name: testName,
        role: 'user',
      });
      console.log('✅ 회원가입 성공!');
      console.log('   사용자 ID:', signUpResult.user?.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already registered')) {
        console.log('ℹ️  이미 가입된 사용자입니다. 로그인 테스트를 진행합니다.');
      } else {
        throw error;
      }
    }

    console.log('');

    // 2. 로그인 테스트
    console.log('2. 로그인 테스트...');
    const signInResult = await authTest.signIn({
      email: testEmail,
      password: testPassword,
    });
    console.log('✅ 로그인 성공!');
    console.log('   사용자 ID:', signInResult.user?.id);
    console.log('   액세스 토큰:', signInResult.session?.access_token ? '발급됨' : '없음');

    console.log('');

    // 3. 현재 사용자 정보 가져오기
    console.log('3. 현재 사용자 정보 조회...');
    const currentUser = await authTest.getCurrentUser();
    if (currentUser) {
      console.log('✅ 사용자 정보 조회 성공!');
      console.log('   ID:', currentUser.id);
      console.log('   이메일:', currentUser.email);
      console.log('   이름:', currentUser.name);
      console.log('   역할:', currentUser.role);
    } else {
      console.log('❌ 사용자 정보를 찾을 수 없습니다.');
    }

    console.log('');

    // 4. 로그아웃 테스트
    console.log('4. 로그아웃 테스트...');
    await authTest.signOut();
    console.log('✅ 로그아웃 성공!');

    console.log('');

    // 5. 로그아웃 후 사용자 정보 확인
    console.log('5. 로그아웃 후 사용자 정보 확인...');
    const userAfterSignOut = await authTest.getCurrentUser();
    if (!userAfterSignOut) {
      console.log('✅ 로그아웃 확인됨 (사용자 정보 없음)');
    } else {
      console.log('❌ 로그아웃 실패 (여전히 사용자 정보가 존재함)');
    }

    console.log('\n=== 모든 테스트 완료! ===');
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error);
    if (error instanceof Error) {
      console.error('   에러 메시지:', error.message);
      console.error('   스택:', error.stack);
    }
    process.exit(1);
  }
}

// 스크립트 실행
testAuth();
