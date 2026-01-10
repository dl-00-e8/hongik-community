import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { Club } from '@/data/mockData';

interface ClubCardProps {
  club: Club;
}

const ClubCard = ({ club }: ClubCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-accent/50">
      {/* Cover Image or Gradient */}
      <div className="relative h-32 hero-gradient">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-30">
            {club.category === '학술' && '📚'}
            {club.category === '예술' && '🎨'}
            {club.category === '음악' && '🎵'}
            {club.category === '스포츠' && '⚽'}
            {club.category === '봉사' && '💝'}
          </span>
        </div>
        {club.isRecruiting && (
          <Badge className="absolute top-3 right-3 bg-[hsl(var(--badge-recruitment))] text-[hsl(var(--badge-recruitment-foreground))]">
            모집중
          </Badge>
        )}
      </div>

      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge variant="secondary" className="mb-2">
              {club.category}
            </Badge>
            <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
              {club.name}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {club.shortDescription}
        </p>

        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {club.memberCount && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{club.memberCount}명</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{club.clubRoom}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{club.regularSchedule}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="ghost" className="w-full group/btn">
          <Link to={`/clubs/${club.id}`} className="flex items-center justify-center gap-2">
            자세히 보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClubCard;
