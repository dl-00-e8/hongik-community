# 동아리 관리자 접근 문제 - 수정 요약

## 문제
동아리 관리자 권한을 가진 사용자가 `/club/manage` 페이지에 접근할 수 없는 문제

## 원인
`club_admins` 테이블이 생성되지 않았거나, 데이터가 이전되지 않았을 가능성

## 적용된 해결책

### 1. Fallback 로직 추가
`useManagedClubs` 훅에 3단계 fallback 메커니즘 구현:

```
1순위: club_admins 테이블 조회 (새로운 구조)
   ↓ (실패 시)
2순위: users.club_id 확인 (Legacy 구조)
   ↓ (실패 시)
3순위: role == 'admin'이면 모든 동아리 접근 허용
```

### 2. 권한 확인 로직 강화
`useCanManageClub` 훅도 동일한 fallback 적용

### 3. 디버깅 도구 추가
- `checkMigrationStatus()`: 마이그레이션 상태 확인 함수
- 브라우저 콘솔에서 `window.checkMigrationStatus()` 실행 가능

## 즉시 테스트 방법

### 1단계: 개발 서버 실행
```bash
cd fe
npm run dev
```

### 2단계: 브라우저에서 확인
1. 동아리 관리자 계정으로 로그인
2. 개발자 도구(F12) 열기
3. 콘솔에서 실행:
   ```javascript
   window.checkMigrationStatus()
   ```

### 3단계: 결과 해석

#### 케이스 A: club_admins 테이블 없음
```
❌ club_admins table does NOT exist
```
**행동:** Fallback이 자동으로 `users.club_id`를 사용합니다.
- `users.club_id`가 설정되어 있다면 → 접근 가능
- 설정되어 있지 않다면 → 마이그레이션 필요

#### 케이스 B: club_admins 테이블 있지만 데이터 없음
```
✅ club_admins table exists
📊 club_admins entries: 0
```
**행동:** Fallback이 자동으로 `users.club_id`를 사용합니다.

#### 케이스 C: 정상 작동
```
✅ club_admins table exists
📊 club_admins entries: X
```
**행동:** 정상적으로 club_admins 테이블 사용

## 마이그레이션 적용 방법

### 옵션 1: 전체 마이그레이션 실행 (권장)

1. Supabase 대시보드 접속
2. SQL Editor 열기
3. `fe/supabase/migrations/add_club_admins.sql` 내용 복사
4. 실행

### 옵션 2: 수동으로 사용자 추가

특정 사용자에게만 권한 부여:

```sql
-- 사용자 ID와 동아리 ID 확인
SELECT id, email, name, club_id FROM users WHERE email = '사용자이메일@g.hongik.ac.kr';
SELECT id, name FROM clubs WHERE name = '동아리명';

-- club_admins에 추가
INSERT INTO club_admins (user_id, club_id)
VALUES ('사용자-UUID', '동아리-UUID')
ON CONFLICT (user_id, club_id) DO NOTHING;
```

## 수정된 파일 목록

### 핵심 수정
1. **`fe/src/hooks/useClubAdmins.ts`**
   - `useManagedClubs`: Fallback 로직 추가
   - `useCanManageClub`: Legacy 지원 추가

### 새로 추가된 파일
2. **`fe/src/lib/checkMigrationStatus.ts`**
   - 마이그레이션 상태 확인 유틸리티

3. **`fe/src/main.tsx`**
   - 개발 모드에서 디버깅 도구 자동 로드

4. **`fe/TROUBLESHOOTING_CLUB_ADMIN.md`**
   - 상세한 트러블슈팅 가이드

5. **`fe/QUICK_FIX_SUMMARY.md`** (이 파일)
   - 빠른 참조 가이드

## 장점

### 1. 하위 호환성
- 기존 `users.club_id` 구조도 계속 작동
- 마이그레이션 없이도 동작

### 2. 점진적 마이그레이션
- 급하게 모든 데이터를 옮길 필요 없음
- 필요할 때 천천히 마이그레이션 가능

### 3. 미래 지향적
- 다중 동아리 관리 기능 준비 완료
- `club_admins` 테이블이 생성되면 자동으로 활용

## 주의사항

### 사이트 관리자 (role = 'admin')
- 별도 설정 없이 모든 동아리 접근 가능
- `club_admins` 테이블에 추가할 필요 없음

### 동아리 관리자 (role = 'club_admin')
다음 중 하나가 필요:
- `users.club_id`에 동아리 ID 설정, 또는
- `club_admins` 테이블에 레코드 추가

## 다음 단계 (선택사항)

### 완전한 마이그레이션을 위해
1. `add_club_admins.sql` 마이그레이션 실행
2. 모든 사용자 테스트
3. Legacy `users.club_id` 컬럼 Deprecated 표시 (추후)

### 지금 당장은
- Fallback 로직이 자동으로 처리
- 추가 작업 불필요
- 정상 동작 확인

## 테스트 체크리스트

- [ ] 개발 서버 실행 및 로그인
- [ ] `window.checkMigrationStatus()` 실행
- [ ] `/club/manage` 페이지 접근 테스트
- [ ] 동아리 정보 수정 테스트
- [ ] 다른 동아리 관리자도 테스트

## 추가 도움이 필요한 경우

상세한 내용은 다음 문서를 참고하세요:
- **`TROUBLESHOOTING_CLUB_ADMIN.md`**: 상세한 문제 해결 가이드
- **`MULTI_CLUB_ADMIN_SETUP.md`**: 다중 동아리 관리 기능 설명
- **`supabase/migrations/add_club_admins.sql`**: 마이그레이션 SQL 스크립트