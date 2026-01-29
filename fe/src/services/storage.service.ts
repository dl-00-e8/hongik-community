import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class StorageService {
  /**
   * Upload an image to Supabase Storage
   * @param file - The file to upload
   * @param folder - The folder to upload to (logos, covers, activities)
   * @returns The public URL of the uploaded image
   */
  static async uploadClubImage(
    file: File,
    folder: 'logos' | 'covers' | 'activities'
  ): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('club-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`업로드 실패: ${uploadError.message}`);
    }

    // Get public URL
    const publicUrl = this.getPublicUrl(fileName);
    return publicUrl;
  }

  /**
   * Delete an image from Supabase Storage
   * @param url - The public URL of the image to delete
   */
  static async deleteClubImage(url: string): Promise<void> {
    // Extract path from URL
    const path = this.extractPathFromUrl(url);
    if (!path) {
      throw new Error('유효하지 않은 이미지 URL입니다');
    }

    const { error } = await supabase.storage
      .from('club-images')
      .remove([path]);

    if (error) {
      throw new Error(`삭제 실패: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file path
   * @param path - The file path in storage
   * @returns The public URL
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from('club-images')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Validate file before upload
   * @param file - The file to validate
   * @throws Error if validation fails
   */
  private static validateFile(file: File): void {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('JPG, PNG, WEBP 파일만 업로드 가능합니다');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('파일 크기는 5MB를 초과할 수 없습니다');
    }
  }

  /**
   * Extract storage path from public URL
   * @param url - The public URL
   * @returns The storage path or null if invalid
   */
  private static extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/club-images\/(.+)$/);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  }
}