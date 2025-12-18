import { supabase } from '../lib/supabaseClient';
import { PlantPhoto, PhotoMetadata } from '../types/plant';

// Photo upload configuration
const PHOTO_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxDimensions: { width: 2048, height: 2048 },
  thumbnailSize: { width: 300, height: 300 },
  compressionQuality: 0.8,
  bucketName: 'plant-photos'
};

// User quota configuration
const USER_QUOTA = {
  maxPhotosPerPlant: 20,
  maxTotalPhotos: 200,
  maxStorageBytes: 100 * 1024 * 1024 // 100MB per user
};

export class PhotoService {
  /**
   * Validates uploaded file before processing
   */
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > PHOTO_CONFIG.maxFileSize) {
      errors.push(`File size must be less than ${PHOTO_CONFIG.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file format
    if (!PHOTO_CONFIG.allowedFormats.includes(file.type)) {
      errors.push(`File format must be one of: ${PHOTO_CONFIG.allowedFormats.join(', ')}`);
    }

    // Basic file name validation
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File must have a valid name');
    }

    // Check for potentially malicious file extensions
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      errors.push('File type not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks user quota before upload
   */
  static async checkUserQuota(userId: string, plantId: string): Promise<{ canUpload: boolean; reason?: string }> {
    try {
      // Check total photos for user
      const { count: totalPhotos } = await (supabase.from('plant_photos') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (totalPhotos && totalPhotos >= USER_QUOTA.maxTotalPhotos) {
        return {
          canUpload: false,
          reason: `Maximum ${USER_QUOTA.maxTotalPhotos} photos allowed per user`
        };
      }

      // Check photos for specific plant
      const { count: plantPhotos } = await (supabase.from('plant_photos') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('plant_id', plantId);

      if (plantPhotos && plantPhotos >= USER_QUOTA.maxPhotosPerPlant) {
        return {
          canUpload: false,
          reason: `Maximum ${USER_QUOTA.maxPhotosPerPlant} photos allowed per plant`
        };
      }

      return { canUpload: true };
    } catch (error) {
      console.error('Error checking user quota:', error);
      return { canUpload: false, reason: 'Unable to verify storage quota' };
    }
  }

  /**
   * Generates optimized image from file
   */
  static async optimizeImage(file: File): Promise<{
    optimizedFile: File;
    thumbnailFile: File;
    metadata: PhotoMetadata
  }> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate dimensions maintaining aspect ratio
          const { width: maxWidth, height: maxHeight } = PHOTO_CONFIG.maxDimensions;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          // Create optimized image
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((optimizedBlob) => {
            if (!optimizedBlob) {
              reject(new Error('Failed to optimize image'));
              return;
            }

            // Create thumbnail
            const thumbCanvas = document.createElement('canvas');
            const thumbCtx = thumbCanvas.getContext('2d');
            const { width: thumbWidth, height: thumbHeight } = PHOTO_CONFIG.thumbnailSize;

            thumbCanvas.width = thumbWidth;
            thumbCanvas.height = thumbHeight;

            // Calculate thumbnail dimensions maintaining aspect ratio
            const thumbRatio = Math.min(thumbWidth / width, thumbHeight / height);
            const finalThumbWidth = width * thumbRatio;
            const finalThumbHeight = height * thumbRatio;
            const offsetX = (thumbWidth - finalThumbWidth) / 2;
            const offsetY = (thumbHeight - finalThumbHeight) / 2;

            thumbCtx?.drawImage(img, offsetX, offsetY, finalThumbWidth, finalThumbHeight);

            thumbCanvas.toBlob((thumbnailBlob) => {
              if (!thumbnailBlob) {
                reject(new Error('Failed to create thumbnail'));
                return;
              }

              const optimizedFile = new File([optimizedBlob], file.name, {
                type: file.type,
                lastModified: file.lastModified
              });

              const thumbnailFile = new File([thumbnailBlob], `thumb_${file.name}`, {
                type: file.type,
                lastModified: file.lastModified
              });

              const metadata: PhotoMetadata = {
                size: optimizedFile.size,
                dimensions: { width: Math.round(width), height: Math.round(height) },
                format: file.type,
                captureDate: file.lastModified ? new Date(file.lastModified).toISOString() : undefined
              };

              resolve({ optimizedFile, thumbnailFile, metadata });
            }, file.type, PHOTO_CONFIG.compressionQuality);
          }, file.type, PHOTO_CONFIG.compressionQuality);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Uploads photo to Supabase storage
   */
  static async uploadPhoto(
    file: File,
    plantId: string,
    userId: string,
    isPrimary: boolean = false
  ): Promise<PlantPhoto> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    // Check quota
    const quotaCheck = await this.checkUserQuota(userId, plantId);
    if (!quotaCheck.canUpload) {
      throw new Error(quotaCheck.reason || 'Upload quota exceeded');
    }

    try {
      // Optimize image and create thumbnail
      const { optimizedFile, thumbnailFile, metadata } = await this.optimizeImage(file);

      // Generate unique file names
      const timestamp = Date.now();
      const fileExtension = optimizedFile.name.split('.').pop();
      const fileName = `${userId}/${plantId}/${timestamp}.${fileExtension}`;
      const thumbnailName = `${userId}/${plantId}/thumb_${timestamp}.${fileExtension}`;

      // Upload main image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(PHOTO_CONFIG.bucketName)
        .upload(fileName, optimizedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Upload thumbnail
      const { error: thumbnailError } = await supabase.storage
        .from(PHOTO_CONFIG.bucketName)
        .upload(thumbnailName, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (thumbnailError) {
        console.warn('Failed to upload thumbnail:', thumbnailError.message);
      }

      // Get public URLs
      const { data: urlData } = supabase.storage
        .from(PHOTO_CONFIG.bucketName)
        .getPublicUrl(fileName);

      const { data: thumbnailUrlData } = supabase.storage
        .from(PHOTO_CONFIG.bucketName)
        .getPublicUrl(thumbnailName);

      // If this is set as primary, unset other primary photos for this plant
      if (isPrimary) {
        await (supabase.from('plant_photos') as any)
          .update({ is_primary: false } as any)
          .eq('plant_id', plantId)
          .eq('user_id', userId);
      }

      // Save photo record to database
      const { data: photoData, error: dbError } = await (supabase.from('plant_photos') as any)
        .insert({
          plant_id: plantId,
          user_id: userId,
          url: urlData.publicUrl,
          thumbnail_url: thumbnailUrlData.publicUrl,
          is_primary: isPrimary,
          metadata
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded files if database insert fails
        await supabase.storage.from(PHOTO_CONFIG.bucketName).remove([fileName]);
        if (!thumbnailError) {
          await supabase.storage.from(PHOTO_CONFIG.bucketName).remove([thumbnailName]);
        }
        throw new Error(`Failed to save photo record: ${dbError.message}`);
      }

      return {
        id: photoData.id,
        plantId: photoData.plant_id,
        userId: photoData.user_id,
        url: photoData.url,
        thumbnailUrl: photoData.thumbnail_url,
        isPrimary: photoData.is_primary,
        metadata: photoData.metadata,
        createdAt: photoData.created_at
      };
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  /**
   * Gets all photos for a plant
   */
  static async getPlantPhotos(plantId: string, userId: string): Promise<PlantPhoto[]> {
    try {
      const { data, error } = await (supabase.from('plant_photos') as any)
        .select('*')
        .eq('plant_id', plantId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch plant photos: ${error.message}`);
      }

      return data.map((photo: any) => ({
        id: photo.id,
        plantId: photo.plant_id,
        userId: photo.user_id,
        url: photo.url,
        thumbnailUrl: photo.thumbnail_url,
        isPrimary: photo.is_primary,
        metadata: photo.metadata,
        createdAt: photo.created_at
      }));
    } catch (error) {
      console.error('Error fetching plant photos:', error);
      throw error;
    }
  }

  /**
   * Gets primary photo for a plant
   */
  static async getPrimaryPhoto(plantId: string, userId: string): Promise<PlantPhoto | null> {
    try {
      const { data, error } = await (supabase.from('plant_photos') as any)
        .select('*')
        .eq('plant_id', plantId)
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No primary photo found
          return null;
        }
        throw new Error(`Failed to fetch primary photo: ${error.message}`);
      }

      return {
        id: data.id,
        plantId: data.plant_id,
        userId: data.user_id,
        url: data.url,
        thumbnailUrl: data.thumbnail_url,
        isPrimary: data.is_primary,
        metadata: data.metadata,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error fetching primary photo:', error);
      throw error;
    }
  }

  /**
   * Sets a photo as primary for a plant
   */
  static async setPrimaryPhoto(photoId: string, plantId: string, userId: string): Promise<void> {
    try {
      // First, unset all primary photos for this plant
      await (supabase.from('plant_photos') as any)
        .update({ is_primary: false })
        .eq('plant_id', plantId)
        .eq('user_id', userId);

      // Then set the specified photo as primary
      const { error } = await (supabase.from('plant_photos') as any)
        .update({ is_primary: true } as any)
        .eq('id', photoId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to set primary photo: ${error.message}`);
      }
    } catch (error) {
      console.error('Error setting primary photo:', error);
      throw error;
    }
  }

  /**
   * Deletes a photo
   */
  static async deletePhoto(photoId: string, userId: string): Promise<void> {
    try {
      // Get photo details first
      const { data: photo, error: fetchError } = await (supabase.from('plant_photos') as any)
        .select('*')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch photo for deletion: ${fetchError.message}`);
      }

      // Extract file paths from URLs
      const urlParts = photo.url.split('/');
      const fileName = urlParts.slice(-3).join('/'); // userId/plantId/filename

      const thumbnailUrlParts = photo.thumbnail_url?.split('/');
      const thumbnailFileName = thumbnailUrlParts ? thumbnailUrlParts.slice(-3).join('/') : null;

      // Delete from database first
      const { error: dbError } = await (supabase.from('plant_photos') as any)
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);

      if (dbError) {
        throw new Error(`Failed to delete photo record: ${dbError.message}`);
      }

      // Delete files from storage
      const filesToDelete = [fileName];
      if (thumbnailFileName) {
        filesToDelete.push(thumbnailFileName);
      }

      const { error: storageError } = await supabase.storage
        .from(PHOTO_CONFIG.bucketName)
        .remove(filesToDelete);

      if (storageError) {
        console.warn('Failed to delete files from storage:', storageError.message);
        // Don't throw here as the database record is already deleted
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  /**
   * Gets user's storage usage statistics
   */
  static async getUserStorageStats(userId: string): Promise<{
    totalPhotos: number;
    totalSizeBytes: number;
    quotaUsagePercent: number;
  }> {
    try {
      const { data, error } = await (supabase.from('plant_photos') as any)
        .select('metadata')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch storage stats: ${error.message}`);
      }

      const totalPhotos = data.length;
      const totalSizeBytes = data.reduce((total: number, photo: any) => {
        const size = photo.metadata?.size || 0;
        return total + size;
      }, 0);

      const quotaUsagePercent = (totalSizeBytes / USER_QUOTA.maxStorageBytes) * 100;

      return {
        totalPhotos,
        totalSizeBytes,
        quotaUsagePercent: Math.round(quotaUsagePercent * 100) / 100
      };
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      throw error;
    }
  }

  /**
   * Cleans up orphaned photos (photos without corresponding plants)
   */
  static async cleanupOrphanedPhotos(userId: string): Promise<number> {
    try {
      // Find photos that don't have corresponding plants
      const { data: orphanedPhotos, error } = await (supabase.from('plant_photos') as any)
        .select('id, url, thumbnail_url')
        .eq('user_id', userId)
        .not('plant_id', 'in', `(SELECT id FROM plants WHERE user_id = '${userId}')`);

      if (error) {
        throw new Error(`Failed to find orphaned photos: ${error.message}`);
      }

      if (!orphanedPhotos || orphanedPhotos.length === 0) {
        return 0;
      }

      // Delete orphaned photos
      for (const photo of orphanedPhotos) {
        try {
          await this.deletePhoto(photo.id, userId);
        } catch (deleteError) {
          console.warn(`Failed to delete orphaned photo ${photo.id}:`, deleteError);
        }
      }

      return orphanedPhotos.length;
    } catch (error) {
      console.error('Error cleaning up orphaned photos:', error);
      throw error;
    }
  }
}