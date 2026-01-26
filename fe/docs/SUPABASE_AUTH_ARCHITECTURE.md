# 🔐 Supabase 인증 아키텍처 이해하기

## 질문: 비밀번호는 어디에 저장되나요?

`public.users` 테이블에 `password` 컬럼이 없는데, Supabase는 어떻게 비밀번호를 관리할까요?

## 답변: auth.users 스키마

### 1. 두 개의 분리된 테이블

Supabase는 인증 정보와 프로필 정보를 **분리**하여 저장합니다:

```sql
-- ============================================
-- Supabase가 자동으로 관리하는 테이블
-- ============================================
auth.users
├── id (UUID, Primary Key)
├── email (TEXT)
├── encrypted_password (TEXT) ← 비밀번호가 여기 저장됩니다!
├── email_confirmed_at (TIMESTAMP)
├── confirmation_token (TEXT)
├── recovery_token (TEXT)
├── email_change_token (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── last_sign_in_at (TIMESTAMP)
├── raw_app_meta_data (JSONB)
├── raw_user_meta_data (JSONB)
└── ... (기타 인증 관련 필드)

-- ============================================
-- 우리가 직접 관리하는 테이블
-- ============================================
public.users
├── id (UUID, FK → auth.users.id)
├── email (TEXT)
├── name (TEXT)
├── role (TEXT)
├── club_id (UUID)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 2. 비밀번호가 auth.users에 저장되는 이유

#### 보안상의 이유
1. **접근 제어**: `auth` 스키마는 Supabase가 완전히 제어하며, 직접 접근 불가
2. **암호화**: 비밀번호는 bcrypt로 자동 해싱되어 저장
3. **관심사 분리**: 인증(Authentication)과 프로필(Profile)을 분리
4. **권한 관리**: RLS 정책으로도 `auth.users`에 직접 접근 불가

#### 개발자가 할 수 없는 것
```sql
-- ❌ 불가능: auth.users에 직접 접근
SELECT * FROM auth.users;  -- 에러!

-- ❌ 불가능: 비밀번호 직접 조회
SELECT encrypted_password FROM auth.users;  -- 에러!
```

#### 개발자가 할 수 있는 것
```typescript
// ✅ 가능: Supabase Auth API 사용
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.updateUser({ password: newPassword });
```

### 3. 회원가입 시 일어나는 일

```typescript
// auth.service.ts
const { data, error } = await supabase.auth.signUp({
  email: 'student@g.hongik.ac.kr',
  password: 'SecurePass123',
  options: {
    data: {
      name: '홍길동',
      role: 'user',
    },
  },
});
```

**내부 프로세스:**

```
1. Supabase Auth가 비밀번호를 bcrypt로 해싱
   password: "SecurePass123"
   ↓
   encrypted_password: "$2a$10$rqZ..." (해시값)

2. auth.users 테이블에 저장
   INSERT INTO auth.users (
     id,
     email,
     encrypted_password,
     raw_user_meta_data
   ) VALUES (
     'uuid-here',
     'student@g.hongik.ac.kr',
     '$2a$10$rqZ...',  ← 해시된 비밀번호
     '{"name": "홍길동", "role": "user"}'
   );

3. 우리 코드가 public.users에 추가 정보 저장
   INSERT INTO public.users (
     id,
     email,
     name,
     role
   ) VALUES (
     'uuid-here',  ← auth.users의 id와 동일
     'student@g.hongik.ac.kr',
     '홍길동',
     'user'
   );
```

### 4. 로그인 시 일어나는 일

```typescript
await supabase.auth.signInWithPassword({
  email: 'student@g.hongik.ac.kr',
  password: 'SecurePass123',
});
```

**내부 프로세스:**

```
1. Supabase가 email로 auth.users 조회
   SELECT * FROM auth.users WHERE email = 'student@g.hongik.ac.kr';

2. 입력된 비밀번호를 해시하여 비교
   bcrypt.compare('SecurePass123', encrypted_password)
   ↓
   일치하면 JWT 토큰 발급

3. JWT 토큰 반환
   {
     access_token: "eyJhbGc...",
     refresh_token: "refresh...",
     user: {
       id: "uuid-here",
       email: "student@g.hongik.ac.kr",
       user_metadata: { name: "홍길동", role: "user" }
     }
   }
```

### 5. 현재 사용자 정보 조회

```typescript
// 1. Supabase Auth에서 기본 정보
const { data: { user } } = await supabase.auth.getUser();
// user.id, user.email, user.user_metadata

// 2. public.users에서 추가 정보
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();
// profile.name, profile.role, profile.club_id
```

### 6. 비밀번호 변경

```typescript
// Supabase Auth API 사용
await supabase.auth.updateUser({
  password: 'NewSecurePass456',
});

// 내부적으로 auth.users 테이블 업데이트
// UPDATE auth.users
// SET encrypted_password = '$2a$10$new_hash...'
// WHERE id = current_user_id;
```

## 왜 이런 구조를 사용하나요?

### 장점

1. **보안**: 비밀번호가 애플리케이션 코드에서 완전히 격리됨
2. **관심사 분리**:
   - `auth.users`: 인증 (Supabase 관리)
   - `public.users`: 프로필 (개발자 관리)
3. **확장성**: 추가 프로필 정보를 자유롭게 관리
4. **모범 사례**: OAuth, 이메일 인증 등 Supabase가 제공하는 기능 활용

### 비교: 직접 비밀번호 관리 vs Supabase Auth

#### ❌ 직접 관리 (권장하지 않음)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT,
  password TEXT,  -- 🚨 보안 위험!
  name TEXT
);
```

