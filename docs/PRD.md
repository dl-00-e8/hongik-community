# Product Requirements Document (PRD)
## Hongik Community - 홍익대학교 총동아리연합회 소개 사이트

**문서 버전:** 1.0  
**작성일:** 2026년 1월 10일  
**최종 수정일:** 2026년 1월 10일

---

## 1. 제품 개요

### 1.1 배경 및 목적

홍익대학교에는 다양한 연합동아리가 활동하고 있으나, 동아리 정보가 분산되어 있어 신입생 및 재학생들이 동아리를 탐색하고 가입하는 데 어려움을 겪고 있습니다. 이에 총동아리연합회 차원에서 모든 연합동아리의 정보를 통합하여 제공하고, 동아리의 활동을 효과적으로 홍보할 수 있는 플랫폼이 필요합니다.

### 1.2 제품 목표

- 모든 연합동아리의 정보를 한곳에서 쉽게 조회할 수 있는 환경 제공
- 동아리별 자율적인 정보 관리 시스템 구축
- 동아리 활동의 시각적 홍보를 통한 참여 유도
- 체계적인 권한 관리를 통한 안정적인 플랫폼 운영

### 1.3 타겟 사용자

1. **일반 사용자 (학생)**
   - 동아리 정보를 탐색하고 가입을 희망하는 신입생
   - 새로운 동아리 활동을 찾는 재학생
   - 동아리 활동에 관심 있는 모든 학생

2. **동아리 관리자**
   - 각 동아리의 회장 및 임원진
   - 동아리 정보 및 활동 피드를 관리하는 담당자

3. **웹사이트 총 관리자**
   - 총동아리연합회 운영진
   - 전체 시스템을 관리하고 모니터링하는 관리자

---

## 2. 핵심 기능 요구사항

### 2.1 사용자 관리 시스템

#### 2.1.1 회원가입 및 인증

**기능 설명**

사용자는 이메일 기반으로 회원가입을 하며, 3단계 권한 시스템으로 구분됩니다.

**세부 요구사항**

- 이메일 + 비밀번호 기반 회원가입
- 홍익대학교 이메일 인증 (선택적)
- 회원가입 시 기본 정보 입력
  - 이름
  - 학번 (선택)
  - 학과
  - 연락처
- 이메일 인증 프로세스
- 비밀번호 재설정 기능

**권한 레벨**

| 권한 레벨 | 역할 | 주요 권한 |
|----------|------|----------|
| **Level 1** | 일반 사용자 | - 동아리 정보 조회<br>- 활동 피드 열람<br>- 검색 및 필터링 |
| **Level 2** | 동아리 관리자 | - Level 1 권한 전체<br>- 소속 동아리 정보 수정<br>- 활동 피드 업로드/삭제<br>- Instagram 연동 관리 |
| **Level 3** | 웹사이트 총 관리자 | - Level 1, 2 권한 전체<br>- 모든 동아리 정보 관리<br>- 동아리 관리자 지정/해제<br>- 사용자 관리<br>- 시스템 설정 |

**UI/UX 요구사항**

- 직관적인 회원가입 폼
- 권한별 대시보드 구분
- 비밀번호 강도 체크
- 이메일 인증 상태 표시

#### 2.1.2 로그인 및 세션 관리

**기능 설명**

안전한 로그인 프로세스와 세션 관리를 제공합니다.

**세부 요구사항**

- JWT 기반 인증 시스템
- 로그인 상태 유지 (Remember Me)
- 자동 로그아웃 (일정 시간 미활동 시)
- 다중 디바이스 세션 관리

### 2.2 동아리 소개 시스템

#### 2.2.1 동아리 기본 정보

**기능 설명**

각 동아리의 핵심 정보를 구조화하여 표시합니다.

**데이터 모델**

```typescript
interface Club {
  id: string;
  name: string;                    // 동아리명
  category: ClubCategory;          // 카테고리 (체육, 문화, 학술 등)
  description: string;             // 한줄 소개
  
  // 연락 정보
  president: {
    name: string;                  // 회장 이름
    contact: string;               // 연락처
    email: string;                 // 이메일
  };
  
  // 활동 정보
  clubRoom: string;                // 동아리방 위치
  recruitmentPeriod: {
    start: Date;                   // 모집 시작일
    end: Date;                     // 모집 종료일
    isRecruiting: boolean;         // 현재 모집 중 여부
  };
  
  regularSchedule: {
    dayOfWeek: string;             // 요일
    time: string;                  // 시간
    location: string;              // 장소
    frequency: string;             // 빈도 (주 1회, 격주 등)
  }[];
  
  // 상세 정보 (마크다운)
  detailContent: string;           // 마크다운 형식
  
  // 메타 정보
  logo: string;                    // 동아리 로고 URL
  coverImage: string;              // 커버 이미지 URL
  createdAt: Date;
  updatedAt: Date;
}

enum ClubCategory {
  SPORTS = "체육",
  CULTURE = "문화예술",
  ACADEMIC = "학술",
  SOCIAL = "사회봉사",
  RELIGION = "종교",
  ETC = "기타"
}
```

