# Supabase Setup Guide

이 가이드는 Hongik Community 프로젝트의 Supabase 설정 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성합니다
2. 새 프로젝트를 생성합니다
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전을 선택합니다
4. 프로젝트 생성이 완료될 때까지 기다립니다 (약 2분 소요)

## 2. 환경 변수 설정

1. 프로젝트 대시보드에서 **Settings** > **API**로 이동합니다
2. 다음 정보를 확인합니다:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 JWT 토큰)

3. `fe/.env` 파일을 생성하고 아래 내용을 입력합니다:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 3. 데이터베이스 스키마 실행

1. Supabase 대시보드에서 **SQL Editor**로 이동합니다
2. **New query** 버튼을 클릭합니다
3. `fe/supabase/schema.sql` 파일의 전체 내용을 복사하여 붙여넣습니다
4. **Run** 버튼을 클릭하여 스키마를 실행합니다

이 스크립트는 다음을 생성합니다:
- 데이터베이스 테이블 (users, clubs, categories, club_activities, club_members)
- Row Level Security (RLS) 정책 및 활성화
- 필수 함수와 트리거
- Storage 버킷 (`club-images`)
- Storage 접근 정책
- SECURITY INVOKER VIEW (clubs_with_categories, activities_with_clubs)

**중요**: 스키마 실행 후 반드시 `security-fix-complete.sql`도 실행하여 보안 설정을 최종 검증하세요.

## 4. Storage 버킷 확인

스키마 실행 후 Storage 버킷이 정상적으로 생성되었는지 확인합니다:

1. Supabase 대시보드에서 **Storage**로 이동합니다
2. `club-images` 버킷이 생성되어 있는지 확인합니다
3. 버킷 설정에서 **Public bucket**이 활성화되어 있는지 확인합니다

### Storage 구조

```
club-images/
├── logos/          # 동아리 로고 이미지
├── covers/         # 동아리 커버 이미지
└── activities/     # 동아리 활동 이미지
```

### 파일 업로드 정책

- **읽기**: 누구나 public 접근 가능
- **업로드**: 인증된 사용자만 가능
- **삭제**:
  - 사이트 관리자: 모든 이미지 삭제 가능
  - 동아리 관리자: 본인 동아리 이미지만 삭제 가능

## 5. Storage 버킷 수동 생성 (선택사항)

만약 schema.sql 실행 시 Storage 버킷이 자동으로 생성되지 않았다면, 수동으로 생성할 수 있습니다:

### 방법 1: Supabase Dashboard 사용

1. **Storage** > **New bucket** 클릭
2. 버킷 이름: `club-images`
3. **Public bucket** 체크박스 활성화
4. **Create bucket** 클릭

### 방법 2: SQL 직접 실행

SQL Editor에서 아래 쿼리를 실행합니다:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('club-images', 'club-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view club images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'club-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload club images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'club-images');

-- Allow admins to delete any image
CREATE POLICY "Admins can delete any club image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-images' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow club admins to delete their images
CREATE POLICY "Club admins can delete own club images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-images' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'club_admin'
    )
  );
```

## 6. 인증 설정 (선택사항)

기본적으로 Supabase Auth는 이메일/비밀번호 인증이 활성화되어 있습니다.

추가 설정이 필요한 경우:

1. **Authentication** > **Providers**로 이동
2. Email provider가 활성화되어 있는지 확인
3. 필요시 소셜 로그인 (Google, GitHub 등)을 추가 설정할 수 있습니다

### 이메일 도메인 제한

현재 프로젝트는 홍익대학교 이메일(`@g.hongik.ac.kr`, `@hongik.ac.kr`)만 허용하도록 설정되어 있습니다. 이는 데이터베이스 레벨에서 제약 조건으로 구현되어 있습니다.

## 7. 테스트

설정이 완료되면 다음을 테스트합니다:

### 회원가입 테스트
```bash
cd fe
npm install
npm run dev
```

1. 브라우저에서 `http://localhost:5173` 접속
2. 회원가입 페이지에서 홍익대 이메일로 가입
3. 로그인 테스트

### 이미지 업로드 테스트

1. 동아리 관리자 계정으로 로그인
2. 동아리 관리 페이지에서 활동 이미지 업로드
3. Supabase Storage에서 이미지가 정상적으로 업로드되었는지 확인

## 8. 문제 해결

### "bucket not found" 오류

**원인**: `club-images` Storage 버킷이 생성되지 않았습니다.

**해결 방법**:
1. Supabase Dashboard > Storage에서 `club-images` 버킷 확인
2. 없다면 위의 "5. Storage 버킷 수동 생성" 섹션 참조
3. 또는 `fe/supabase/storage-setup.sql` 파일을 SQL Editor에서 실행

### 이미지 업로드 시 권한 오류

**원인**: Storage 정책이 올바르게 설정되지 않았습니다.

**해결 방법**:
1. SQL Editor에서 `fe/supabase/storage-setup.sql` 재실행
2. 사용자가 올바른 role을 가지고 있는지 확인 (users 테이블의 role 컬럼)

### 🔴 RLS (Row Level Security) 비활성화 오류

**증상**: "Table has RLS policies but RLS is not enabled on the table"

**위험도**: HIGH - 모든 사용자가 모든 데이터에 접근할 수 있음

**진단 방법**:
```bash
# SQL Editor에서 실행
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**해결 방법**:

#### 옵션 1: 진단 후 수정 (권장)
1. SQL Editor에서 `fe/supabase/rls-diagnosis.sql` 실행하여 현재 상태 확인
2. 문제 확인 후 `fe/supabase/rls-fix.sql` 실행하여 일괄 수정

#### 옵션 2: 빠른 수정
SQL Editor에서 다음을 실행:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
```

#### 검증
```sql
-- 모든 테이블의 RLS 상태 확인
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED (위험!)'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 회원가입 시 "홍익대 이메일만 가능" 오류

이는 정상적인 동작입니다. `@g.hongik.ac.kr` 또는 `@hongik.ac.kr` 도메인만 허용됩니다.

### RLS 정책 오류

**원인**: Row Level Security 정책이 올바르게 설정되지 않았습니다.

**해결 방법**:
1. `fe/supabase/rls-fix.sql` 실행 (모든 정책을 재생성)
2. Supabase Dashboard > Authentication > Policies에서 정책 확인
3. 필요시 `schema.sql` 전체를 다시 실행

## 9. 보안 권장사항

1. **환경 변수 보호**: `.env` 파일을 절대 Git에 커밋하지 마세요
2. **anon key만 사용**: 클라이언트에서는 절대 service_role key를 사용하지 마세요
3. **RLS 활성화**: 모든 테이블에 RLS가 활성화되어 있는지 확인하세요
4. **정기 백업**: Supabase Dashboard에서 자동 백업 설정을 확인하세요

## 10. 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Storage 가이드](https://supabase.com/docs/guides/storage)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)