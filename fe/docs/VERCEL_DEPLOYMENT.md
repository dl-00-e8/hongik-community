# Vercel 배포 가이드

## 환경 변수 설정

Vercel에서 프로젝트를 배포할 때 다음 환경 변수를 설정해야 합니다.

### 1. Vercel Dashboard 접속

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택: `hongik-community`
3. **Settings** → **Environment Variables** 클릭

### 2. 필수 환경 변수 추가

다음 환경 변수들을 **Production**, **Preview**, **Development** 모두에 추가하세요:

#### Supabase 설정
```
VITE_SUPABASE_URL=https://pxfcdivcciizrdntqokh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4ZmNkaXZjY2lpenJkbnRxb2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTEzNzYsImV4cCI6MjA4MzY4NzM3Nn0.QftmKdxNbsIzIiAK4Zqjrf2DQHMFqD8oiif0DOYtGHY
```

#### 앱 URL 설정
```
VITE_APP_URL=https://hongik-community.vercel.app
```

### 3. 환경별 설정 (선택사항)

필요한 경우 환경별로 다른 값을 설정할 수 있습니다:

**Production:**
```
VITE_APP_URL=https://hongik-community.vercel.app
```

**Preview:**
```
VITE_APP_URL=https://hongik-community-preview.vercel.app
```

**Development:**
```
VITE_APP_URL=http://localhost:8081
```

## Supabase 설정

### 1. Site URL 설정

Supabase에서 배포된 URL을 허용해야 합니다:

1. [Supabase Dashboard](https://supabase.com/dashboard/project/pxfcdivcciizrdntqokh/auth/url-configuration) 접속
2. **Authentication** → **URL Configuration**
3. **Site URL** 설정:
   ```
   https://hongik-community.vercel.app
   ```

### 2. Redirect URLs 설정

허용할 리다이렉트 URL 패턴 추가:

```
https://hongik-community.vercel.app/**
https://hongik-community-*.vercel.app/**
http://localhost:*/**
```

이렇게 하면:
- Production 도메인
- Preview 배포 (자동 생성되는 PR 미리보기)
- 로컬 개발 환경

모두 허용됩니다.

## 배포 후 확인 사항

### 1. 이메일 테스트
1. 회원가입 시도
2. 이메일 확인 링크 클릭
3. `https://hongik-community.vercel.app/`로 리다이렉트 되는지 확인

### 2. 환경 변수 확인
Vercel 배포 로그에서 환경 변수가 올바르게 로드되었는지 확인:
```bash
✓ VITE_SUPABASE_URL loaded
✓ VITE_SUPABASE_ANON_KEY loaded
✓ VITE_APP_URL loaded
```

### 3. 로컬 개발 환경 확인
로컬에서는 `.env` 파일의 설정 사용:
```bash
VITE_APP_URL=http://localhost:8081
```

## 트러블슈팅

### 이메일 리다이렉트가 localhost로 가는 경우

**원인:** Vercel 환경 변수가 설정되지 않음

**해결:**
1. Vercel Dashboard → Settings → Environment Variables
2. `VITE_APP_URL=https://hongik-community.vercel.app` 추가
3. 재배포 (Redeploy)

### "Email link is invalid" 에러

**원인:** Supabase에서 해당 URL을 허용하지 않음

**해결:**
1. Supabase Dashboard → Auth → URL Configuration
2. Redirect URLs에 Vercel 도메인 추가
3. Site URL을 Vercel 도메인으로 변경

### Preview 배포에서 이메일 작동 안 함

**원인:** Preview 배포의 동적 URL이 Supabase에 허용되지 않음

**해결:**
Supabase Redirect URLs에 와일드카드 추가:
```
https://hongik-community-*.vercel.app/**
```

## 자동 배포 설정

Vercel은 Git과 자동으로 연동됩니다:

- **main 브랜치** → Production 배포
- **PR 생성** → Preview 배포 자동 생성
- **커밋 푸시** → 자동 재배포

## 보안 주의사항

### 환경 변수 보안

- ✅ `VITE_SUPABASE_URL` - 공개 가능 (프론트엔드에서 사용)
- ✅ `VITE_SUPABASE_ANON_KEY` - 공개 가능 (RLS로 보호됨)
- ✅ `VITE_APP_URL` - 공개 가능
- ❌ `SUPABASE_SERVICE_ROLE_KEY` - **절대 프론트엔드에 노출 금지**

### RLS (Row Level Security) 확인

모든 테이블에 RLS가 활성화되어 있는지 확인:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 참고 자료

- [Vercel 환경 변수 문서](https://vercel.com/docs/environment-variables)
- [Supabase Auth 설정](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)
- [Vite 환경 변수](https://vitejs.dev/guide/env-and-mode.html)
