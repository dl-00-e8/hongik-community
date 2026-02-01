import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Image } from 'lucide-react';
import type { ActivityWithClub } from '@/types/database.types';

interface ActivityFeedProps {
  activities: ActivityWithClub[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        아직 등록된 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden group">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={activity.image_url}
              alt={activity.caption || '동아리 활동'}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 flex items-center gap-1"
            >
              {activity.is_instagram ? (
                <>
                  <Instagram className="h-3 w-3" />
                  Instagram
                </>
              ) : (
                <>
                  <Image className="h-3 w-3" />
                  직접 등록
                </>
              )}
            </Badge>
          </div>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-primary mb-1">{activity.club_name}</p>
            <p className="text-sm line-clamp-2">{activity.caption || '활동 기록'}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {activity.created_at ? new Date(activity.created_at).toLocaleDateString('ko-KR') : ''}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityFeed;
