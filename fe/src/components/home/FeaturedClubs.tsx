import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ClubCard from '@/components/clubs/ClubCard';
import { ArrowRight } from 'lucide-react';
import { ClubsService } from '@/services/clubs.service';

const FeaturedClubs = () => {
  // Fetch recruiting clubs
  const { data: clubsData, isLoading } = useQuery({
    queryKey: ['clubs', 'recruiting'],
    queryFn: async () => {
      const result = await ClubsService.getRecruitingClubs();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  const featuredClubs = clubsData?.slice(0, 4) || [];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">모집 중인 동아리</h2>
            <p className="text-muted-foreground">
              지금 바로 지원할 수 있는 동아리들을 확인하세요
            </p>
          </div>
          <Button variant="ghost" asChild className="self-start md:self-auto">
            <Link to="/clubs" className="flex items-center gap-2">
              전체 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : featuredClubs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            현재 모집 중인 동아리가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedClubs;
