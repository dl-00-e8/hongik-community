# 동아리 관리자 접근 문제 해결 가이드

## 문제 상황

동아리 관리자(`club_admin`) 권한을 가진 사용자가 `/club/manage` 페이지에 접근했을 때 "관리 권한 없음" 메시지가 표시되는 경우.

## 원인 분석

이 프로젝트는 두 가지 동아리 관리자 구조를 지원합니다:

### 1. Legacy 구조 (단일 동아리 관리)
- `users` 테이블의 `club_id` 컬럼 사용
- 한 명의 사용자는 하나의 동아리만 관리 가능
- 초기 구현에서 사용

### 2. 새로운 구조 (다중 동아리 관리)
- `club_admins` 테이블 사용 (junction/pivot table)
- 한 명의 사용자가 여러 동아리 관리 가능
- 마이그레이션 파일: `fe/supabase/migrations/add_club_admins.sql`

## 해결 방법

### 1단계: 데이터베이스 상태 확인

브라우저 콘솔에서 다음 명령을 실행하세요:

```javascript
window.checkMigrationStatus()
```

이 명령은 다음을 확인합니다:
- `club_admins` 테이블 존재 여부
- `club_admins` 테이블의 데이터 수
- `club_admin` 역할을 가진 사용자 목록
- 각 사용자의 `club_id` 설정 여부

### 2단계: 상황별 해결책

#### 상황 A: `club_admins` 테이블이 없음

**증상:**
```
❌ club_admins table does NOT exist
```

**해결:**
1. Supabase 대시보드에 로그인
2. SQL Editor로 이동
3. `fe/supabase/migrations/add_club_admins.sql` 파일의 내용을 복사
4. SQL Editor에 붙여넣고 실행

마이그레이션은 자동으로 다음을 수행합니다:
- `club_admins` 테이블 생성
- 기존 `users.club_id` 데이터를 `club_admins`로 이전
- Row Level Security (RLS) 정책 적용

#### 상황 B: `club_admins` 테이블은 있지만 데이터가 없음

**증상:**
```
✅ club_admins table exists
📊 club_admins entries: 0
⚠️ No entries in club_admins table
```

**해결:**

**옵션 1: 수동으로 데이터 추가**

Supabase SQL Editor에서 실행:

```sql
-- 기존 users.club_id 데이터를 club_admins로 이전
INSERT INTO club_admins (user_id, club_id)
SELECT id, club_id
FROM users
WHERE club_id IS NOT NULL
  AND role IN ('club_admin', 'admin')
ON CONFLICT (user_id, club_id) DO NOTHING;
```

**옵션 2: Supabase 대시보드에서 수동 입력**

1. Supabase 대시보드의 Table Editor로 이동
2. `club_admins` 테이블 선택
3. "Insert row" 클릭
4. 다음 정보 입력:
   - `user_id`: 관리자의 사용자 ID
   - `club_id`: 동아리 ID

#### 상황 C: 사용자의 `club_id`가 설정되지 않음

**증상:**
```
⚠️ X club admin(s) have NO club_id (need club_admins table)
```

**해결:**

이 경우 반드시 `club_admins` 테이블에 데이터를 추가해야 합니다.

Supabase SQL Editor에서 실행:

```sql
-- 특정 사용자에게 동아리 관리 권한 부여
INSERT INTO club_admins (user_id, club_id)
VALUES ('사용자-UUID', '동아리-UUID')
ON CONFLICT (user_id, club_id) DO NOTHING;
```

UUID 확인 방법:
```sql
-- 사용자 UUID 찾기
SELECT id, email, name FROM users WHERE email = '사용자이메일@g.hongik.ac.kr';

-- 동아리 UUID 찾기
SELECT id, name FROM clubs WHERE name = '동아리명';
```

### 3단계: Fallback 메커니즘

코드가 자동으로 다음 순서로 fallback을 시도합니다:

1. **첫 번째 시도:** `club_admins` 테이블에서 관리 동아리 조회
2. **두 번째 시도 (Fallback):** `users.club_id` 확인 (legacy 구조)
3. **세 번째 시도:** 사용자가 `admin` 역할인 경우 모든 동아리 접근 허용

따라서 마이그레이션이 완료되지 않았어도, `users.club_id`가 설정되어 있다면 동아리 관리 페이지에 접근할 수 있습니다.

### 4단계: 권한 확인

사용자 권한을 확인하려면:

