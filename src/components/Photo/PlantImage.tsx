'use client';

import React, { useState, useEffect } from 'react';
import FallbackImageProvider from './FallbackImageProvider';
import { PhotoService } from '../../services/photoService';
import { PlantPhoto, PlantCategory } from '../../types/plant';

interface PlantImageProps {
  plantId: string;
  userId: string;
  species?: string;
  category?: PlantCategory;
  plantName?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  showPrimaryOnly?: boolean;
  enableLazyLoading?: boolean;
  onImageLoad?: () => void;
  onImageError?: (error: string) => void;
}

export default function PlantImage({
  plantId,
  userId,
  species,
  category,
  plantName,
  alt,
  className = '',
  width,
  height,
  priority = false,
  showPrimaryOnly = true,
  enableLazyLoading = true,
  onImageLoad,
  onImageError
}: PlantImageProps) {
  const [primaryPhoto, setPrimaryPhoto] = useState<PlantPhoto | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    loadPrimaryPhoto();
  }, [plantId, userId]);

  const loadPrimaryPhoto = async () => {
    if (!plantId || !userId) {
      setIsLoadingPhoto(false);
      return;
    }

    try {
      setIsLoadingPhoto(true);
      setPhotoError(null);

      const photo = await PhotoService.getPrimaryPhoto(plantId, userId);
      setPrimaryPhoto(photo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load photo';
      setPhotoError(errorMessage);
      console.warn('Error loading primary photo:', error);
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleImageLoad = () => {
    onImageLoad?.();
  };

  const handleImageError = (error: string) => {
    onImageError?.(error);
  };

  const getImageAlt = () => {
    if (alt) return alt;
    if (plantName) return `Photo of ${plantName}`;
    if (species) return `Photo of ${species}`;
    return 'Plant photo';
  };

  const getUserPhotoUrl = () => {
    if (isLoadingPhoto) return undefined;
    if (photoError || !primaryPhoto) return undefined;
    
    // Use thumbnail for smaller images, full size for larger ones
    const useFullSize = (width && width > 400) || (height && height > 400);
    return useFullSize ? primaryPhoto.url : (primaryPhoto.thumbnailUrl || primaryPhoto.url);
  };

  return (
    <div className={`plant-image-container ${className}`}>
      {/* Loading State */}
      {isLoadingPhoto && (
        <div 
          className="flex items-center justify-center bg-gray-100 animate-pulse"
          style={{ 
            width: width || '100%', 
            height: height || '200px' 
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-xs text-gray-500">Loading photo...</div>
          </div>
        </div>
      )}

      {/* Image Display */}
      {!isLoadingPhoto && (
        <FallbackImageProvider
          userPhotoUrl={getUserPhotoUrl()}
          species={species}
          category={category}
          plantName={plantName}
          alt={getImageAlt()}
          className={className}
          width={width}
          height={height}
          priority={priority}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Photo Status Indicator */}
      {!isLoadingPhoto && primaryPhoto && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full opacity-75">
          📷 User Photo
        </div>
      )}

      {/* Error State */}
      {photoError && !primaryPhoto && (
        <div className="absolute bottom-2 left-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded opacity-75">
          Using default image
        </div>
      )}
    </div>
  );
}

// Simplified version for cases where you just need a plant image without photo management
export function SimplePlantImage({
  species,
  category,
  plantName,
  alt,
  className = '',
  width,
  height,
  priority = false
}: {
  species?: string;
  category?: PlantCategory;
  plantName?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const getImageAlt = () => {
    if (alt) return alt;
    if (plantName) return `Image of ${plantName}`;
    if (species) return `Image of ${species}`;
    return 'Plant image';
  };

  return (
    <FallbackImageProvider
      species={species}
      category={category}
      plantName={plantName}
      alt={getImageAlt()}
      className={className}
      width={width}
      height={height}
      priority={priority}
    />
  );
}