**UI 레이아웃**

- 동아리 카드 그리드 뷰
  - 로고, 이름, 카테고리, 한줄 소개
  - 모집 중 배지 표시
- 동아리 상세 페이지
  - 헤더 (커버 이미지, 로고, 기본 정보)
  - 탭 구조
    - 소개 (마크다운 렌더링)
    - 활동 피드
    - 정규 일정
    - 연락하기

#### 2.2.2 마크다운 기반 상세 소개

**기능 설명**

동아리 관리자가 마크다운 형식으로 상세 소개를 작성하고, 사용자에게는 렌더링된 형태로 제공합니다.

**세부 요구사항**

- 마크다운 에디터 제공
  - 실시간 프리뷰
  - 이미지 업로드 지원
  - 문법 가이드
- 마크다운 렌더링
  - 제목, 목록, 링크, 이미지 등 기본 문법 지원
  - 코드 블록 하이라이팅 (선택적)
  - 반응형 이미지 처리
- 버전 관리 (선택적)
  - 수정 이력 저장
  - 이전 버전으로 복구

**기술 스택**

- 에디터: React-Markdown-Editor 또는 Toast UI Editor
- 렌더러: react-markdown + remark-gfm
- 이미지 저장: AWS S3 또는 Cloudinary

#### 2.2.3 검색 및 필터링

**기능 설명**

사용자가 원하는 동아리를 쉽게 찾을 수 있도록 다양한 검색 및 필터링 옵션을 제공합니다.

**세부 요구사항**

- 검색 기능
  - 동아리명 검색
  - 키워드 검색 (상세 소개 내용 포함)
  - 자동완성 제안
- 필터링 옵션
  - 카테고리별 필터
  - 모집 중인 동아리만 보기
  - 정규 모임 요일별 필터
- 정렬 옵션
  - 가나다순
  - 최근 업데이트순
  - 인기순 (조회수 기반, 선택적)

### 2.3 활동 피드 시스템

#### 2.3.1 Instagram 계정 연동

**기능 설명**

동아리의 Instagram 공식 계정과 연동하여 게시물을 자동으로 가져와 표시합니다.

**세부 요구사항**

- Instagram Graph API 연동
  - OAuth 2.0 인증
  - Access Token 관리 및 갱신
- 게시물 동기화
  - 최근 게시물 자동 가져오기 (최대 20개)
  - 주기적 업데이트 (하루 1회)
  - 이미지, 캡션, 게시일 표시
- 연동 관리 (동아리 관리자)
  - Instagram 계정 연결/해제
  - 동기화 상태 확인
  - 수동 동기화 트리거

**데이터 모델**

```typescript
interface InstagramPost {
  id: string;
  clubId: string;
  instagramId: string;           // Instagram 게시물 ID
  imageUrl: string;
  caption: string;
  permalink: string;             // Instagram 원본 링크
  timestamp: Date;
  likeCount?: number;            // 선택적
  commentCount?: number;         // 선택적
  syncedAt: Date;
}
```

**제약사항**

- Instagram Business 또는 Creator 계정 필요
- Facebook Page와 연결된 계정만 API 접근 가능
- API 호출 제한 고려 (Rate Limiting)

#### 2.3.2 직접 이미지 업로드

**기능 설명**

Instagram 연동이 없거나 추가 콘텐츠를 게시하고 싶은 경우, 동아리 관리자가 직접 이미지를 업로드할 수 있습니다.

**세부 요구사항**

- 이미지 업로드
  - 다중 이미지 업로드 (최대 10장)
  - 드래그 앤 드롭 지원
  - 이미지 미리보기
  - 지원 포맷: JPEG, PNG, WebP
  - 최대 파일 크기: 5MB per image
- 게시물 작성
  - 제목 (선택적)
  - 내용 (최대 500자)
  - 이미지 순서 조정
  - 게시일 설정 (즉시 또는 예약)
