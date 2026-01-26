import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useCategories } from '@/hooks/useCategories';
import { Loader2 } from 'lucide-react';

const clubSchema = z.object({
  name: z.string().min(2, '동아리 이름은 최소 2자 이상이어야 합니다.'),
  category_id: z.string().uuid('카테고리를 선택해주세요.'),
  short_description: z.string().min(10, '간단 소개는 최소 10자 이상이어야 합니다.').max(100, '간단 소개는 100자를 초과할 수 없습니다.'),
  description: z.string().min(50, '상세 설명은 최소 50자 이상이어야 합니다.'),
  president: z.string().min(2, '회장 이름은 최소 2자 이상이어야 합니다.'),
  contact: z.string().min(5, '연락처를 입력해주세요.'),
  club_room: z.string().optional(),
  instagram_handle: z.string().optional(),
  regular_schedule: z.string().optional(),
});

type ClubFormData = z.infer<typeof clubSchema>;

const CreateClub = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const form = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: '',
      category_id: '',
      short_description: '',
      description: '',
      president: '',
      contact: '',
      club_room: '',
      instagram_handle: '',
      regular_schedule: '',
    },
  });

  const onSubmit = async (data: ClubFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.from('clubs').insert({
        name: data.name,
        category_id: data.category_id,
        short_description: data.short_description,
        description: data.description,
        president: data.president,
        contact: data.contact,
        club_room: data.club_room || null,
        instagram_handle: data.instagram_handle || null,
        regular_schedule: data.regular_schedule || null,
        is_recruiting: false,
        member_count: 0,
      });

      if (error) throw error;

      toast({
        title: '동아리 개설 완료',
        description: `${data.name} 동아리가 성공적으로 개설되었습니다.`,
      });

      navigate('/clubs');
    } catch (error) {
      console.error('Club creation error:', error);
      toast({
        title: '동아리 개설 실패',
        description: error instanceof Error ? error.message : '동아리 개설에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">새 동아리 개설</CardTitle>
            <CardDescription>
              새로운 동아리를 개설하고 기본 정보를 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 동아리 이름 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>동아리 이름 *</FormLabel>
                      <FormControl>
                        <Input placeholder="예: 멋쟁이사자처럼" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 카테고리 */}
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리 *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="카테고리를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 간단 소개 */}
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>간단 소개 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="동아리를 한 문장으로 소개해주세요"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        동아리 목록에 표시될 짧은 소개글입니다. (최대 100자)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 상세 설명 */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상세 설명 *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="동아리에 대한 상세한 설명을 작성해주세요. 마크다운 문법을 사용할 수 있습니다."
                          className="min-h-[200px]"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        마크다운 문법을 사용하여 동아리를 자세히 소개할 수 있습니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 회장 이름 */}
                  <FormField
                    control={form.control}
                    name="president"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>회장 이름 *</FormLabel>
                        <FormControl>
                          <Input placeholder="홍길동" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 연락처 */}
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연락처 *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="010-1234-5678 또는 이메일"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 동아리방 */}
                  <FormField
                    control={form.control}
                    name="club_room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>동아리방</FormLabel>
                        <FormControl>
                          <Input placeholder="예: 학생회관 3층 301호" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Instagram */}
                  <FormField
                    control={form.control}
                    name="instagram_handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram 계정</FormLabel>
                        <FormControl>
                          <Input placeholder="@clubname" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 정기 모임 */}
                <FormField
                  control={form.control}
                  name="regular_schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>정기 모임 일정</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 매주 수요일 오후 6시"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        개설 중...
                      </>
                    ) : (
                      '동아리 개설'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/clubs')}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateClub;
