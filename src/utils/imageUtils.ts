/**
 * Image processing utilities for photo management
 * Handles image optimization, validation, and metadata extraction
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: string;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
  crop?: boolean;
}

/**
 * Validates image file type and size
 */
export function validateImageFile(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Allowed MIME types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }
  
  // Check file name
  if (!file.name || file.name.trim().length === 0) {
    errors.push('File must have a valid name');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculates new dimensions maintaining aspect ratio
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): ImageDimensions {
  const aspectRatio = originalWidth / originalHeight;
  
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  // Scale down if needed
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }
  
  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  };
}

/**
 * Optimizes image file for web use
 */
export function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.8,
    format = file.type
  } = options;
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        const dimensions = calculateAspectRatioDimensions(
          img.naturalWidth,
          img.naturalHeight,
          maxWidth,
          maxHeight
        );
        
        // Set canvas size
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        
        // Draw optimized image
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'));
              return;
            }
            
            const optimizedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now()
            });
            
            resolve(optimizedFile);
          },
          format,
          quality
        );
        
        URL.revokeObjectURL(img.src);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for optimization'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Creates thumbnail from image file
 */
export function createThumbnail(
  file: File,
  options: ThumbnailOptions
): Promise<File> {
  const { width, height, quality = 0.8, crop = true } = options;
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      try {
        canvas.width = width;
        canvas.height = height;
        
        if (crop) {
          // Crop to fill thumbnail dimensions
          const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
          const scaledWidth = img.naturalWidth * scale;
          const scaledHeight = img.naturalHeight * scale;
          const offsetX = (width - scaledWidth) / 2;
          const offsetY = (height - scaledHeight) / 2;
          
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        } else {
          // Fit within thumbnail dimensions
          const dimensions = calculateAspectRatioDimensions(
            img.naturalWidth,
            img.naturalHeight,
            width,
            height
          );
          
          const offsetX = (width - dimensions.width) / 2;
          const offsetY = (height - dimensions.height) / 2;
          
          // Fill background with white
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          ctx.drawImage(img, offsetX, offsetY, dimensions.width, dimensions.height);
        }
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create thumbnail'));
              return;
            }
            
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: file.type,
              lastModified: Date.now()
            });
            
            resolve(thumbnailFile);
          },
          file.type,
          quality
        );
        
        URL.revokeObjectURL(img.src);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for thumbnail creation'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Extracts EXIF data from image file
 */
export function extractImageMetadata(file: File): Promise<{
  size: number;
  type: string;
  lastModified: number;
  dimensions?: ImageDimensions;
}> {
  return new Promise(async (resolve, reject) => {
    try {
      const dimensions = await getImageDimensions(file);
      
      resolve({
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dimensions
      });
    } catch (error) {
      // Return basic metadata even if dimensions fail
      resolve({
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    }
  });
}

/**
 * Converts file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Checks if browser supports required image processing features
 */
export function checkImageProcessingSupport(): {
  canvas: boolean;
  fileReader: boolean;
  blob: boolean;
} {
  return {
    canvas: !!document.createElement('canvas').getContext,
    fileReader: !!window.FileReader,
    blob: !!window.Blob
  };
}

/**
 * Generates a unique filename for uploaded images
 */
export function generateUniqueFilename(originalName: string, userId: string, plantId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  return `${userId}/${plantId}/${timestamp}_${randomSuffix}.${extension}`;
}

/**
 * Validates image dimensions
 */
export function validateImageDimensions(
  dimensions: ImageDimensions,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 4096,
  maxHeight = 4096
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (dimensions.width < minWidth) {
    errors.push(`Image width must be at least ${minWidth}px`);
  }
  
  if (dimensions.height < minHeight) {
    errors.push(`Image height must be at least ${minHeight}px`);
  }
  
  if (dimensions.width > maxWidth) {
    errors.push(`Image width must not exceed ${maxWidth}px`);
  }
  
  if (dimensions.height > maxHeight) {
    errors.push(`Image height must not exceed ${maxHeight}px`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a data URL from file for preview
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create image preview'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for preview'));
    };
    
    reader.readAsDataURL(file);
  });
}