- 게시물 관리
  - 수정
  - 삭제
  - 비공개 전환

**데이터 모델**

```typescript
interface ActivityPost {
  id: string;
  clubId: string;
  type: 'instagram' | 'upload';
  
  // 직접 업로드용 필드
  title?: string;
  content?: string;
  images: {
    url: string;
    order: number;
    altText?: string;
  }[];
  
  // 공통 필드
  publishedAt: Date;
  isPublished: boolean;
  createdBy: string;              // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.3.3 피드 UI

**기능 설명**

Instagram 피드와 직접 업로드 콘텐츠를 통합하여 시각적으로 매력적인 갤러리 형태로 표시합니다.

**UI 요구사항**

- 그리드 레이아웃 (3열)
  - 반응형 디자인 (모바일: 2열)
  - Masonry 레이아웃 또는 정사각형 그리드
- 게시물 상세 모달
  - 이미지 캐러셀
  - 캡션/내용 표시
  - Instagram 게시물은 원본 링크 제공
  - 닫기 버튼 및 ESC 키 지원
- 무한 스크롤 또는 페이지네이션
- 소스 표시 (Instagram 아이콘 또는 "직접 업로드" 배지)

---

## 3. 비기능 요구사항

### 3.1 성능

- 페이지 로딩 시간: 초기 로딩 3초 이내
- 이미지 최적화: WebP 포맷 사용, Lazy Loading
- API 응답 시간: 평균 500ms 이내
- 동시 접속자 지원: 최소 500명

### 3.2 보안

- HTTPS 통신 필수
- JWT 토큰 만료 시간: 1시간 (Refresh Token: 7일)
- XSS, CSRF 방어
- SQL Injection 방어
- 파일 업로드 검증 (파일 타입, 크기)
- Rate Limiting (API 호출 제한)

### 3.3 접근성

- WCAG 2.1 AA 레벨 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 적절한 색상 대비 (4.5:1 이상)

### 3.4 호환성

- 브라우저 지원
  - Chrome (최신 버전 - 2)
  - Firefox (최신 버전 - 2)
  - Safari (최신 버전 - 2)
  - Edge (최신 버전 - 2)
- 모바일 디바이스
  - iOS Safari 14+
  - Android Chrome 90+
- 화면 해상도
  - 데스크톱: 1920x1080 기준 최적화
  - 태블릿: 768px ~ 1024px
  - 모바일: 320px ~ 767px

### 3.5 확장성

- 동아리 수: 최대 200개까지 확장 가능
- 게시물 수: 동아리당 최대 1,000개
- 이미지 저장소: CDN 연동 (CloudFront, Cloudflare)
- 데이터베이스 인덱싱 전략 수립

---

## 4. 사용자 스토리

### 4.1 일반 사용자

**US-001: 동아리 탐색**
> "신입생으로서 나는 다양한 동아리를 한눈에 보고 비교하고 싶다. 그래서 홈 페이지에서 모든 동아리를 카테고리별로 필터링하여 볼 수 있다."

**US-002: 동아리 상세 정보 조회**
> "관심 있는 동아리를 찾았으니 더 자세한 정보를 알고 싶다. 그래서 동아리 페이지에서 모집 기간, 정규 일정, 연락처 등을 확인할 수 있다."

**US-003: 활동 피드 열람**
> "동아리가 실제로 어떤 활동을 하는지 궁금하다. 그래서 활동 피드 탭에서 최근 활동 사진과 글을 볼 수 있다."

### 4.2 동아리 관리자

**US-004: 동아리 정보 수정**
> "회장으로서 동아리 정보를 최신 상태로 유지하고 싶다. 그래서 관리자 대시보드에서 모집 기간, 정규 일정 등을 수정할 수 있다."

**US-005: 마크다운으로 소개 작성**
> "동아리를 매력적으로 소개하고 싶다. 그래서 마크다운 에디터로 이미지와 텍스트를 조합하여 상세 소개를 작성할 수 있다."

**US-006: Instagram 연동**
> "동아리 Instagram 계정의 게시물을 자동으로 보여주고 싶다. 그래서 Instagram 계정을 연동하고 자동 동기화를 설정할 수 있다."

**US-007: 활동 사진 직접 업로드**
> "행사 사진을 빠르게 공유하고 싶다. 그래서 관리자 페이지에서 이미지를 직접 업로드하고 게시할 수 있다."

### 4.3 웹사이트 총 관리자

**US-008: 동아리 관리자 지정**
> "새로운 동아리가 등록되었다. 그래서 해당 동아리의 회장을 동아리 관리자로 지정할 수 있다."

**US-009: 전체 동아리 현황 모니터링**
> "플랫폼 운영 현황을 파악하고 싶다. 그래서 대시보드에서 전체 동아리 수, 게시물 수, 사용자 활동 등의 통계를 볼 수 있다."

**US-010: 부적절한 콘텐츠 관리**
> "부적절한 게시물이 신고되었다. 그래서 해당 게시물을 검토하고 필요시 삭제할 수 있다."

---

## 5. 기술 스택 및 아키텍처

### 5.1 Frontend

**프레임워크 및 라이브러리**
- React 18 + TypeScript
- Vite (빌드 도구)
- React Router v6 (라우팅)
- TanStack Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)

**UI 라이브러리**
- Tailwind CSS
- shadcn/ui (컴포넌트 라이브러리)
- Radix UI (Headless UI)
- Lucide React (아이콘)

**기타 라이브러리**
- react-markdown (마크다운 렌더링)
- react-hook-form (폼 관리)
- zod (유효성 검증)
- date-fns (날짜 처리)

### 5.2 Backend

**프레임워크**
- Node.js + NestJS (추천)
- 또는 Node.js + Express

**데이터베이스**
- PostgreSQL (Primary DB)
- Redis (캐싱, 세션 관리)

**ORM**
- Prisma

**인증**
- JWT (Access Token + Refresh Token)
- Passport.js

**파일 스토리지**
- AWS S3 (이미지 저장)
- CloudFront (CDN)

**외부 API**
- Instagram Graph API

### 5.3 인프라

**호스팅**
- Frontend: Vercel 또는 Netlify
- Backend: AWS EC2 / AWS ECS / Railway
- Database: AWS RDS (PostgreSQL)
- Storage: AWS S3

**CI/CD**
- GitHub Actions
- 자동 테스트 및 배포

**모니터링**
- Sentry (에러 트래킹)
- Google Analytics (사용자 분석)

### 5.4 아키텍처 다이어그램

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────┐
│      Frontend (React)        │
│  - React Router              │
│  - TanStack Query            │
│  - Zustand                   │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│     Backend API (NestJS)     │
│  - REST API                  │
│  - JWT Authentication        │
│  - File Upload Handler       │
└────┬─────────────┬───────────┘
     │             │
     ↓             ↓
┌─────────┐   ┌──────────────┐
│PostgreSQL│   │ Instagram    │
│         │   │ Graph API    │
└─────────┘   └──────────────┘
     │
     ↓
┌─────────┐
│  Redis  │
│(Cache)  │
└─────────┘
     │
     ↓
┌─────────┐
│ AWS S3  │
│ (Images)│
└─────────┘
```

