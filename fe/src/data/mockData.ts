// Mock data for the club platform - will be replaced with database later

export interface Club {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string; // Markdown content
  president: string;
  contact: string;
  clubRoom: string;
  recruitmentStart: string;
  recruitmentEnd: string;
  regularSchedule: string;
  instagramHandle?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  memberCount?: number;
  isRecruiting: boolean;
}

export interface Activity {
  id: string;
  clubId: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  isInstagram: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'club_admin' | 'user';
  clubId?: string; // For club admins
}

export const mockClubs: Club[] = [
  {
    id: '1',
    name: '코딩클럽',
    category: '학술',
    shortDescription: '함께 성장하는 개발자 커뮤니티',
    description: `# 코딩클럽 소개

우리는 **함께 성장하는 개발자 커뮤니티**입니다.

## 활동 내용

- 주간 스터디 세션
- 해커톤 참가
- 프로젝트 협업
- 기술 세미나 개최

## 지원 자격

프로그래밍에 관심이 있는 누구나 환영합니다!

> "혼자 가면 빠르고, 함께 가면 멀리 간다"

### 연락처
문의사항은 언제든지 연락주세요.`,
    president: '김개발',
    contact: 'coding@university.ac.kr',
    clubRoom: '학생회관 301호',
    recruitmentStart: '2024-03-01',
    recruitmentEnd: '2024-03-31',
    regularSchedule: '매주 수요일 18:00',
    instagramHandle: 'coding_club_official',
    memberCount: 45,
    isRecruiting: true,
  },
  {
    id: '2',
    name: '사진동아리 셔터',
    category: '예술',
    shortDescription: '순간을 영원히 담는 사람들',
    description: `# 사진동아리 셔터

## 우리의 철학

사진은 순간을 영원히 담는 예술입니다.

## 주요 활동

1. 월간 출사
2. 사진 전시회 개최
3. 포토샵/라이트룸 강좌
4. 인물/풍경/스트릿 사진 스터디

## 장비 지원

동아리 보유 장비를 대여할 수 있습니다.`,
    president: '이사진',
    contact: 'shutter@university.ac.kr',
    clubRoom: '예술관 205호',
    recruitmentStart: '2024-03-01',
    recruitmentEnd: '2024-03-15',
    regularSchedule: '매주 토요일 14:00',
    instagramHandle: 'shutter_photo',
    memberCount: 32,
    isRecruiting: true,
  },
  {
    id: '3',
    name: '밴드 사운드웨이브',
    category: '음악',
    shortDescription: '캠퍼스를 울리는 우리의 음악',
    description: `# 밴드 사운드웨이브

록, 팝, 재즈 등 다양한 장르를 연주하는 밴드 동아리입니다.

## 활동

- 정기 공연 (학기당 2회)
- 축제 공연
- 외부 공연 참가
- 합주 연습

## 모집 파트

- 보컬
- 기타
- 베이스
- 드럼
- 키보드`,
    president: '박음악',
    contact: 'soundwave@university.ac.kr',
    clubRoom: '음악관 B102호',
    recruitmentStart: '2024-02-15',
    recruitmentEnd: '2024-02-28',
    regularSchedule: '매주 화, 목 19:00',
    memberCount: 28,
    isRecruiting: false,
  },
  {
    id: '4',
    name: '토론동아리 디베이트',
    category: '학술',
    shortDescription: '논리로 세상을 바꾸다',
    description: `# 토론동아리 디베이트

## 소개

비판적 사고와 논리적 표현력을 기르는 토론 동아리입니다.

## 활동 내용

- 주간 토론 세션
- 전국 토론 대회 참가
- 시사 이슈 분석
- 발표 스킬 향상 워크샵`,
    president: '최논리',
    contact: 'debate@university.ac.kr',
    clubRoom: '인문관 401호',
    recruitmentStart: '2024-03-01',
    recruitmentEnd: '2024-03-20',
    regularSchedule: '매주 금요일 17:00',
    memberCount: 22,
    isRecruiting: true,
  },
  {
    id: '5',
    name: '봉사동아리 나눔',
    category: '봉사',
    shortDescription: '나눔으로 더 나은 세상을',
    description: `# 봉사동아리 나눔

## 우리의 가치

작은 나눔이 세상을 바꿉니다.

## 정기 봉사

- 지역 아동센터 멘토링
- 환경 정화 활동
- 양로원 방문
- 유기동물 보호소 봉사

## 특별 프로젝트

해외 봉사 활동 (연 1회)`,
    president: '정나눔',
    contact: 'sharing@university.ac.kr',
    clubRoom: '학생회관 105호',
    recruitmentStart: '2024-03-01',
    recruitmentEnd: '2024-03-31',
    regularSchedule: '매주 토요일 10:00',
    instagramHandle: 'nanum_volunteer',
    memberCount: 56,
    isRecruiting: true,
  },
  {
    id: '6',
    name: '축구동아리 FC 유니버시티',
    category: '스포츠',
    shortDescription: '열정을 가진 축구인들의 모임',
    description: `# FC 유니버시티

## 소개

축구를 사랑하는 사람들이 모인 동아리입니다.

## 활동

- 주 2회 정기 훈련
- 교내 리그 참가
- 타 대학 친선 경기
- 전국 대학 축구 대회 출전

## 모집 포지션

모든 포지션 환영!`,
    president: '손축구',
    contact: 'fc.university@university.ac.kr',
    clubRoom: '체육관 201호',
    recruitmentStart: '2024-02-20',
    recruitmentEnd: '2024-03-10',
    regularSchedule: '매주 월, 수 18:00',
    memberCount: 40,
    isRecruiting: false,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    clubId: '1',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    caption: '주간 코딩 스터디 현장 📚',
    createdAt: '2024-03-15',
    isInstagram: true,
  },
  {
    id: '2',
    clubId: '1',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
    caption: '2024 해커톤 참가! 🏆',
    createdAt: '2024-03-10',
    isInstagram: false,
  },
  {
    id: '3',
    clubId: '2',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
    caption: '봄 출사 - 벚꽃 사진 🌸',
    createdAt: '2024-03-12',
    isInstagram: true,
  },
  {
    id: '4',
    clubId: '3',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    caption: '축제 공연 무대! 🎸',
    createdAt: '2024-03-08',
    isInstagram: true,
  },
  {
    id: '5',
    clubId: '5',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
    caption: '환경 정화 봉사활동 🌱',
    createdAt: '2024-03-14',
    isInstagram: false,
  },
];

export const categories = [
  { id: 'all', name: '전체', icon: '🎯' },
  { id: '학술', name: '학술', icon: '📚' },
  { id: '예술', name: '예술', icon: '🎨' },
  { id: '음악', name: '음악', icon: '🎵' },
  { id: '스포츠', name: '스포츠', icon: '⚽' },
  { id: '봉사', name: '봉사', icon: '💝' },
];
