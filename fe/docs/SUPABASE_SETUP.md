# Supabase 설정 가이드

이 문서는 Hongik Community 프로젝트에서 Supabase를 설정하는 방법을 안내합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 만들거나 로그인합니다
2. "New Project" 버튼을 클릭하여 새 프로젝트를 생성합니다
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전을 설정합니다

## 2. 데이터베이스 스키마 설정

1. Supabase 대시보드에서 **SQL Editor**로 이동합니다
2. `fe/supabase/schema.sql` 파일의 내용을 복사하여 실행합니다
3. 이렇게 하면 다음이 생성됩니다:
   - `users` 테이블 (사용자 프로필 정보)
   - Row Level Security (RLS) 정책
   - 필요한 인덱스와 트리거

## 3. 환경 변수 설정

1. Supabase 대시보드의 **Settings > API**로 이동합니다
2. 다음 정보를 확인합니다:
   - Project URL
   - anon/public key

3. 프로젝트 루트에 `.env` 파일을 생성합니다:

```bash
cp fe/.env.example fe/.env
```

4. `.env` 파일을 열고 값을 입력합니다:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 이메일 인증 설정 (선택사항)

기본적으로 Supabase는 회원가입 시 이메일 인증을 요구합니다.

### 개발 환경에서 이메일 인증 비활성화

1. Supabase 대시보드의 **Authentication > Settings**로 이동
2. **Email Auth** 섹션에서 "Enable email confirmations" 옵션을 해제합니다

### 프로덕션 환경

프로덕션에서는 이메일 인증을 활성화하고 커스텀 이메일 템플릿을 설정하는 것을 권장합니다.

## 5. users 테이블 스키마

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,              -- Supabase Auth의 user id와 연동
  email TEXT UNIQUE NOT NULL,       -- 사용자 이메일
  name TEXT NOT NULL,               -- 사용자 이름
  role TEXT NOT NULL,               -- 역할: 'user', 'club_admin', 'admin'
  created_at TIMESTAMP,             -- 생성 시각
  updated_at TIMESTAMP              -- 수정 시각
);
```

## 6. 역할(Role) 설명

- **user**: 일반 사용자 (동아리 정보 조회만 가능)
- **club_admin**: 동아리 관리자 (자신의 동아리 정보 관리)
- **admin**: 총 관리자 (전체 시스템 관리)

## 7. Row Level Security (RLS) 정책

다음과 같은 RLS 정책이 설정되어 있습니다:

1. 사용자는 자신의 프로필을 조회, 생성, 수정할 수 있습니다
2. 관리자(admin)는 모든 사용자를 조회할 수 있습니다
3. 삭제는 Supabase Auth의 cascade 정책을 따릅니다

## 8. 테스트

설정이 완료되면 다음을 테스트해보세요:

1. 개발 서버 실행:
```bash
cd fe
npm run dev
```

2. `/register` 페이지에서 회원가입
3. `/login` 페이지에서 로그인
4. Supabase 대시보드의 **Authentication > Users**에서 사용자 확인

## 9. 문제 해결

### "Missing Supabase environment variables" 에러

- `.env` 파일이 `fe/` 디렉토리에 있는지 확인
- 환경 변수 이름이 `VITE_`로 시작하는지 확인
- 개발 서버를 재시작

### 회원가입 후 users 테이블에 데이터가 없음

- `schema.sql`이 정상적으로 실행되었는지 확인
- Supabase 대시보드에서 Table Editor로 `users` 테이블 확인
- 브라우저 콘솔에서 에러 메시지 확인

### RLS 정책 에러

- Supabase 대시보드의 SQL Editor에서 RLS 정책이 제대로 생성되었는지 확인
- 필요시 `schema.sql`을 다시 실행

## 10. 추가 기능

현재 구현된 기능:

- ✅ 회원가입 (signUp)
- ✅ 로그인 (signIn)
- ✅ 로그아웃 (signOut)
- ✅ 현재 사용자 정보 조회 (getCurrentUser)
- ✅ 세션 관리
- ✅ 비밀번호 재설정

추가로 구현 가능한 기능:

- 프로필 수정
- OAuth 로그인 (Google, GitHub 등)
- 이메일 변경
- 2단계 인증

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