---

## 6. 데이터베이스 스키마

### 6.1 ERD 개요

```
Users ──(1:N)─→ Clubs (관리자)
Users ──(1:N)─→ ActivityPosts (작성자)
Clubs ──(1:N)─→ ActivityPosts
Clubs ──(1:1)─→ InstagramConnection
Clubs ──(1:N)─→ RegularSchedules
```

---

## 7. API 엔드포인트 설계

### 7.1 인증 (Authentication)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | 회원가입 | No |
| POST | `/api/auth/login` | 로그인 | No |
| POST | `/api/auth/logout` | 로그아웃 | Yes |
| POST | `/api/auth/refresh` | 토큰 갱신 | Yes |
| POST | `/api/auth/verify-email` | 이메일 인증 | No |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 요청 | No |
| PUT | `/api/auth/reset-password/:token` | 비밀번호 재설정 | No |

### 7.2 동아리 (Clubs)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/clubs` | 동아리 목록 조회 | No | - |
| GET | `/api/clubs/:id` | 동아리 상세 조회 | No | - |
| POST | `/api/clubs` | 동아리 생성 | Yes | Admin |
| PUT | `/api/clubs/:id` | 동아리 정보 수정 | Yes | Club Manager, Admin |
| DELETE | `/api/clubs/:id` | 동아리 삭제 | Yes | Admin |
| GET | `/api/clubs/search?q=keyword` | 동아리 검색 | No | - |
| GET | `/api/clubs?category=SPORTS&recruiting=true` | 필터링 | No | - |

