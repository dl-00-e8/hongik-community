# 이메일 템플릿 설정 가이드

## 📧 이메일 템플릿 변경 방법

### 1. Supabase Dashboard 접속

프로젝트 설정으로 이동:
```
https://supabase.com/dashboard/project/pxfcdivcciizrdntqokh/auth/templates
```

또는:
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `hongik-community-project`
3. 좌측 메뉴에서 **Authentication** → **Email Templates** 클릭

### 2. 템플릿 선택 및 편집

#### 회원가입 확인 이메일 (Confirm signup)
1. **Confirm signup** 템플릿 선택
2. 기본 제공된 HTML을 삭제
3. `fe/docs/email-templates/confirm-signup.html` 파일의 내용을 복사하여 붙여넣기
4. **Save** 버튼 클릭

### 3. 사용 가능한 변수

Supabase에서 제공하는 템플릿 변수:

| 변수 | 설명 | 예시 |
|------|------|------|
| `{{ .ConfirmationURL }}` | 이메일 확인 URL | `https://yourapp.com/auth/confirm?token=...` |
| `{{ .Token }}` | 인증 토큰 | `pkce_a1b2c3...` |
| `{{ .TokenHash }}` | 토큰 해시 | `abc123...` |
| `{{ .Email }}` | 사용자 이메일 | `user@g.hongik.ac.kr` |
| `{{ .SiteURL }}` | 앱 URL | `https://yourapp.com` |
| `{{ .ConfirmationSentAt }}` | 발송 시간 | `2026-01-26 10:30:00` |

### 4. 커스터마이징 팁

#### 색상 변경
현재 템플릿은 보라색 그라데이션을 사용합니다:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

홍익대학교 브랜드 컬러로 변경하려면:
```css
/* 예시: 빨간색 계열 */
background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);

/* 예시: 파란색 계열 */
background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
```

#### 로고 변경
현재는 SVG 아이콘을 사용하지만, 실제 로고 이미지로 변경 가능:
```html
<!-- SVG 아이콘 부분을 이미지로 교체 -->
<img src="https://your-cdn.com/logo.png"
     alt="홍익대학교 총동아리연합회"
     style="width: 80px; height: auto; display: block; margin: 0 auto 20px;" />
```

#### 링크 URL 변경
Footer의 링크들을 실제 URL로 변경:
```html
<a href="https://hongik-clubs.com">웹사이트</a>
<a href="https://hongik-clubs.com/about">소개</a>
<a href="mailto:club@hongik.ac.kr">문의하기</a>
```

## 📝 다른 이메일 템플릿

### 비밀번호 재설정 (Reset password)

비슷한 방식으로 비밀번호 재설정 템플릿도 커스터마이징할 수 있습니다.

주요 변수:
- `{{ .ConfirmationURL }}` - 비밀번호 재설정 URL
- `{{ .Email }}` - 사용자 이메일

### 이메일 변경 확인 (Change email)

이메일 주소 변경 시 발송되는 확인 이메일입니다.

주요 변수:
- `{{ .ConfirmationURL }}` - 이메일 변경 확인 URL
- `{{ .Email }}` - 새 이메일 주소
- `{{ .NewEmail }}` - 새로운 이메일 (변경 후)

### 매직 링크 (Magic Link)

비밀번호 없이 로그인할 수 있는 매직 링크 이메일입니다.

주요 변수:
- `{{ .ConfirmationURL }}` - 매직 링크 URL
- `{{ .Email }}` - 사용자 이메일

## 🧪 테스트 방법

### 1. 로컬에서 테스트
1. 새로운 테스트 계정으로 회원가입
2. 이메일 확인
3. 디자인 및 링크 작동 확인

### 2. 이메일 미리보기
- Supabase Dashboard의 Email Templates 페이지에서 **Preview** 버튼으로 미리보기 가능
- 실제 변수는 샘플 데이터로 표시됨

### 3. 다양한 이메일 클라이언트에서 테스트
- Gmail (웹, 모바일)
- Outlook (웹, 데스크톱)
- Apple Mail (iOS, macOS)
- 네이버 메일
- 다음 메일

## ⚠️ 주의사항

### 1. 이메일 HTML 제약사항
- 모든 CSS는 인라인 스타일로 작성해야 함
- `<style>` 태그는 일부 클라이언트에서 지원되지 않음
- JavaScript는 사용 불가
- 외부 CSS 파일 불가

### 2. 이미지 사용 시
- HTTPS URL 사용 필수
- 작은 파일 크기 권장 (이메일 로딩 속도)
- alt 텍스트 필수 (이미지가 차단될 경우 대비)

### 3. 반응형 디자인
- 모바일에서도 잘 보이도록 설계
- 테이블 레이아웃 사용 (이메일 클라이언트 호환성)
- 최대 너비 600px 권장

### 4. 링크 유효기간
- 이메일 확인 링크는 기본 24시간 유효
- Supabase Dashboard → Authentication → Settings에서 변경 가능

## 🔧 고급 설정

### SMTP 설정 (선택사항)
기본적으로 Supabase의 이메일 서비스를 사용하지만, 커스텀 SMTP 서버를 설정할 수도 있습니다:

1. Supabase Dashboard → Settings → Auth → SMTP Settings
2. 커스텀 SMTP 서버 정보 입력:
   - Host
   - Port
   - Username
   - Password
   - Sender Email
   - Sender Name

### 이메일 발송 제한
- 무료 플랜: 1시간당 3개 이메일 (같은 사용자)
- Pro 플랜: 더 높은 제한

## 📚 참고 자료

- [Supabase Auth Email Templates 공식 문서](https://supabase.com/docs/guides/auth/auth-email-templates)
- [이메일 HTML 베스트 프랙티스](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Can I Email - CSS 지원 확인](https://www.caniemail.com/)

## 💡 도움이 필요하신가요?

문제가 발생하거나 추가 커스터마이징이 필요한 경우:
1. 프로젝트 GitHub Issues에 문의
2. Supabase Discord 커뮤니티 참여
3. 개발팀에 직접 연락
