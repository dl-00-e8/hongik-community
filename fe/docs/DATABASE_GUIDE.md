# 데이터베이스 설정 및 사용 가이드

이 문서는 Hongik Community 프로젝트의 데이터베이스 설정 및 사용 방법을 안내합니다.

## 📋 목차

1. [데이터베이스 구조](#데이터베이스-구조)
2. [초기 설정](#초기-설정)
3. [스키마 적용](#스키마-적용)
4. [데이터 마이그레이션](#데이터-마이그레이션)
5. [서비스 레이어 사용법](#서비스-레이어-사용법)
6. [React Hooks 사용법](#react-hooks-사용법)
7. [트러블슈팅](#트러블슈팅)

## 🗄️ 데이터베이스 구조

### 테이블 개요

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 정보 및 권한 관리 |
| `categories` | 동아리 카테고리 |
| `clubs` | 동아리 기본 정보 |
| `club_activities` | 동아리 활동 피드 |
| `club_members` | 동아리 멤버십 정보 |

### ERD (개념적 구조)

```
users (사용자)
  ├─ id (UUID, PK)
  ├─ email (TEXT, UNIQUE)
  ├─ name (TEXT)
  ├─ role (TEXT: 'user', 'club_admin', 'admin')
  └─ club_id (UUID, FK → clubs.id)

categories (카테고리)
  ├─ id (UUID, PK)
  ├─ name (TEXT, UNIQUE)
  ├─ icon (TEXT)
  └─ display_order (INTEGER)

clubs (동아리)
  ├─ id (UUID, PK)
  ├─ name (TEXT, UNIQUE)
  ├─ category_id (UUID, FK → categories.id)
  ├─ short_description (TEXT)
  ├─ description (TEXT, Markdown)
  ├─ president (TEXT)
  ├─ contact (TEXT)
  ├─ club_room (TEXT)
  ├─ recruitment_start (DATE)
  ├─ recruitment_end (DATE)
  ├─ regular_schedule (TEXT)
  ├─ instagram_handle (TEXT)
  ├─ logo_url (TEXT)
  ├─ cover_image_url (TEXT)
  ├─ member_count (INTEGER)
  └─ is_recruiting (BOOLEAN)

club_activities (활동)
  ├─ id (UUID, PK)
  ├─ club_id (UUID, FK → clubs.id)
  ├─ image_url (TEXT)
  ├─ caption (TEXT)
  ├─ is_instagram (BOOLEAN)
  └─ created_at (TIMESTAMP)

club_members (멤버십)
  ├─ id (UUID, PK)
  ├─ club_id (UUID, FK → clubs.id)
  ├─ user_id (UUID, FK → users.id)
  ├─ position (TEXT)
  └─ joined_at (TIMESTAMP)
```

## 🚀 초기 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: hongik-community (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: Northeast Asia (Seoul) 권장

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Supabase 정보를 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일 내용:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**환경 변수를 찾는 방법:**
1. Supabase 대시보드에서 프로젝트 선택
2. Settings → API로 이동
3. **Project URL**과 **anon/public key** 복사

## 📊 스키마 적용

### Supabase MCP를 통한 스키마 적용 (권장)

이미 Supabase MCP가 연결되어 있으므로, 다음 명령어로 스키마를 적용할 수 있습니다:

```bash
# SQL 파일의 내용을 읽어서 적용
npx supabase db push
```

또는 Supabase 대시보드를 통해:

1. Supabase 대시보드의 **SQL Editor**로 이동
2. `supabase/schema.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기
4. **Run** 버튼 클릭

### 스키마가 생성하는 것들

- ✅ 5개의 테이블
- ✅ RLS (Row Level Security) 정책
- ✅ 인덱스 (성능 최적화)
- ✅ 트리거 (자동 업데이트)
- ✅ 함수 (비즈니스 로직)
- ✅ 뷰 (편의성)

## 📦 데이터 마이그레이션

mockData.ts에 있는 샘플 데이터를 Supabase로 마이그레이션합니다.

### 마이그레이션 실행

```bash
# tsx 설치 (아직 없다면)
npm install -D tsx

# 마이그레이션 실행
npx tsx src/scripts/migrate-mock-data.ts
```

### 마이그레이션 과정

1. **Categories 마이그레이션**: 학술, 예술, 음악, 스포츠, 봉사
2. **Clubs 마이그레이션**: 6개의 샘플 동아리
3. **Activities 마이그레이션**: 5개의 샘플 활동

### 마이그레이션 확인

Supabase 대시보드에서 확인:
1. **Table Editor** → `categories` 테이블 확인
2. **Table Editor** → `clubs` 테이블 확인
3. **Table Editor** → `club_activities` 테이블 확인

## 💼 서비스 레이어 사용법

서비스 레이어는 Supabase와의 통신을 캡슐화합니다.

### ClubsService 예제

```typescript
import ClubsService from '@/services/clubs.service';

// 모든 동아리 가져오기
const { data: clubs, error } = await ClubsService.getAllClubs();

// 카테고리별 필터링
const { data: academicClubs } = await ClubsService.getAllClubs({
  categoryId: 'some-category-id',
});

// 검색
const { data: searchResults } = await ClubsService.searchClubs('코딩');

// 동아리 생성
const { data: newClub } = await ClubsService.createClub({
  name: '새 동아리',
  category_id: 'category-id',
  short_description: '짧은 설명',
  description: '# 상세 설명 (Markdown)',
  president: '회장 이름',
  contact: 'email@university.ac.kr',
});
```

### ActivitiesService 예제

```typescript
import ActivitiesService from '@/services/activities.service';

// 동아리의 활동 가져오기
const { data: activities } = await ActivitiesService.getActivitiesByClub('club-id');

// 최근 활동 가져오기
const { data: recentActivities } = await ActivitiesService.getRecentActivities(10);

// 활동 생성
const { data: newActivity } = await ActivitiesService.createActivity({
  club_id: 'club-id',
  image_url: 'https://example.com/image.jpg',
  caption: '활동 설명',
  is_instagram: false,
});
```

### CategoriesService 예제

```typescript
import CategoriesService from '@/services/categories.service';

// 모든 카테고리 가져오기
const { data: categories } = await CategoriesService.getAllCategories();

// 카테고리별 동아리 수와 함께 가져오기
const { data: categoriesWithCount } = await CategoriesService.getCategoriesWithClubCount();
```

## 🪝 React Hooks 사용법

React 컴포넌트에서 데이터를 쉽게 사용할 수 있는 hooks입니다.

### useClubs Hook

```typescript
import { useClubs, useClub } from '@/hooks/useClubs';

function ClubList() {
  // 모든 동아리 가져오기
  const { data: clubs, isLoading, error } = useClubs();

  // 필터링된 동아리
  const { data: academicClubs } = useClubs({
    categoryId: 'category-id',
    isRecruiting: true,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return (
    <div>
      {clubs?.map(club => (
        <div key={club.id}>{club.name}</div>
      ))}
    </div>
  );
}

function ClubDetail({ clubId }: { clubId: string }) {
  // 단일 동아리 가져오기
  const { data: club, isLoading } = useClub(clubId);

  if (isLoading) return <div>로딩 중...</div>;
  if (!club) return <div>동아리를 찾을 수 없습니다</div>;

  return <div>{club.name}</div>;
}
```

### useActivities Hook

```typescript
import { useClubActivities, useRecentActivities } from '@/hooks/useActivities';

function ActivityFeed({ clubId }: { clubId: string }) {
  // 동아리별 활동
  const { data: activities, isLoading } = useClubActivities(clubId);

  return (
    <div>
      {activities?.map(activity => (
        <div key={activity.id}>
          <img src={activity.image_url} alt={activity.caption || ''} />
          <p>{activity.caption}</p>
        </div>
      ))}
    </div>
  );
}

function RecentActivities() {
  // 최근 활동 (홈페이지용)
  const { data: activities } = useRecentActivities(10);

  return <div>{/* 활동 표시 */}</div>;
}
```

### useCategories Hook

```typescript
import { useCategories, useCategoriesWithClubCount } from '@/hooks/useCategories';

function CategoryFilter() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div>
      {categories?.map(category => (
        <button key={category.id}>
          {category.icon} {category.name}
        </button>
      ))}
    </div>
  );
}

function CategoryStats() {
  const { data: categoriesWithCount } = useCategoriesWithClubCount();

  return (
    <div>
      {categoriesWithCount?.map(category => (
        <div key={category.id}>
          {category.name}: {category.club_count}개 동아리
        </div>
      ))}
    </div>
  );
}
```

### Mutation Hooks (생성/수정/삭제)

```typescript
import { useCreateClub, useUpdateClub, useDeleteClub } from '@/hooks/useClubs';

function ClubManagement() {
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();

  const handleCreate = () => {
    createClub.mutate({
      name: '새 동아리',
      short_description: '설명',
      description: '# 상세 설명',
      president: '회장',
      contact: 'email@university.ac.kr',
    });
  };

  const handleUpdate = (clubId: string) => {
    updateClub.mutate({
      id: clubId,
      updates: {
        name: '수정된 이름',
      },
    });
  };

  const handleDelete = (clubId: string) => {
    deleteClub.mutate(clubId);
  };

  return <div>{/* UI */}</div>;
}
```

## 🔧 트러블슈팅

### 환경 변수 인식 안 됨

**증상**: "Missing Supabase environment variables" 에러

**해결법**:
1. `.env` 파일이 프로젝트 루트(`fe/` 디렉토리)에 있는지 확인
2. 환경 변수 이름이 `VITE_`로 시작하는지 확인
3. 개발 서버 재시작: `npm run dev`

### RLS 정책 에러

**증상**: "new row violates row-level security policy" 에러

**해결법**:
1. Supabase 대시보드 → Authentication → Policies 확인
2. `schema.sql`의 RLS 정책이 올바르게 적용되었는지 확인
3. 필요시 SQL Editor에서 RLS 정책 재실행

### 마이그레이션 중복 에러

**증상**: "duplicate key value violates unique constraint" 에러

**해결법**:
마이그레이션 스크립트는 중복을 자동으로 체크하므로 이 에러가 발생하면:
1. Supabase 대시보드에서 기존 데이터 확인
2. 필요시 테이블 초기화 후 재실행

### 타입 에러

**증상**: TypeScript 타입 관련 에러

**해결법**:
1. `src/types/database.types.ts` 확인
2. Supabase CLI로 타입 재생성:
   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
   ```

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [TanStack Query 문서](https://tanstack.com/query/latest)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 다음 단계

1. ✅ 스키마 적용 완료
2. ✅ 샘플 데이터 마이그레이션 완료
3. 🔲 기존 페이지를 Supabase 데이터로 전환
4. 🔲 관리자 페이지 구현 (동아리 CRUD)
5. 🔲 이미지 업로드 기능 (Supabase Storage)
6. 🔲 Instagram 연동 기능

## 💡 팁

- **캐싱**: TanStack Query가 자동으로 데이터를 캐싱하므로 불필요한 API 호출이 줄어듭니다
- **낙관적 업데이트**: mutation hooks에 `onMutate`를 추가하여 UI 반응성 향상 가능
- **실시간 구독**: Supabase Realtime을 사용하여 실시간 업데이트 구현 가능
- **스토리지**: `supabase.storage.from('bucket-name')`로 이미지 업로드/다운로드 가능