```javascript
// 브라우저 콘솔에서 실행
window.authDebug()
```

출력 예시:
```
🔍 AuthContext State: {
  user: {
    id: "...",
    email: "user@g.hongik.ac.kr",
    name: "홍길동",
    role: "club_admin",
    club_id: "..."
  },
  hasUser: true,
  hasSupabaseUser: true,
  loading: false
}
```

## 자주 묻는 질문 (FAQ)

### Q1: 마이그레이션을 실행했는데도 접근이 안 됩니다

**A:** 다음을 확인하세요:

1. 브라우저 새로고침 (Ctrl+Shift+R / Cmd+Shift+R)
2. 로그아웃 후 다시 로그인
3. `window.checkMigrationStatus()`로 데이터 확인
4. 브라우저 캐시 삭제

### Q2: 사용자에게 `club_id`가 없는데 어떻게 설정하나요?

**A:** 두 가지 방법이 있습니다:

**방법 1: `club_admins` 테이블 사용 (권장)**
```sql
INSERT INTO club_admins (user_id, club_id)
VALUES ('사용자-UUID', '동아리-UUID');
```

**방법 2: `users.club_id` 직접 설정 (Legacy)**
```sql
UPDATE users
SET club_id = '동아리-UUID'
WHERE id = '사용자-UUID';
```

### Q3: 한 사용자가 여러 동아리를 관리하려면?

**A:** 반드시 `club_admins` 테이블을 사용해야 합니다:

```sql
-- 사용자에게 여러 동아리 관리 권한 부여
INSERT INTO club_admins (user_id, club_id) VALUES
  ('사용자-UUID', '동아리1-UUID'),
  ('사용자-UUID', '동아리2-UUID'),
  ('사용자-UUID', '동아리3-UUID');
```

### Q4: 사이트 관리자가 모든 동아리를 관리하지 못합니다

**A:** 사용자의 `role`이 `admin`으로 설정되어 있는지 확인하세요:

```sql
-- 사용자를 사이트 관리자로 설정
UPDATE users
SET role = 'admin'
WHERE id = '사용자-UUID';
```

사이트 관리자(`role = 'admin'`)는 별도로 `club_admins` 테이블에 추가하지 않아도 모든 동아리에 접근할 수 있습니다.

## 코드 변경 사항

### 수정된 파일

1. **`fe/src/hooks/useClubAdmins.ts`**
   - `useManagedClubs`: Fallback 로직 추가
   - `useCanManageClub`: Legacy 구조 지원 추가

### Fallback 로직 흐름

```
useManagedClubs(userId)
  ├─ 1. club_admins 테이블에서 조회 시도
  │   └─ 성공 → 동아리 목록 반환
  │
  ├─ 2. users.club_id 확인 (Fallback)
  │   ├─ role == 'club_admin' && club_id 존재
  │   │   └─ 해당 동아리 반환 [단일 동아리]
  │   │
  │   └─ role == 'admin'
  │       └─ 모든 동아리 반환
  │
  └─ 3. 빈 배열 반환 (관리 권한 없음)
```

## 개발 환경에서 디버깅

개발 모드(`npm run dev`)에서는 다음 명령어들을 사용할 수 있습니다:

```javascript
// 인증 상태 확인
window.authDebug()

// 마이그레이션 상태 확인
window.checkMigrationStatus()

// Supabase 초기화 강제 실행
await window.ensureSupabaseInitialized()

// 로컬 스토리지 확인
localStorage.getItem('supabase.auth.token')
```

## 프로덕션 배포 체크리스트

배포 전에 다음을 확인하세요:

- [ ] `club_admins` 테이블이 생성되었는가?
- [ ] 기존 `users.club_id` 데이터가 `club_admins`로 이전되었는가?
- [ ] RLS 정책이 올바르게 적용되었는가?
- [ ] 모든 동아리 관리자가 로그인하여 접근을 테스트했는가?
- [ ] 사이트 관리자가 모든 동아리에 접근할 수 있는가?

## 추가 도움말

문제가 계속되면:

1. Supabase 대시보드의 "Logs" 섹션에서 에러 로그 확인
2. 브라우저 개발자 도구의 Network 탭에서 API 요청 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. Row Level Security 정책이 올바르게 설정되었는지 확인:
   ```sql
   -- RLS 정책 확인
   SELECT * FROM pg_policies WHERE tablename = 'club_admins';
   SELECT * FROM pg_policies WHERE tablename = 'clubs';
   ```