**문제점:**
- 해싱 알고리즘 직접 구현 필요
- Salt 관리 필요
- 토큰 생성/검증 로직 구현 필요
- 보안 업데이트 직접 관리
- SQL Injection 위험

#### ✅ Supabase Auth (권장)
```sql
-- auth.users: Supabase 관리 (자동 보안)
-- public.users: 프로필만 관리
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id),
  name TEXT,
  role TEXT
);
```

**장점:**
- 자동 bcrypt 해싱
- JWT 토큰 자동 생성
- 이메일 인증 내장
- OAuth 통합
- 보안 업데이트 자동

## 데이터베이스 구조 시각화

```
┌─────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                        │
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   auth schema        │      │   public schema      │    │
│  │  (Supabase 관리)     │      │   (개발자 관리)      │    │
│  │                      │      │                      │    │
│  │  ┌────────────────┐  │      │  ┌────────────────┐  │    │
│  │  │  auth.users    │  │      │  │ public.users   │  │    │
│  │  ├────────────────┤  │  FK  │  ├────────────────┤  │    │
│  │  │ id (PK)        │──┼──────┼─→│ id (FK)        │  │    │
│  │  │ email          │  │      │  │ email          │  │    │
│  │  │ encrypted_pass │  │      │  │ name           │  │    │
│  │  │ confirmed_at   │  │      │  │ role           │  │    │
│  │  │ tokens...      │  │      │  │ club_id        │  │    │
│  │  └────────────────┘  │      │  └────────────────┘  │    │
│  │                      │      │                      │    │
│  │  직접 접근 불가 ❌   │      │  직접 접근 가능 ✅   │    │
│  └──────────────────────┘      └──────────────────────┘    │
│                                                              │
│  접근 방법:                                                  │
│  - auth.users: supabase.auth.* API만 사용                   │
│  - public.users: supabase.from('users').* 사용             │
└─────────────────────────────────────────────────────────────┘
```

## 실제 코드 예시

### 회원가입 (우리 코드)

```typescript
// src/services/auth.service.ts
async signUp({ email, password, name, role }: SignUpData) {
  // 1. Supabase Auth에 사용자 생성 (비밀번호는 여기서 처리)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,  // ← Supabase가 자동으로 해싱하여 auth.users에 저장
    options: {
      data: { name, role },  // user_metadata에 저장
    },
  });

  if (authError) throw authError;

  // 2. public.users에 추가 정보 저장 (비밀번호 없음!)
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,  // auth.users의 id 참조
    email,
    name,
    role,
    // password 필드 없음! ✅
  });

  if (profileError) throw profileError;
}
```

### 사용자 정보 조회

```typescript
// src/services/auth.service.ts
async getCurrentUser(): Promise<User | null> {
  // 1. auth.users에서 기본 정보 (비밀번호 제외)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 2. public.users에서 프로필 정보
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return userData;  // { id, email, name, role, club_id }
}
```

## 보안 고려사항

### ✅ 안전한 작업

```typescript
// 비밀번호 변경 (Supabase Auth API 사용)
await supabase.auth.updateUser({ password: newPassword });

// 사용자 정보 조회
const { data } = await supabase.from('users').select('*');

// 프로필 업데이트
await supabase.from('users').update({ name: 'New Name' });
```

### ❌ 불가능한 작업

```typescript
// auth.users 직접 조회 시도
const { data } = await supabase.from('auth.users').select('*');
// → 에러: permission denied for schema auth

// 비밀번호 직접 조회 시도
const { data } = await supabase.rpc('get_password');
// → 불가능: Supabase가 허용하지 않음
```

## FAQ

### Q1: public.users에 email을 중복 저장하는 이유는?
**A:** 편의성과 성능을 위해서입니다. `auth.users`에 직접 JOIN할 수 없으므로, 자주 사용하는 이메일을 `public.users`에도 저장합니다.

### Q2: 비밀번호를 바꾸면 어떻게 되나요?
**A:** `supabase.auth.updateUser()`를 사용하면 `auth.users`의 `encrypted_password`만 업데이트됩니다. `public.users`는 영향받지 않습니다.

### Q3: auth.users를 직접 볼 수 있나요?
**A:** Supabase 대시보드의 Authentication > Users에서 GUI로 볼 수 있지만, SQL이나 API로는 직접 접근할 수 없습니다.

### Q4: 소셜 로그인(OAuth)은 어떻게 되나요?
**A:** 동일하게 작동합니다. `auth.users`에 사용자가 생성되고, 우리는 `public.users`에 추가 정보만 저장하면 됩니다.

```typescript
// OAuth 로그인
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'google',
});

// OAuth 사용자도 auth.users에 저장됨
// encrypted_password는 NULL (OAuth 사용자는 비밀번호 없음)
```

## 결론

**비밀번호는 `auth.users` 스키마에 안전하게 저장됩니다!**

- ✅ Supabase가 완전히 관리 (개발자는 접근 불가)
- ✅ bcrypt로 자동 해싱
- ✅ JWT 토큰으로 인증
- ✅ `public.users`는 프로필 정보만 저장

이 구조 덕분에 우리는 **보안 걱정 없이** 비즈니스 로직에만 집중할 수 있습니다!

---

**참고 자료:**
- [Supabase Auth 공식 문서](https://supabase.com/docs/guides/auth)
- [PostgreSQL Schema 개념](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [bcrypt 해싱 알고리즘](https://en.wikipedia.org/wiki/Bcrypt)
