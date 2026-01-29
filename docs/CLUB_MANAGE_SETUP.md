# 동아리 관리 페이지 설정 가이드

> **참고**: 여러 동아리 관리 기능에 대한 자세한 내용은 `MULTI_CLUB_ADMIN_SETUP.md`를 참조하세요.

## 1. Supabase Storage 설정

### Step 1: Bucket 생성
1. Supabase Dashboard에 접속
2. Storage 섹션으로 이동
3. "New bucket" 클릭
4. Bucket 이름: `club-images`
5. Public bucket: ✅ 체크
6. "Create bucket" 클릭

### Step 2: Storage RLS 정책 설정
Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- 누구나 조회 가능
CREATE POLICY "Anyone can view club images"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-images');

-- 인증된 사용자만 업로드
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'club-images' AND
  auth.role() = 'authenticated'
);

-- 업로더만 삭제 가능
CREATE POLICY "Owners can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'club-images' AND
  auth.uid() = owner
);
```

## 2. 테스트용 club_admin 계정 생성

> **중요**: 이제 `club_admins` 중간 테이블을 사용합니다. 여러 동아리 관리가 가능합니다.

### Step 1: 기존 동아리 ID 확인
```sql
SELECT id, name FROM clubs LIMIT 5;
```

### Step 2: 테스트 계정에 club_admin 권한 부여
```sql
-- 1. 사용자 role을 club_admin으로 변경
UPDATE users
SET role = 'club_admin'
WHERE email = 'test@g.hongik.ac.kr';

-- 2. club_admins 테이블에 관계 추가
INSERT INTO club_admins (user_id, club_id)
VALUES (
  (SELECT id FROM users WHERE email = 'test@g.hongik.ac.kr'),
  '여기에-동아리-ID-입력'
);
```

여러 동아리에 추가하려면:
```sql
INSERT INTO club_admins (user_id, club_id)
VALUES
  ((SELECT id FROM users WHERE email = 'test@g.hongik.ac.kr'), '동아리-ID-1'),
  ((SELECT id FROM users WHERE email = 'test@g.hongik.ac.kr'), '동아리-ID-2')
ON CONFLICT (user_id, club_id) DO NOTHING;
```

## 3. 기능 테스트

### 로그인 및 동아리 선택
1. club_admin 계정으로 로그인
2. Header에서 "동아리 관리" 메뉴 확인
3. `/club/manage` 경로로 이동 → 동아리 선택 페이지
4. 관리하는 동아리 목록 확인
5. 동아리 카드 클릭 → `/club/manage/:clubId`로 이동

### Tab 1: 기본 정보
- [x] 로고 이미지 업로드
- [x] 커버 이미지 업로드
- [x] 동아리 정보 수정 (이름, 카테고리, 소개 등)
- [x] 저장 버튼 클릭 → Toast 알림 확인
- [x] Supabase Storage에서 이미지 확인
- [x] DB에서 정보 업데이트 확인

### Tab 2: 모집 관리
- [x] "모집 중" 토글 ON
- [x] 모집 시작일/종료일 입력
- [x] 저장 → DB 확인
- [x] "모집 중" 토글 OFF → 저장
- [x] 날짜 필드 검증 (모집 중일 때 필수)

### Tab 3: 활동 관리
- [x] 활동 이미지 업로드
- [x] 캡션 입력
- [x] "활동 추가" 버튼 클릭
- [x] 그리드에 새 활동 표시 확인
- [x] 삭제 버튼 클릭 → 확인 다이얼로그
- [x] 삭제 확인 → Storage 및 DB에서 삭제 확인

## 4. 권한 테스트

### 일반 사용자
```
1. user 역할로 로그인
2. /club/manage 접근 시도
3. ProtectedRoute에 의해 리다이렉트 확인
```

### 다른 동아리 club_admin
```
1. 다른 동아리의 club_admin으로 로그인
2. /club/manage 접근
3. 자신의 동아리 정보만 보임 확인
4. 다른 동아리 데이터 접근 시도 → RLS 에러
```

## 5. Storage 확인

### Supabase Dashboard
1. Storage → club-images 버킷
2. 폴더 구조 확인:
   - `logos/` - 동아리 로고
   - `covers/` - 커버 이미지
   - `activities/` - 활동 이미지
3. 각 이미지 클릭 → Public URL 복사 → 브라우저에서 접근 확인

## 6. 문제 해결

### 업로드 실패
- 파일 크기 확인 (5MB 이하)
- 파일 형식 확인 (JPG, PNG, WEBP)
- Supabase 프로젝트 용량 확인

### RLS 에러
- Storage 정책이 올바르게 설정되었는지 확인
- `auth.role() = 'authenticated'` 조건 확인

### 이미지가 표시되지 않음
- Public URL이 올바른지 확인
- Bucket이 Public으로 설정되었는지 확인
- CORS 설정 확인 (Supabase는 기본적으로 허용)

## 7. 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [React Hook Form 문서](https://react-hook-form.com/)
- [Zod 스키마 검증](https://zod.dev/)