### 7.3 활동 피드 (Activity Posts)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/clubs/:clubId/posts` | 피드 목록 조회 | No | - |
| GET | `/api/posts/:id` | 피드 상세 조회 | No | - |
| POST | `/api/clubs/:clubId/posts` | 피드 생성 (직접 업로드) | Yes | Club Manager, Admin |
| PUT | `/api/posts/:id` | 피드 수정 | Yes | Club Manager, Admin |
| DELETE | `/api/posts/:id` | 피드 삭제 | Yes | Club Manager, Admin |

### 7.4 Instagram 연동

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/clubs/:clubId/instagram/connect` | Instagram 연결 | Yes | Club Manager, Admin |
| DELETE | `/api/clubs/:clubId/instagram/disconnect` | Instagram 연결 해제 | Yes | Club Manager, Admin |
| POST | `/api/clubs/:clubId/instagram/sync` | 수동 동기화 | Yes | Club Manager, Admin |
| GET | `/api/clubs/:clubId/instagram/status` | 연결 상태 확인 | Yes | Club Manager, Admin |

### 7.5 파일 업로드

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/upload/image` | 이미지 업로드 | Yes | Club Manager, Admin |
| DELETE | `/api/upload/image/:key` | 이미지 삭제 | Yes | Club Manager, Admin |

### 7.6 사용자 관리 (관리자)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/admin/users` | 사용자 목록 | Yes | Admin |
| PUT | `/api/admin/users/:id/role` | 권한 변경 | Yes | Admin |
| PUT | `/api/admin/clubs/:clubId/manager` | 동아리 관리자 지정 | Yes | Admin |

---

## 8. UI/UX 설계

### 8.1 주요 페이지

**홈 페이지**
- Hero Section (소개 및 CTA)
- 카테고리별 동아리 프리뷰
- 모집 중인 동아리 강조
- 최근 활동 피드 프리뷰

**동아리 목록 페이지**
- 검색 바 (상단)
- 필터 사이드바
  - 카테고리
  - 모집 여부
  - 정규 모임 요일
- 동아리 카드 그리드
- 페이지네이션 또는 무한 스크롤

**동아리 상세 페이지**
- 헤더
  - 커버 이미지
  - 로고 (오버레이)
  - 동아리명
  - 카테고리 배지
  - 모집 상태 배지
- 탭 네비게이션
  - 소개 (기본 정보 + 마크다운 컨텐츠)
  - 활동 피드
  - 정규 일정
  - 연락하기
- 사이드바 (Sticky)
  - 빠른 연락 정보
  - 모집 기간 D-day
  - 공유하기 버튼

**관리자 대시보드**
- 사이드바 네비게이션
- 동아리 정보 관리 폼
- 활동 피드 관리 (CRUD)
- Instagram 연동 설정
- 통계 (조회수, 좋아요 등)

### 8.2 디자인 시스템

**색상 팔레트**
- Primary: #FF6B35 (홍익대 대표 색상 기반)
- Secondary: #004E89
- Accent: #F7B801
- Neutral: Gray scale (50-900)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

**타이포그래피**
- Heading: Pretendard (or Noto Sans KR) Bold
- Body: Pretendard (or Noto Sans KR) Regular
- Font Sizes: 12px, 14px, 16px, 18px, 24px, 32px, 48px

**스페이싱**
- 4px 단위 시스템 (4, 8, 12, 16, 24, 32, 48, 64px)

**Border Radius**
- Small: 4px
- Medium: 8px
- Large: 12px
- XLarge: 16px

---

## 9. 개발 로드맵

### Phase 1: MVP (4주)
**Week 1-2: 기본 인프라 및 인증**
- 프로젝트 초기 설정
- 데이터베이스 스키마 구현
- 회원가입/로그인 기능
- 권한 관리 시스템

**Week 3-4: 동아리 기본 기능**
- 동아리 CRUD
- 동아리 목록 및 상세 페이지
- 검색 및 필터링
- 마크다운 에디터 통합

### Phase 2: 활동 피드 (3주)
**Week 5-6: 직접 업로드**
- 이미지 업로드 기능
- 활동 피드 CRUD
- 피드 UI/UX 구현

**Week 7: Instagram 연동**
- Instagram Graph API 통합
- OAuth 인증 플로우
- 자동 동기화 스케줄러

### Phase 3: 고도화 (3주)
**Week 8: 관리자 기능**
- 총 관리자 대시보드
- 사용자 관리
- 동아리 관리자 지정

