import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ActivityFeed from '@/components/clubs/ActivityFeed';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRecentActivities } from '@/hooks/useActivities';

const RecentActivities = () => {
  // Fetch the most recent 6 activities from database
  const { data: recentActivities, isLoading, error } = useRecentActivities(6);

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">최근 활동</h2>
            <p className="text-muted-foreground">
              동아리들의 생생한 활동을 확인하세요
            </p>
          </div>
          <Button variant="ghost" asChild className="self-start md:self-auto">
            <Link to="/clubs" className="flex items-center gap-2">
              더 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            활동을 불러오는 데 실패했습니다.
          </div>
        ) : (
          <ActivityFeed activities={recentActivities || []} />
        )}
      </div>
    </section>
  );
};

export default RecentActivities;
