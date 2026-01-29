import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorageService } from '@/services/storage.service';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  folder: 'logos' | 'covers' | 'activities';
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  aspectRatio?: string;
  label?: string;
}

export function ImageUpload({
  folder,
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  aspectRatio = '16/9',
  label = '이미지 업로드',
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Storage
      const publicUrl = await StorageService.uploadClubImage(file, folder);

      // Clean up object URL
      URL.revokeObjectURL(objectUrl);

      // Update preview with actual URL
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: '업로드 완료',
        description: '이미지가 성공적으로 업로드되었습니다',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업로드 실패';
      onUploadError(errorMessage);
      setPreviewUrl(currentImageUrl);

      toast({
        title: '업로드 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <div
              className="relative overflow-hidden rounded-lg border"
              style={{ aspectRatio }}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            style={{ aspectRatio }}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">업로드 중...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  클릭하여 이미지 선택
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP (최대 5MB)
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        파일 선택 시 자동으로 업로드됩니다
      </p>
    </div>
  );
}