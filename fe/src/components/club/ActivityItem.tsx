import { Trash2, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { ClubActivity } from '@/types/database.types';

interface ActivityItemProps {
  activity: ClubActivity;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function ActivityItem({ activity, canDelete = false, onDelete }: ActivityItemProps) {
  const isInstagram = activity.is_instagram;

  return (
    <div className="group relative">
      <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
        <img
          src={activity.image_url}
          alt={activity.caption || '동아리 활동'}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          {activity.caption && (
            <p className="text-white text-sm line-clamp-3 mb-2">{activity.caption}</p>
          )}

          <div className="flex items-center justify-between">
            <Badge variant={isInstagram ? 'default' : 'secondary'} className="gap-1">
              {isInstagram && <Instagram className="h-3 w-3" />}
              {isInstagram ? 'Instagram' : '직접 등록'}
            </Badge>

            {canDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>활동 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 활동을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(activity.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Date badge */}
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="bg-black/50 text-white border-0">
          {new Date(activity.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Badge>
      </div>
    </div>
  );
}