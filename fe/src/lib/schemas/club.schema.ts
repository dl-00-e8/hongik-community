import { z } from 'zod';

// Basic info update schema
export const updateClubBasicInfoSchema = z.object({
  name: z.string().min(2, '동아리 이름은 2자 이상이어야 합니다'),
  category_id: z.string().uuid('카테고리를 선택해주세요'),
  short_description: z
    .string()
    .min(10, '간단 소개는 10자 이상이어야 합니다')
    .max(100, '간단 소개는 100자 이하여야 합니다'),
  description: z.string().min(50, '상세 설명은 50자 이상이어야 합니다'),
  president: z.string().min(2, '회장 이름은 2자 이상이어야 합니다'),
  contact: z.string().min(5, '연락처를 입력해주세요'),
  club_room: z.string().optional(),
  instagram_handle: z.string().optional(),
  regular_schedule: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
});

export type UpdateClubBasicInfoInput = z.infer<typeof updateClubBasicInfoSchema>;

// Recruitment management schema
export const updateRecruitmentSchema = z
  .object({
    is_recruiting: z.boolean(),
    recruitment_start: z.string().optional(),
    recruitment_end: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.is_recruiting && (!data.recruitment_start || !data.recruitment_end)) {
        return false;
      }
      return true;
    },
    {
      message: '모집 중일 때는 시작일과 종료일이 필요합니다',
      path: ['recruitment_start'],
    }
  );

export type UpdateRecruitmentInput = z.infer<typeof updateRecruitmentSchema>;

// Activity upload schema
export const createActivitySchema = z.object({
  image_url: z.string().url('이미지를 업로드해주세요'),
  caption: z.string().max(500, '캡션은 500자 이하여야 합니다').optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;