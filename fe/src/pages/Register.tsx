import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { signUpSchema, type SignUpFormData } from '@/lib/schemas/auth.schema';
import { validatePasswordStrength } from '@/lib/utils/validation';
import { Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: undefined,
    },
    mode: 'onChange', // Validate on change for real-time feedback
  });

  // Password strength indicator
  const password = form.watch('password');
  const passwordValidation = password ? validatePasswordStrength(password) : null;

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      await signUp({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        name: data.name,
        role: data.role,
      });

      toast({
        title: '회원가입 성공',
        description: '이메일을 확인하여 인증을 완료해주세요.',
      });

      // 이메일 인증이 필요한 경우 로그인 페이지로 이동
      navigate('/login');
    } catch (error) {
      toast({
        title: '회원가입 실패',
        description: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">회원가입</CardTitle>
            <CardDescription>
              총동아리연합회 계정을 만드세요
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* 이름 필드 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="이름을 입력하세요"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 이메일 필드 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@g.hongik.ac.kr"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        홍익대학교 이메일(@g.hongik.ac.kr 또는 @hongik.ac.kr)만 사용 가능합니다
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 비밀번호 필드 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="비밀번호를 입력하세요"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription className="space-y-1">
                        <div className="text-xs">
                          • 최소 8자 이상
                        </div>
                        <div className="text-xs">
                          • 영문자 + 숫자 포함
                        </div>
                      </FormDescription>
                      <FormMessage />

                      {/* Password Strength Indicator */}
                      {password && passwordValidation && (
                        <div className="mt-2">
                          {passwordValidation.isValid ? (
                            <Alert className={
                              passwordValidation.strength === 'strong'
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : passwordValidation.strength === 'medium'
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                                : 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                            }>
                              <AlertDescription className="flex items-center gap-2 text-xs">
                                {passwordValidation.strength === 'strong' && (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    <span className="text-green-600">강력한 비밀번호</span>
                                  </>
                                )}
                                {passwordValidation.strength === 'medium' && (
                                  <>
                                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                                    <span className="text-yellow-600">보통 비밀번호</span>
                                  </>
                                )}
                                {passwordValidation.strength === 'weak' && (
                                  <>
                                    <AlertCircle className="h-3 w-3 text-orange-600" />
                                    <span className="text-orange-600">약한 비밀번호</span>
                                  </>
                                )}
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Alert variant="destructive">
                              <AlertDescription className="flex items-center gap-2 text-xs">
                                <XCircle className="h-3 w-3" />
                                <span>{passwordValidation.message}</span>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* 비밀번호 확인 필드 */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="비밀번호를 다시 입력하세요"
                            {...field}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 역할 선택 필드 */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>역할</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="역할을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">일반 사용자</SelectItem>
                          <SelectItem value="club_admin">동아리 관리자</SelectItem>
                          <SelectItem value="admin">총 관리자</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        동아리 관리자 및 총 관리자는 승인이 필요합니다
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  이미 계정이 있으신가요?{' '}
                  <Link to="/login" className="text-accent hover:underline">
                    로그인
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
