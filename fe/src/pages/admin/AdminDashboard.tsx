import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Building2, UserPlus, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalClubs: number;
  pendingRequests: number;
  totalActivities: number;
  adminUsers: number;
  clubAdmins: number;
  regularUsers: number;
}

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Fetch all stats in parallel
      const [
        { count: totalUsers },
        { count: totalClubs },
        { count: pendingRequests },
        { count: totalActivities },
        { count: adminUsers },
        { count: clubAdmins },
        { count: regularUsers },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('clubs').select('*', { count: 'exact', head: true }),
        supabase
          .from('club_admin_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('club_activities').select('*', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin'),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'club_admin'),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user'),
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalClubs: totalClubs || 0,
        pendingRequests: pendingRequests || 0,
        totalActivities: totalActivities || 0,
        adminUsers: adminUsers || 0,
        clubAdmins: clubAdmins || 0,
        regularUsers: regularUsers || 0,
      } as DashboardStats;
    },
  });

  const { data: recentClubs, isLoading: clubsLoading } = useQuery({
    queryKey: ['recent-clubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, created_at, president')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['recent-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
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
      <div className="container py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">관리자 대시보드</h1>
            <p className="text-muted-foreground mt-2">
              홍익대학교 총동아리연합회 관리 시스템
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/admin/clubs/new">
                <Building2 className="mr-2 h-4 w-4" />
                동아리 개설
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/requests">
                <UserPlus className="mr-2 h-4 w-4" />
                신청 승인
                {stats && stats.pendingRequests > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                    {stats.pendingRequests}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                관리자 {stats?.adminUsers} · 동아리 관리자 {stats?.clubAdmins} · 일반{' '}
                {stats?.regularUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 동아리</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClubs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                등록된 동아리 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 중인 신청</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingRequests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                승인 대기 중인 관리자 신청
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 활동</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalActivities}</div>
              <p className="text-xs text-muted-foreground mt-1">
                등록된 활동 게시물 수
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Clubs */}
          <Card>
            <CardHeader>
              <CardTitle>최근 개설 동아리</CardTitle>
              <CardDescription>
                최근에 개설된 동아리 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clubsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentClubs && recentClubs.length > 0 ? (
                <div className="space-y-4">
                  {recentClubs.map((club) => (
                    <div
                      key={club.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <Link
                          to={`/clubs/${club.id}`}
                          className="font-medium hover:underline"
                        >
                          {club.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          회장: {club.president}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(club.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  개설된 동아리가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>최근 가입 사용자</CardTitle>
              <CardDescription>
                최근에 가입한 사용자 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">
                          {user.role === 'admin' && '총관리자'}
                          {user.role === 'club_admin' && '동아리 관리자'}
                          {user.role === 'user' && '일반 사용자'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  가입한 사용자가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
