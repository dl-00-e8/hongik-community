# 여러 동아리 관리 기능 설정 가이드

## 개요

이 기능은 한 명의 사용자(club_admin)가 여러 동아리를 관리할 수 있도록 합니다. `club_admins` 중간 테이블을 사용하여 사용자와 동아리 간의 다대다 관계를 구현합니다.

## 1. 데이터베이스 마이그레이션

### Step 1: SQL 마이그레이션 실행

Supabase SQL Editor에서 다음 마이그레이션 파일을 실행하세요:

위치: `fe/supabase/migrations/add_club_admins.sql`

이 마이그레이션은 다음을 수행합니다:
- ✅ `club_admins` 테이블 생성
- ✅ 인덱스 추가 (성능 최적화)
- ✅ RLS 정책 설정
- ✅ 기존 `users.club_id` 데이터를 `club_admins`로 마이그레이션

```sql
-- 마이그레이션 파일 내용 확인
SELECT * FROM club_admins LIMIT 10;
```

### Step 2: 기존 데이터 확인

```sql
-- 기존 users.club_id에서 마이그레이션된 데이터 확인
SELECT
  ca.id,
  u.email,
  u.name,
  c.name as club_name
FROM club_admins ca
JOIN users u ON ca.user_id = u.id
JOIN clubs c ON ca.club_id = c.id;
```

## 2. 사용자 플로우

### 일반 사용자 → 동아리 관리자 승격

#### 옵션 A: 관리자가 직접 추가 (권장)

```sql
-- 1. 사용자의 role을 club_admin으로 변경
UPDATE users
SET role = 'club_admin'
WHERE email = 'user@g.hongik.ac.kr';

-- 2. club_admins 테이블에 관계 추가
INSERT INTO club_admins (user_id, club_id)
VALUES (
  (SELECT id FROM users WHERE email = 'user@g.hongik.ac.kr'),
  '동아리-UUID'
);
```

#### 옵션 B: 여러 동아리에 동시 추가

```sql
-- 한 사용자를 여러 동아리의 관리자로 추가
INSERT INTO club_admins (user_id, club_id)
VALUES
  ('user-uuid', 'club-uuid-1'),
  ('user-uuid', 'club-uuid-2'),
  ('user-uuid', 'club-uuid-3')
ON CONFLICT (user_id, club_id) DO NOTHING;
```

### 동아리 관리자 → 일반 사용자로 강등

```sql
-- 1. 모든 동아리 관리 권한 제거
DELETE FROM club_admins
WHERE user_id = 'user-uuid';

-- 2. role을 user로 변경
UPDATE users
SET role = 'user'
WHERE id = 'user-uuid';
```

### 특정 동아리 관리 권한만 제거

```sql
-- 특정 동아리의 관리 권한만 제거
DELETE FROM club_admins
WHERE user_id = 'user-uuid'
  AND club_id = 'club-uuid';
```

## 3. 페이지 구조

### 동아리 선택 페이지 (`/club/manage`)

**접근 조건**: `club_admin` 또는 `admin` 역할

**기능**:
- 사용자가 관리하는 모든 동아리 목록 표시
- 각 동아리 카드:
  - 로고 이미지
  - 동아리 이름
  - 간단 소개
  - 회장 정보
  - 모집 상태
- 동아리 카드 클릭 → 해당 동아리 관리 페이지로 이동

### 동아리 관리 페이지 (`/club/manage/:clubId`)

**접근 조건**:
- `admin` 역할, 또는
- `club_admin` 역할 + 해당 동아리 관리 권한 보유

**기능**:
- 권한 검증 (`useCanManageClub` 훅 사용)
- 권한이 없으면 접근 거부
- 3개 탭: 기본 정보, 모집 관리, 활동 관리

**뒤로 가기**: `/club/manage`로 이동 (동아리 선택 페이지)

## 4. API 훅 사용법

### useManagedClubs

사용자가 관리하는 동아리 목록 조회

```typescript
import { useManagedClubs } from '@/hooks/useClubAdmins';

function MyComponent() {
  const { user } = useAuth();
  const { data: clubs, isLoading } = useManagedClubs(user?.id);

  return (
    <div>
      {clubs?.map(club => (
        <div key={club.id}>{club.name}</div>
      ))}
    </div>
  );
}
```

### useCanManageClub

특정 동아리에 대한 관리 권한 확인

```typescript
import { useCanManageClub } from '@/hooks/useClubAdmins';

function ClubManage() {
  const { user } = useAuth();
  const { clubId } = useParams();
  const { data: canManage, isLoading } = useCanManageClub(user?.id, clubId);

  if (!canManage) {
    return <div>권한 없음</div>;
  }

  return <div>관리 페이지</div>;
}
```

### useClubAdmins

특정 동아리의 모든 관리자 조회 (admin 전용)

```typescript
import { useClubAdmins } from '@/hooks/useClubAdmins';

function AdminPanel() {
  const { data: admins } = useClubAdmins(clubId);

  return (
    <div>
      {admins?.map(admin => (
        <div key={admin.id}>{admin.user_id}</div>
      ))}
    </div>
  );
}
```

### useAddClubAdmin / useRemoveClubAdmin

