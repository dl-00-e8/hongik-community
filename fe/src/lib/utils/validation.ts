/**
 * 이메일 도메인 검증 유틸리티
 */

/**
 * 허용된 홍익대학교 이메일 도메인 목록
 */
export const ALLOWED_EMAIL_DOMAINS = ['g.hongik.ac.kr', 'hongik.ac.kr'] as const;

/**
 * 홍익대학교 이메일인지 검증
 * @param email - 검증할 이메일 주소
 * @returns 홍익대 이메일이면 true, 아니면 false
 */
export const isHongikEmail = (email: string): boolean => {
  if (!email || !email.includes('@')) {
    return false;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? ALLOWED_EMAIL_DOMAINS.includes(domain as typeof ALLOWED_EMAIL_DOMAINS[number]) : false;
};

/**
 * 이메일 도메인 추출
 * @param email - 이메일 주소
 * @returns 도메인 부분 (없으면 null)
 */
export const getEmailDomain = (email: string): string | null => {
  if (!email || !email.includes('@')) {
    return null;
  }

  return email.split('@')[1]?.toLowerCase() || null;
};

/**
 * 비밀번호 강도 검증
 * @param password - 검증할 비밀번호
 * @returns 검증 결과 { isValid, message }
 */
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: '비밀번호는 최소 8자 이상이어야 합니다.',
    };
  }

  // 추가 비밀번호 정책을 여기에 추가할 수 있습니다
  // 예: 대문자, 소문자, 숫자, 특수문자 포함 등

  return { isValid: true };
};
