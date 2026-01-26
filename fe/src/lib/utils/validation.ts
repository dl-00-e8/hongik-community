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
 * @returns 검증 결과 { isValid, message, strength }
 */
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  // 최소 길이 체크
  if (password.length < 8) {
    return {
      isValid: false,
      message: '비밀번호는 최소 8자 이상이어야 합니다.',
      strength: 'weak',
    };
  }

  // 최대 길이 체크
  if (password.length > 72) {
    return {
      isValid: false,
      message: '비밀번호는 72자를 초과할 수 없습니다.',
      strength: 'weak',
    };
  }

  let strength = 0;
  const checks = {
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // 강도 계산
  if (checks.hasLowerCase) strength++;
  if (checks.hasUpperCase) strength++;
  if (checks.hasNumber) strength++;
  if (checks.hasSpecialChar) strength++;

  // 길이에 따른 추가 점수
  if (password.length >= 12) strength++;

  // 최소 요구사항: 영문자 + 숫자 조합
  if (!checks.hasLowerCase && !checks.hasUpperCase) {
    return {
      isValid: false,
      message: '비밀번호에 영문자가 포함되어야 합니다.',
      strength: 'weak',
    };
  }

  if (!checks.hasNumber) {
    return {
      isValid: false,
      message: '비밀번호에 숫자가 포함되어야 합니다.',
      strength: 'weak',
    };
  }

  // 강도 판정
  let strengthLevel: 'weak' | 'medium' | 'strong';
  if (strength >= 4) {
    strengthLevel = 'strong';
  } else if (strength >= 3) {
    strengthLevel = 'medium';
  } else {
    strengthLevel = 'weak';
  }

  return {
    isValid: true,
    strength: strengthLevel,
  };
};

/**
 * 비밀번호 확인 검증
 * @param password - 비밀번호
 * @param confirmPassword - 확인 비밀번호
 * @returns 일치 여부
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { isValid: boolean; message?: string } => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: '비밀번호가 일치하지 않습니다.',
    };
  }

  return { isValid: true };
};

/**
 * 이름 검증
 * @param name - 검증할 이름
 * @returns 검증 결과
 */
export const validateName = (
  name: string
): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      message: '이름을 입력해주세요.',
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      message: '이름은 최소 2자 이상이어야 합니다.',
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      message: '이름은 50자를 초과할 수 없습니다.',
    };
  }

  // 특수문자 제한 (공백, 한글, 영문만 허용)
  const validNamePattern = /^[a-zA-Z가-힣\s]+$/;
  if (!validNamePattern.test(name)) {
    return {
      isValid: false,
      message: '이름은 한글, 영문, 공백만 사용 가능합니다.',
    };
  }

  return { isValid: true };
};
