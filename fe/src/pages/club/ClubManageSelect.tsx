import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useManagedClubs } from '@/hooks/useClubAdmins';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClubManageSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: clubs, isLoading } = useManagedClubs(user?.id);

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!clubs || clubs.length === 0) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>관리 권한 없음</CardTitle>
            <CardDescription>
              현재 관리할 수 있는 동아리가 없습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              동아리 관리자 권한이 필요합니다. 관리자에게 문의해주세요.
            </p>
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
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">동아리 관리</h1>
            <p className="text-muted-foreground mt-1">
              관리할 동아리를 선택해주세요
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clubs.map((club) => (
          <Card
            key={club.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate(`/club/manage/${club.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="shrink-0">
                  {club.logo_url ? (
                    <img
                      src={club.logo_url}
                      alt={club.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {club.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {club.short_description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>회장: {club.president}</span>
                    {club.is_recruiting && (
                      <span className="text-green-600 font-medium">모집 중</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubs.length === 1 && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          1개의 동아리를 관리하고 있습니다
        </p>
      )}
      {clubs.length > 1 && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          {clubs.length}개의 동아리를 관리하고 있습니다
        </p>
      )}
    </div>
  );
}