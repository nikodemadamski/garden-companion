'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FallbackImageService } from '../../services/fallbackImageService';
import { PlantCategory } from '../../types/plant';

interface FallbackImageProviderProps {
  userPhotoUrl?: string;
  species?: string;
  category?: PlantCategory;
  plantName?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export default function FallbackImageProvider({
  userPhotoUrl,
  species,
  category,
  plantName,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  onError
}: FallbackImageProviderProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const maxRetries = 3;

  useEffect(() => {
    loadBestImage();
  }, [userPhotoUrl, species, category, plantName]);

  const loadBestImage = async () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);

    try {
      const bestImageUrl = await FallbackImageService.getBestAvailableImage({
        userPhotoUrl,
        species,
        category,
        plantName
      });

      setCurrentImageUrl(bestImageUrl);
    } catch (error) {
      console.error('Error loading best image:', error);
      handleImageError();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    if (retryCount < maxRetries) {
      // Try fallback images in order of preference
      setRetryCount(prev => prev + 1);
      
      setTimeout(() => {
        if (retryCount === 0) {
          // First retry: try database fallback
          FallbackImageService.getFallbackFromDatabase(species, category)
            .then(dbImage => {
              if (dbImage) {
                setCurrentImageUrl(dbImage);
              } else {
                handleImageError();
              }
            })
            .catch(() => handleImageError());
        } else if (retryCount === 1) {
          // Second retry: try category fallback
          const categoryFallback = FallbackImageService.getFallbackImage({
            category,
            species,
            plantName
          });
          setCurrentImageUrl(categoryFallback);
        } else {
          // Final retry: use random fallback
          const randomFallback = FallbackImageService.getRandomFallbackImage();
          setCurrentImageUrl(randomFallback);
        }
      }, 1000 * retryCount); // Exponential backoff
    } else {
      // All retries exhausted
      setIsLoading(false);
      setHasError(true);
      onError?.('Failed to load image after multiple attempts');
    }
  };

  const getImageStyle = () => {
    const style: React.CSSProperties = {};
    
    if (width) style.width = width;
    if (height) style.height = height;
    
    return style;
  };

  const getImageSizes = () => {
    if (width && height) {
      return `${width}px`;
    }
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  };

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={getImageStyle()}
      >
        <div className="text-center">
          <div className="animate-pulse text-2xl mb-2">🌱</div>
          <div className="text-xs text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={getImageStyle()}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🌿</div>
          <div className="text-xs text-gray-500">
            {plantName || species || 'Plant'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentImageUrl}
      alt={alt}
      className={className}
      style={getImageStyle()}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading={priority ? 'eager' : 'lazy'}
      sizes={getImageSizes()}
      decoding="async"
    />
  );
}