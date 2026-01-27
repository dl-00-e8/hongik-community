import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X, Users, Settings, LogOut, Shield, UserPlus, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/clubs', label: '동아리 목록' },
    { path: '/about', label: '소개' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: '로그아웃 완료',
        description: '안전하게 로그아웃되었습니다.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: '로그아웃 실패',
        description: error instanceof Error ? error.message : '로그아웃에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">총동아리연합회</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isActive(item.path)
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? (
            <div className="h-10 w-24 animate-pulse bg-muted rounded-md" />
          ) : user ? (
            // 로그인된 상태
            <>
              {/* User Info & Admin Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user.role === 'admin' && '총관리자'}
                        {user.role === 'club_admin' && '동아리 관리자'}
                        {user.role === 'user' && '일반 사용자'}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  {(user.role === 'admin' || user.role === 'club_admin') && (
                    <>
                      <DropdownMenuSeparator />

                      {user.role === 'admin' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/clubs/new" className="cursor-pointer">
                              <Building2 className="mr-2 h-4 w-4" />
                              동아리 개설
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/requests" className="cursor-pointer">
                              <UserPlus className="mr-2 h-4 w-4" />
                              관리자 신청 승인
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/dashboard" className="cursor-pointer">
                              <Shield className="mr-2 h-4 w-4" />
                              관리자 대시보드
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {user.role === 'club_admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/club/manage" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            동아리 관리
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link to="/register">회원가입</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t mt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role === 'admin' && '총관리자'}
                      {user.role === 'club_admin' && '동아리 관리자'}
                      {user.role === 'user' && '일반 사용자'}
                    </p>
                  </div>

                  {user.role === 'admin' && (
                    <>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/admin/clubs/new" onClick={() => setIsMenuOpen(false)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          동아리 개설
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/admin/requests" onClick={() => setIsMenuOpen(false)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          관리자 신청 승인
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="justify-start">
                        <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                          <Shield className="mr-2 h-4 w-4" />
                          관리자 대시보드
                        </Link>
                      </Button>
                    </>
                  )}

                  {user.role === 'club_admin' && (
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/club/manage" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="mr-2 h-4 w-4" />
                        동아리 관리
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      로그인
                    </Link>
                  </Button>
                  <Button asChild className="justify-start">
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      회원가입
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
