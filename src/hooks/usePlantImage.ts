import { useState, useEffect, useCallback } from 'react';
import { PhotoService } from '../services/photoService';
import { FallbackImageService } from '../services/fallbackImageService';
import { PlantPhoto, PlantCategory } from '../types/plant';

interface UsePlantImageOptions {
  plantId?: string;
  userId?: string;
  species?: string;
  category?: PlantCategory;
  plantName?: string;
  autoLoad?: boolean;
}

interface UsePlantImageReturn {
  primaryPhoto: PlantPhoto | null;
  fallbackImageUrl: string;
  bestImageUrl: string;
  isLoading: boolean;
  error: string | null;
  refreshPhoto: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing plant images with fallback support
 */
export function usePlantImage({
  plantId,
  userId,
  species,
  category,
  plantName,
  autoLoad = true
}: UsePlantImageOptions): UsePlantImageReturn {
  const [primaryPhoto, setPrimaryPhoto] = useState<PlantPhoto | null>(null);
  const [fallbackImageUrl, setFallbackImageUrl] = useState<string>('');
  const [bestImageUrl, setBestImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load fallback image
  useEffect(() => {
    const loadFallbackImage = async () => {
      try {
        const fallbackUrl = await FallbackImageService.getBestAvailableImage({
          species,
          category,
          plantName
        });
        setFallbackImageUrl(fallbackUrl);
      } catch (err) {
        console.warn('Error loading fallback image:', err);
        setFallbackImageUrl(FallbackImageService.getFallbackImage({ category, species, plantName }));
      }
    };

    loadFallbackImage();
  }, [species, category, plantName]);

  // Load primary photo
  const loadPrimaryPhoto = useCallback(async () => {
    if (!plantId || !userId) {
      setPrimaryPhoto(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const photo = await PhotoService.getPrimaryPhoto(plantId, userId);
      setPrimaryPhoto(photo);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load photo';
      setError(errorMessage);
      setPrimaryPhoto(null);
    } finally {
      setIsLoading(false);
    }
  }, [plantId, userId]);

  // Auto-load on mount and when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadPrimaryPhoto();
    }
  }, [autoLoad, loadPrimaryPhoto]);

  // Update best image URL when primary photo or fallback changes
  useEffect(() => {
    const updateBestImageUrl = async () => {
      try {
        const bestUrl = await FallbackImageService.getBestAvailableImage({
          userPhotoUrl: primaryPhoto?.url,
          species,
          category,
          plantName
        });
        setBestImageUrl(bestUrl);
      } catch (err) {
        console.warn('Error updating best image URL:', err);
        setBestImageUrl(fallbackImageUrl);
      }
    };

    updateBestImageUrl();
  }, [primaryPhoto, fallbackImageUrl, species, category, plantName]);

  const refreshPhoto = useCallback(async () => {
    await loadPrimaryPhoto();
  }, [loadPrimaryPhoto]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    primaryPhoto,
    fallbackImageUrl,
    bestImageUrl,
    isLoading,
    error,
    refreshPhoto,
    clearError
  };
}

/**
 * Hook for managing multiple plant photos
 */
export function usePlantPhotos(plantId: string, userId: string) {
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    if (!plantId || !userId) {
      setPhotos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const plantPhotos = await PhotoService.getPlantPhotos(plantId, userId);
      setPhotos(plantPhotos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load photos';
      setError(errorMessage);
      setPhotos([]);
    } finally {
      setIsLoading(false);
    }
  }, [plantId, userId]);

  const addPhoto = useCallback((newPhoto: PlantPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
  }, []);

  const updatePhoto = useCallback((photoId: string, updates: Partial<PlantPhoto>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  }, []);

  const setPrimaryPhoto = useCallback(async (photoId: string) => {
    if (!plantId || !userId) return;

    try {
      await PhotoService.setPrimaryPhoto(photoId, plantId, userId);
      
      // Update local state
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        isPrimary: photo.id === photoId
      })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set primary photo';
      setError(errorMessage);
      throw err;
    }
  }, [plantId, userId]);

  const deletePhoto = useCallback(async (photoId: string) => {
    if (!userId) return;

    try {
      await PhotoService.deletePhoto(photoId, userId);
      removePhoto(photoId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(errorMessage);
      throw err;
    }
  }, [userId, removePhoto]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    isLoading,
    error,
    loadPhotos,
    addPhoto,
    updatePhoto,
    removePhoto,
    setPrimaryPhoto,
    deletePhoto,
    clearError
  };
}

/**
 * Hook for managing storage statistics
 */
export function useStorageStats(userId: string) {
  const [stats, setStats] = useState<{
    totalPhotos: number;
    totalSizeBytes: number;
    quotaUsagePercent: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!userId) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const storageStats = await PhotoService.getUserStorageStats(userId);
      setStats(storageStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load storage stats';
      setError(errorMessage);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    error,
    loadStats,
    clearError
  };
}