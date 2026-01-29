import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClub, useUpdateClub } from '@/hooks/useClubs';
import { useClubActivities, useCreateActivity, useDeleteActivity } from '@/hooks/useActivities';
import { useCategories } from '@/hooks/useCategories';
import { useCanManageClub } from '@/hooks/useClubAdmins';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/club/ImageUpload';
import { ActivityItem } from '@/components/club/ActivityItem';
import { useToast } from '@/hooks/use-toast';
import {
  updateClubBasicInfoSchema,
  updateRecruitmentSchema,
  createActivitySchema,
  type UpdateClubBasicInfoInput,
  type UpdateRecruitmentInput,
  type CreateActivityInput,
} from '@/lib/schemas/club.schema';

export default function ClubManage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clubId } = useParams<{ clubId: string }>();
  const [activeTab, setActiveTab] = useState('basic');

  // Check permission to manage this club
  const { data: canManage, isLoading: permissionLoading } = useCanManageClub(user?.id, clubId);
  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: activities, isLoading: activitiesLoading } = useClubActivities(clubId);
  const { data: categories } = useCategories();
  const updateClub = useUpdateClub();
  const createActivity = useCreateActivity();
  const deleteActivity = useDeleteActivity();

  // Show loading while checking permissions
  if (permissionLoading || clubLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user has permission to manage this club
  if (!canManage) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>이 동아리를 관리할 권한이 없습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/club/manage')}>동아리 목록으로</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>동아리를 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>홈으로</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/club/manage')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">동아리 관리</h1>
            <p className="text-muted-foreground mt-1">{club.name} 정보를 관리합니다</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">기본 정보</TabsTrigger>
          <TabsTrigger value="recruitment">모집 관리</TabsTrigger>
          <TabsTrigger value="activities">활동 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoTab club={club} categories={categories || []} updateClub={updateClub} />
        </TabsContent>

        <TabsContent value="recruitment">
          <RecruitmentTab club={club} updateClub={updateClub} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesTab
            clubId={club.id}
            activities={activities || []}
            isLoading={activitiesLoading}
            createActivity={createActivity}
            deleteActivity={deleteActivity}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Tab 1: Basic Info
function BasicInfoTab({ club, categories, updateClub }: any) {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState(club.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(club.cover_image_url || '');

  const form = useForm<UpdateClubBasicInfoInput>({
    resolver: zodResolver(updateClubBasicInfoSchema),
    defaultValues: {
      name: club.name,
      category_id: club.category_id,
      short_description: club.short_description,
      description: club.description,
      president: club.president,
      contact: club.contact,
      club_room: club.club_room || '',
      instagram_handle: club.instagram_handle || '',
      regular_schedule: club.regular_schedule || '',
      logo_url: club.logo_url || '',
      cover_image_url: club.cover_image_url || '',
    },
  });

  const onSubmit = async (data: UpdateClubBasicInfoInput) => {
    try {
      await updateClub.mutateAsync({
        id: club.id,
        updates: {
          ...data,
          logo_url: logoUrl || null,
          cover_image_url: coverUrl || null,
        },
      });

      toast({
        title: '저장 완료',
        description: '동아리 정보가 업데이트되었습니다',
      });
    } catch (error) {
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>동아리의 기본 정보를 수정합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Logo Upload */}
            <ImageUpload
              folder="logos"
              currentImageUrl={logoUrl}
              onUploadComplete={(url) => {
                setLogoUrl(url);
                form.setValue('logo_url', url);
              }}
              onUploadError={(error) => {
                form.setError('logo_url', { message: error });
              }}
              aspectRatio="1/1"
              label="로고 이미지"
            />

            {/* Cover Upload */}
            <ImageUpload
              folder="covers"
              currentImageUrl={coverUrl}
              onUploadComplete={(url) => {
                setCoverUrl(url);
                form.setValue('cover_image_url', url);
              }}
              onUploadError={(error) => {
                form.setError('cover_image_url', { message: error });
              }}
              aspectRatio="16/9"
              label="커버 이미지"
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>동아리 이름</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>간단 소개</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormDescription>10-100자</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 설명</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} />
                  </FormControl>
                  <FormDescription>마크다운 지원</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="president"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>회장</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="club_room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>동아리방</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="예: A동 301호" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regular_schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>정기 모임</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="예: 매주 수요일 18:00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram 계정</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="@ 없이 입력" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateClub.isPending} className="w-full">
              {updateClub.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Tab 2: Recruitment
function RecruitmentTab({ club, updateClub }: any) {
  const { toast } = useToast();

  const form = useForm<UpdateRecruitmentInput>({
    resolver: zodResolver(updateRecruitmentSchema),
    defaultValues: {
      is_recruiting: club.is_recruiting || false,
      recruitment_start: club.recruitment_start || '',
      recruitment_end: club.recruitment_end || '',
    },
  });

  const isRecruiting = form.watch('is_recruiting');

  const onSubmit = async (data: UpdateRecruitmentInput) => {
    try {
      await updateClub.mutateAsync({
        id: club.id,
        updates: {
          is_recruiting: data.is_recruiting,
          recruitment_start: data.is_recruiting ? data.recruitment_start : null,
          recruitment_end: data.is_recruiting ? data.recruitment_end : null,
        },
      });

      toast({
        title: '저장 완료',
        description: '모집 정보가 업데이트되었습니다',
      });
    } catch (error) {
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>모집 관리</CardTitle>
        <CardDescription>동아리 모집 상태를 관리합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="is_recruiting"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">모집 중</FormLabel>
                    <FormDescription>
                      동아리 신입 모집 여부를 설정합니다
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecruiting && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recruitment_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모집 시작일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recruitment_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모집 종료일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button type="submit" disabled={updateClub.isPending} className="w-full">
              {updateClub.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Tab 3: Activities
function ActivitiesTab({
  clubId,
  activities,
  isLoading,
  createActivity,
  deleteActivity,
}: any) {
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const form = useForm<CreateActivityInput>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      image_url: '',
      caption: '',
    },
  });

  const onSubmit = async (data: CreateActivityInput) => {
    try {
      await createActivity.mutateAsync({
        club_id: clubId,
        image_url: data.image_url,
        caption: data.caption || null,
        is_instagram: false,
      });

      toast({
        title: '업로드 완료',
        description: '활동이 추가되었습니다',
      });

      // Reset form
      form.reset();
      setUploadedImageUrl('');
    } catch (error) {
      toast({
        title: '업로드 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (activityId: string) => {
    try {
      await deleteActivity.mutateAsync(activityId);

      toast({
        title: '삭제 완료',
        description: '활동이 삭제되었습니다',
      });
    } catch (error) {
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>활동 업로드</CardTitle>
          <CardDescription>새로운 활동 이미지를 업로드합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ImageUpload
                folder="activities"
                currentImageUrl={uploadedImageUrl}
                onUploadComplete={(url) => {
                  setUploadedImageUrl(url);
                  form.setValue('image_url', url);
                }}
                onUploadError={(error) => {
                  form.setError('image_url', { message: error });
                }}
                aspectRatio="1/1"
                label="활동 이미지"
              />

              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>캡션 (선택)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="활동에 대한 설명..." />
                    </FormControl>
                    <FormDescription>최대 500자</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createActivity.isPending || !uploadedImageUrl}
                className="w-full"
              >
                {createActivity.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  '활동 추가'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>활동 목록</CardTitle>
          <CardDescription>업로드된 활동들을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              업로드된 활동이 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity: any) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  canDelete
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}