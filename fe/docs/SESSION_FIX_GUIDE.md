# 로그인 세션 유지 문제 해결 가이드

RLS 활성화 후 로그인 세션이 유지되지 않는 문제를 해결하는 가이드입니다.

## 🔍 문제 진단

### 증상
- 로그인 후 계속 로그인 페이지로 리다이렉트됨
- 사용자 정보가 로드되지 않음
- "로그인이 필요합니다" 메시지 반복

### 원인
1. **브라우저 캐시**: RLS 활성화 전 생성된 세션 토큰 사용
2. **RLS 정책 타이밍**: `auth.uid()`가 인식되기 전에 쿼리 실행
3. **정책 문제**: SELECT 정책이 제대로 적용되지 않음

---

## ✅ 해결 방법 (단계별)

### 1단계: 브라우저 디버깅 콘솔 확인

**브라우저 개발자 도구 열기**:
- Chrome/Edge: `F12` 또는 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`)
- Firefox: `F12` 또는 `Ctrl+Shift+K`

**Console 탭에서 확인**:
```javascript
// AuthContext 상태 확인
window.authDebug()
```

**예상 출력**:
```
🔍 AuthContext State: {
  user: null,              // ❌ null이면 문제
  supabaseUser: {...},     // ✅ 있어야 함
  loading: false,
  hasUser: false,          // ❌ false면 문제
  hasSupabaseUser: true
}
```

**문제 패턴**:
- `supabaseUser`는 있지만 `user`가 `null` → RLS 정책 문제
- 둘 다 `null` → 세션 자체가 없음

### 2단계: 세션 토큰 확인

**개발자 도구 > Application 탭**:
1. **Local Storage** 클릭
2. 사이트 URL 선택 (예: `http://localhost:5173`)
3. 키 목록에서 `supabase.auth.token` 찾기

**확인 사항**:
- 토큰이 있는가?
- 만료되지 않았는가?

### 3단계: Local Storage 완전 비우기 (권장)

**방법 1: 개발자 도구 사용**
1. 개발자 도구 > **Application** > **Local Storage**
2. 사이트 URL 우클릭 > **Clear**
3. **Session Storage**도 동일하게 Clear
4. **Cookies**도 확인하여 삭제

**방법 2: Console에서 실행**
```javascript
// 모든 로컬 스토리지 비우기
localStorage.clear()
sessionStorage.clear()

// 페이지 새로고침
location.reload()
```

### 4단계: 하드 리프레시

캐시를 완전히 비우고 새로고침:
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`
- 또는: `Ctrl + F5` (Windows)

### 5단계: SQL 정책 재확인

Supabase SQL Editor에서 실행:

```sql
-- session-debug.sql 실행
-- Users 테이블 정책 확인
```

만약 정책에 문제가 있다면:
```sql
-- session-fix.sql 실행
-- 정책 재생성
```

### 6단계: 재로그인

1. 애플리케이션 접속
2. 로그인 시도
3. 브라우저 콘솔에서 오류 확인

---

## 🐛 디버깅 체크리스트

로그인 시도 후 브라우저 콘솔 확인:

### ✅ 정상 케이스
```javascript
// 콘솔에 오류 없음
// window.authDebug() 결과:
{
  user: { id: "...", email: "...", name: "...", role: "..." },
  supabaseUser: { ... },
  loading: false,
  hasUser: true,
  hasSupabaseUser: true
}
```

### ❌ 문제 케이스 1: RLS 정책 오류
```javascript
// 콘솔 오류:
"Failed to load user profile: Error: Database error: row-level security policy for table..."

// window.authDebug() 결과:
{
  user: null,              // ❌
  supabaseUser: { ... },   // ✅
  loading: false,
  hasUser: false,          // ❌
  hasSupabaseUser: true
}
```

**해결**: `session-fix.sql` 실행

### ❌ 문제 케이스 2: 세션 자체가 없음
```javascript
// window.authDebug() 결과:
{
  user: null,
  supabaseUser: null,      // ❌
  loading: false,
  hasUser: false,
  hasSupabaseUser: false   // ❌
}
```

**해결**:
1. Local Storage 비우기
2. 새로고침 후 재로그인

### ❌ 문제 케이스 3: 무한 로딩
```javascript
// window.authDebug() 결과:
{
  user: null,
  supabaseUser: null,
  loading: true,           // ❌ 계속 true
  hasUser: false,
  hasSupabaseUser: false
}
```

**해결**:
1. Supabase 연결 확인 (`.env` 파일)
2. 네트워크 탭에서 요청 실패 확인

---

## 🔧 고급 문제 해결

### 문제: "PGRST116" 오류

**오류 메시지**:
```
Database error: PGRST116
```

**의미**: RLS 정책에서 레코드를 찾을 수 없음

**해결**:
```sql
-- Supabase SQL Editor에서 확인
SELECT
  auth.uid() as current_user,
  *
FROM public.users
WHERE id = auth.uid();

-- 결과가 없다면: users 테이블에 레코드가 없음
-- 해결: 다시 회원가입하거나 관리자가 수동으로 레코드 생성
```

### 문제: auth.uid()가 NULL

**확인 방법**:
```sql
-- Supabase SQL Editor (로그인 상태에서)
SELECT auth.uid(), auth.role();

-- 결과가 NULL이면: SQL Editor가 인증되지 않은 상태
-- 해결: Supabase Dashboard에서 로그아웃 후 재로그인
```

### 문제: 특정 브라우저에서만 발생

**원인**: 브라우저별 쿠키/스토리지 정책 차이

**해결**:
1. **시크릿 모드**로 테스트
2. **다른 브라우저**로 테스트
3. 브라우저 **쿠키 설정** 확인 (Third-party cookies 허용)

---

## 📋 최종 해결 플로우

```
1. 브라우저 콘솔 오류 확인
   ↓
2. window.authDebug() 실행
   ↓
3-A. supabaseUser 있고 user 없음
   → session-fix.sql 실행
   → Local Storage 비우기
   → 재로그인

3-B. 둘 다 없음
   → Local Storage 비우기
   → 하드 리프레시
   → 재로그인

3-C. 무한 로딩
   → .env 파일 확인
   → Supabase 연결 확인
   → 네트워크 탭 확인
```

---

## 🆘 그래도 안 되는 경우

### 최후의 수단: 완전 초기화

**1. 브라우저 완전 초기화**
```javascript
// 개발자 도구 Console에서
localStorage.clear()
sessionStorage.clear()
indexedDB.deleteDatabase('supabase-db')

// 브라우저 완전 종료 후 재시작
```

**2. 데이터베이스 정책 완전 재설정**
```sql
-- 모든 users 정책 삭제
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- schema.sql의 Users 정책 부분만 다시 실행
-- 또는 security-fix-complete.sql 재실행
```

**3. 새 계정으로 테스트**
- 완전히 새로운 이메일로 회원가입
- 이전 계정 데이터 문제인지 확인

---

## ✅ 해결 확인

모든 단계를 완료한 후:

- [ ] 로그인 성공
- [ ] 홈페이지로 정상 리다이렉트
- [ ] `window.authDebug()`에서 user 정보 확인
- [ ] 다른 페이지 이동 시 세션 유지
- [ ] 페이지 새로고침 후에도 로그인 유지
- [ ] 브라우저 완전 종료 후 재접속해도 세션 유지

모두 체크되면 문제 해결 완료! 🎉