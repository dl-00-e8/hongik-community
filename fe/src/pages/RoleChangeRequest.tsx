import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { roleChangeService } from '@/services/role-change.service';
import { ClubsService } from '@/services/clubs.service';
import { Loader2, UserCog, Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  requested_role: z.enum(['club_admin', 'admin']),
  club_selection_type: z.enum(['existing', 'new']).optional(),
  club_id: z.string().optional(),
  new_club_name: z.string().optional(),
  new_club_description: z.string().optional(),
  reason: z.string().min(10, '신청 사유는 최소 10자 이상 입력해주세요.').max(500),
}).refine((data) => {
  // club_admin 신청 시 동아리 선택 필수
  if (data.requested_role === 'club_admin') {
    if (!data.club_selection_type) return false;
    if (data.club_selection_type === 'existing' && !data.club_id) return false;
    if (data.club_selection_type === 'new' && (!data.new_club_name || !data.new_club_description)) return false;
  }
  return true;
}, {
  message: '동아리 관리자 신청 시 동아리 선택 또는 새 동아리 정보가 필요합니다.',
});

type FormData = z.infer<typeof formSchema>;

const RoleChangeRequest = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clubs, setClubs] = useState<any[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requested_role: user?.role === 'user' ? 'club_admin' : 'admin',
      reason: '',
    },
  });

  const requestedRole = form.watch('requested_role');
  const clubSelectionType = form.watch('club_selection_type');

  useEffect(() => {
    // 동아리 목록 로드
    const loadClubs = async () => {
      const { data } = await ClubsService.getAllClubs();
      if (data) {
        setClubs(data);
      }
    };
    loadClubs();
  }, []);

  if (authLoading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // 관리자는 역할 변경 신청 불가
  if (user.role === 'admin') {
    return (
      <Layout>
        <div className="container py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              이미 최고 권한을 보유하고 있습니다.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsLoading(true);

    try {
      const requestData: any = {
        from_role: user.role,
        requested_role: data.requested_role,
        reason: data.reason,
      };

      if (data.requested_role === 'club_admin') {
        if (data.club_selection_type === 'existing') {
          requestData.club_id = data.club_id;
        } else if (data.club_selection_type === 'new') {
          requestData.new_club_name = data.new_club_name;
          requestData.new_club_description = data.new_club_description;
        }
      }

      await roleChangeService.createRequest(user.id, requestData);

      toast({
        title: '신청 완료',
        description: '역할 변경 신청이 접수되었습니다. 관리자 검토 후 결과를 알려드립니다.',
      });

      navigate('/');
    } catch (error) {
      console.error('Failed to submit role change request:', error);
      toast({
        title: '신청 실패',
        description: error instanceof Error ? error.message : '신청 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return '일반 사용자';
      case 'club_admin':
        return '동아리 관리자';
      case 'admin':
        return '총관리자';
      default:
        return role;
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="h-6 w-6" />
              <CardTitle>역할 변경 신청</CardTitle>
            </div>
            <CardDescription>
              현재 역할: <span className="font-semibold">{getRoleLabel(user.role)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 신청할 역할 */}
                <FormField
                  control={form.control}
                  name="requested_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>신청할 역할</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={user.role === 'club_admin'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {user.role === 'user' && (
                            <SelectItem value="club_admin">동아리 관리자</SelectItem>
                          )}
                          {user.role === 'club_admin' && (
                            <SelectItem value="admin">총관리자</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {user.role === 'user' && '동아리 관리자로 승급 신청'}
                        {user.role === 'club_admin' && '총관리자로 승급 신청'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 동아리 관리자 신청 시 동아리 선택 */}
                {requestedRole === 'club_admin' && (
                  <>
                    <FormField
                      control={form.control}
                      name="club_selection_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>동아리 선택</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="existing" id="existing" />
                                <label htmlFor="existing" className="cursor-pointer">
                                  기존 동아리 관리
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="new" />
                                <label htmlFor="new" className="cursor-pointer">
                                  새 동아리 개설 요청
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {clubSelectionType === 'existing' && (
                      <FormField
                        control={form.control}
                        name="club_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>관리할 동아리</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="동아리를 선택하세요" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clubs.map((club) => (
                                  <SelectItem key={club.id} value={club.id}>
                                    {club.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              관리하고자 하는 기존 동아리를 선택하세요.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {clubSelectionType === 'new' && (
                      <>
                        <FormField
                          control={form.control}
                          name="new_club_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>새 동아리 이름</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="동아리 이름을 입력하세요"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                개설하고자 하는 동아리의 이름을 입력하세요.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="new_club_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>새 동아리 설명</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="동아리에 대한 간단한 설명을 입력하세요"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                동아리의 활동 내용, 목표 등을 간략히 설명해주세요.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </>
                )}

                {/* 신청 사유 */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>신청 사유</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="역할 변경이 필요한 이유를 상세히 작성해주세요"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        관리자가 검토할 수 있도록 신청 사유를 명확히 작성해주세요. (최소 10자)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 제출 버튼 */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        신청 중...
                      </>
                    ) : (
                      '신청하기'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
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

export default RoleChangeRequest;