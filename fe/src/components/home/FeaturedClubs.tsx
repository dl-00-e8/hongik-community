import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ClubCard from '@/components/clubs/ClubCard';
import { ArrowRight } from 'lucide-react';
import { mockClubs } from '@/data/mockData';

const FeaturedClubs = () => {
  // Show clubs that are currently recruiting
  const featuredClubs = mockClubs.filter((club) => club.isRecruiting).slice(0, 4);

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedClubs;
