/**
 * Authentication Form Validation Schemas
 *
 * Zod schemas for authentication forms (sign up, sign in, etc.)
 */

import { z } from 'zod';
import { isHongikEmail, ALLOWED_EMAIL_DOMAINS } from '@/lib/utils/validation';

/**
 * 회원가입 폼 스키마
 */
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 최소 2자 이상이어야 합니다.')
      .max(50, '이름은 50자를 초과할 수 없습니다.')
      .regex(
        /^[a-zA-Z가-힣\s]+$/,
        '이름은 한글, 영문, 공백만 사용 가능합니다.'
      ),
    email: z
      .string()
      .email('올바른 이메일 형식이 아닙니다.')
      .refine(isHongikEmail, {
        message: `홍익대학교 이메일(${ALLOWED_EMAIL_DOMAINS.map((d) => '@' + d).join(' 또는 ')})만 사용 가능합니다.`,
      }),
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(72, '비밀번호는 72자를 초과할 수 없습니다.')
      .regex(/[a-zA-Z]/, '비밀번호에 영문자가 포함되어야 합니다.')
      .regex(/\d/, '비밀번호에 숫자가 포함되어야 합니다.'),
    confirmPassword: z.string(),
    role: z.enum(['user', 'club_admin', 'admin'], {
      required_error: '역할을 선택해주세요.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

/**
 * 로그인 폼 스키마
 */
export const signInSchema = z.object({
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다.')
    .refine(isHongikEmail, {
      message: `홍익대학교 이메일(${ALLOWED_EMAIL_DOMAINS.map((d) => '@' + d).join(' 또는 ')})만 사용 가능합니다.`,
    }),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

/**
 * 비밀번호 재설정 요청 폼 스키마
 */
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다.')
    .refine(isHongikEmail, {
      message: `홍익대학교 이메일(${ALLOWED_EMAIL_DOMAINS.map((d) => '@' + d).join(' 또는 ')})만 사용 가능합니다.`,
    }),
});

/**
 * 비밀번호 재설정 폼 스키마
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(72, '비밀번호는 72자를 초과할 수 없습니다.')
      .regex(/[a-zA-Z]/, '비밀번호에 영문자가 포함되어야 합니다.')
      .regex(/\d/, '비밀번호에 숫자가 포함되어야 합니다.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

/**
 * 프로필 수정 폼 스키마
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(50, '이름은 50자를 초과할 수 없습니다.')
    .regex(
      /^[a-zA-Z가-힣\s]+$/,
      '이름은 한글, 영문, 공백만 사용 가능합니다.'
    ),
});

// Type inference
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ResetPasswordRequestFormData = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