관리자 추가/제거 (admin 전용)

```typescript
import { useAddClubAdmin, useRemoveClubAdmin } from '@/hooks/useClubAdmins';

function AdminPanel() {
  const addAdmin = useAddClubAdmin();
  const removeAdmin = useRemoveClubAdmin();

  const handleAdd = async () => {
    await addAdmin.mutateAsync({
      user_id: 'user-uuid',
      club_id: 'club-uuid',
    });
  };

  const handleRemove = async (adminId: string) => {
    await removeAdmin.mutateAsync(adminId);
  };
}
```

## 5. RLS 정책

### club_admins 테이블 정책

1. **SELECT (사용자)**: 자신의 관리 권한만 조회 가능
2. **SELECT (관리자)**: 모든 관리 권한 조회 가능
3. **INSERT/UPDATE/DELETE**: 사이트 관리자만 가능

### clubs 테이블 정책 (기존)

기존 정책이 `users.club_id`를 참조하는 경우, `club_admins` 테이블을 참조하도록 업데이트 필요:

```sql
-- 예시: club_admin이 자신이 관리하는 동아리만 수정 가능
CREATE POLICY "Club admins can update their clubs"
ON clubs FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM club_admins
    WHERE club_id = clubs.id
  )
);
```

### club_activities 테이블 정책 (기존)

활동 관리 정책도 유사하게 업데이트:

```sql
CREATE POLICY "Club admins can manage activities"
ON club_activities FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM club_admins
    WHERE club_id = club_activities.club_id
  )
);
```

## 6. 테스트 시나리오

### 시나리오 1: 단일 동아리 관리

1. 사용자를 `club_admin`으로 승격
2. 하나의 동아리에만 추가
3. `/club/manage` 접속
4. 1개 동아리만 표시되는지 확인
5. 동아리 클릭 → 관리 페이지로 이동
6. 3개 탭 모두 정상 작동 확인

### 시나리오 2: 여러 동아리 관리

1. 사용자를 3개 동아리에 추가
2. `/club/manage` 접속
3. 3개 동아리 모두 카드로 표시되는지 확인
4. 각 동아리 선택하여 관리 페이지 진입
5. 뒤로 가기 버튼으로 선택 페이지 복귀

### 시나리오 3: 권한 없는 접근

1. club_admin 계정으로 로그인
2. 다른 동아리의 UUID를 URL에 직접 입력
3. 권한 없음 메시지 표시 확인
4. RLS 정책에 의한 데이터 차단 확인

### 시나리오 4: 사이트 관리자

1. `admin` 역할로 로그인
2. 모든 동아리 관리 가능한지 확인
3. `useCanManageClub`가 항상 `true` 반환 확인

## 7. 기존 users.club_id 필드 처리

### 옵션 A: 필드 유지 (권장)

- 하위 호환성 유지
- 기존 코드가 계속 작동
- 새로운 기능과 병행 사용

### 옵션 B: 필드 제거

기존 시스템이 완전히 마이그레이션된 후:

```sql
-- 백업 먼저!
-- ALTER TABLE users DROP COLUMN club_id;
```

⚠️ **주의**: 다른 코드에서 `users.club_id`를 참조하는 곳이 있는지 반드시 확인

## 8. 문제 해결

### "관리할 동아리가 없습니다" 메시지

**원인**: `club_admins` 테이블에 레코드가 없음

**해결**:
```sql
-- 사용자 ID 확인
SELECT id, email, role FROM users WHERE email = 'your@email.com';

-- club_admins에 추가
INSERT INTO club_admins (user_id, club_id)
VALUES ('user-uuid', 'club-uuid');
```

### "접근 권한 없음" 메시지

**원인**:
- 해당 동아리에 대한 관리 권한 없음
- RLS 정책 오류

**해결**:
```sql
-- 권한 확인
SELECT * FROM club_admins
WHERE user_id = 'user-uuid' AND club_id = 'club-uuid';

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'club_admins';
```

### 동아리 목록이 비어있음

**원인**:
- 마이그레이션이 실행되지 않음
- JOIN이 제대로 작동하지 않음

**해결**:
```sql
-- club_admins 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'club_admins'
);

-- 데이터 확인
SELECT ca.*, c.name
FROM club_admins ca
LEFT JOIN clubs c ON ca.club_id = c.id
WHERE ca.user_id = 'user-uuid';
```

## 9. 향후 개선사항

### Admin 페이지에 관리자 관리 기능 추가

- 동아리별 관리자 목록 보기
- 관리자 추가/제거 UI
- 관리자 권한 로그

### 알림 시스템

- 새로운 관리자로 임명되었을 때 알림
- 관리 권한이 제거되었을 때 알림

### 역할 세분화

```typescript
// 예시: 동아리 내 역할 구분
type ClubRole = 'owner' | 'editor' | 'viewer';

interface ClubAdmin {
  user_id: string;
  club_id: string;
  role: ClubRole;
}
```

## 10. 참고 자료

- [Supabase Many-to-Many 관계](https://supabase.com/docs/guides/database/joins-and-nesting)
- [RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router 동적 라우팅](https://reactrouter.com/en/main/route/route#dynamic-segments)