**Week 9: 최적화**
- 성능 최적화 (이미지, 코드 스플리팅)
- SEO 최적화
- 접근성 개선

**Week 10: 테스트 및 배포**
- 통합 테스트
- 사용자 테스트
- 프로덕션 배포

---

## 10. 성공 지표 (KPI)

### 10.1 사용자 지표
- DAU (Daily Active Users): 목표 100명 (첫 달)
- MAU (Monthly Active Users): 목표 500명 (첫 달)
- 회원가입 전환율: 방문자 대비 5% 이상

### 10.2 동아리 참여 지표
- 등록 동아리 수: 전체 연합동아리 80% 이상
- 활성 동아리 (월 1회 이상 업데이트): 60% 이상
- 동아리당 평균 게시물 수: 10개 이상

### 10.3 플랫폼 건강도
- 페이지 로딩 시간: 3초 이내 90% 달성
- 에러율: 0.1% 이하
- 시스템 가동률: 99.9% 이상

### 10.4 사용자 만족도
- NPS (Net Promoter Score): 50 이상
- 사용자 리뷰 평점: 4.5/5 이상
- 재방문율: 40% 이상

---

## 11. 리스크 및 대응 방안

### 11.1 기술적 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| Instagram API 제한 및 변경 | 높음 | 중간 | - 직접 업로드를 주 기능으로 유지<br>- API 변경 모니터링<br>- Fallback 메커니즘 구현 |
| 대용량 이미지 트래픽 | 중간 | 높음 | - CDN 사용<br>- 이미지 최적화 (WebP, 리사이징)<br>- Lazy Loading |
| 데이터베이스 성능 저하 | 중간 | 낮음 | - 인덱싱 전략<br>- 쿼리 최적화<br>- Redis 캐싱 |

### 11.2 운영 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| 동아리 참여 저조 | 높음 | 중간 | - 총동연과 협력하여 동아리 참여 독려<br>- 인센티브 프로그램 (우수 동아리 선정 등) |
| 부적절한 콘텐츠 게시 | 중간 | 낮음 | - 신고 시스템<br>- 관리자 모니터링<br>- 콘텐츠 가이드라인 제공 |
| 개인정보 유출 | 높음 | 낮음 | - 보안 강화 (HTTPS, 암호화)<br>- 정기 보안 감사<br>- 개인정보 처리방침 준수 |

### 11.3 비즈니스 리스크

| 리스크 | 영향도 | 확률 | 대응 방안 |
|--------|--------|------|-----------|
| 예산 부족 | 중간 | 중간 | - 오픈소스 활용<br>- 무료 티어 서비스 우선 사용<br>- 단계적 기능 구현 |
| 유지보수 인력 부족 | 중간 | 중간 | - 코드 문서화 철저히<br>- 모듈화된 아키텍처<br>- 외부 개발자도 쉽게 참여할 수 있는 구조 |

---

## 12. 향후 확장 가능성

### 12.1 단기 확장 (6개월 내)
- 동아리 지원 시스템 (온라인 가입 신청)
- 이벤트 캘린더 (동아리별 행사 일정)
- 알림 기능 (모집 시작, 새 게시물 등)
- 좋아요 및 댓글 기능

### 12.2 중기 확장 (1년 내)
- 동아리 간 협업 프로젝트 게시판
- 동아리원 후기 및 평점 시스템
- 학생회 공지사항 연동
- 모바일 앱 개발 (React Native)

### 12.3 장기 비전
- AI 기반 동아리 추천 시스템
- 동아리 활동 포트폴리오 생성
- 다른 대학과의 네트워크 (연합 동아리 교류)
- 동아리 크라우드펀딩 플랫폼

---

## 13. 부록

### 13.1 용어 정의

- **총동아리연합회**: 홍익대학교 내 모든 연합동아리를 관리하는 학생 자치 기구
- **연합동아리**: 총동아리연합회에 등록되어 활동하는 공식 동아리
- **마크다운**: 가벼운 마크업 언어로, 텍스트 기반으로 서식을 지정
- **Instagram Graph API**: Facebook이 제공하는 Instagram 데이터 접근 API

### 13.2 참고 자료

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [React Documentation](https://react.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### 13.3 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2026-01-10 | 초안 작성 | Claude |

---

**문서 종료**

이 문서는 Hongik Community 프로젝트의 전체적인 요구사항과 설계를 포함하고 있습니다. 개발 진행 중 세부 사항은 지속적으로 업데이트될 예정입니다.