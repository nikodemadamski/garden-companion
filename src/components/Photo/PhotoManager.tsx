'use client';

import React, { useState, useEffect } from 'react';
import PhotoUploader from './PhotoUploader';
import PhotoGallery from './PhotoGallery';
import { PhotoService } from '../../services/photoService';
import { PlantPhoto } from '../../types/plant';

interface PhotoManagerProps {
  plantId: string;
  userId: string;
  plantName?: string;
  className?: string;
}

export default function PhotoManager({
  plantId,
  userId,
  plantName = 'Plant',
  className = ''
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState<{
    totalPhotos: number;
    totalSizeBytes: number;
    quotaUsagePercent: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');

  // Load photos on component mount
  useEffect(() => {
    loadPhotos();
    loadStorageStats();
  }, [plantId, userId]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const plantPhotos = await PhotoService.getPlantPhotos(plantId, userId);
      setPhotos(plantPhotos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      console.error('Error loading photos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await PhotoService.getUserStorageStats(userId);
      setStorageStats(stats);
    } catch (err) {
      console.error('Error loading storage stats:', err);
    }
  };

  const handleUploadSuccess = (newPhoto: PlantPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
    loadStorageStats(); // Refresh storage stats
    
    // Switch to gallery tab to show the uploaded photo
    if (activeTab === 'upload') {
      setActiveTab('gallery');
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePhotosChange = (updatedPhotos: PlantPhoto[]) => {
    setPhotos(updatedPhotos);
    loadStorageStats(); // Refresh storage stats after changes
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const formatStorageUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStorageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`photo-manager ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            📷 {plantName} Photos
          </h2>
          
          {/* Storage Stats */}
          {storageStats && (
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Storage:</span>
                <span className={getStorageColor(storageStats.quotaUsagePercent)}>
                  {formatStorageUsage(storageStats.totalSizeBytes)} / 100 MB
                </span>
                <span className="text-gray-400">
                  ({storageStats.quotaUsagePercent.toFixed(1)}%)
                </span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    storageStats.quotaUsagePercent >= 90 
                      ? 'bg-red-500' 
                      : storageStats.quotaUsagePercent >= 75 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(storageStats.quotaUsagePercent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Gallery ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload Photos
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Storage Warning */}
      {storageStats && storageStats.quotaUsagePercent >= 90 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-yellow-800 text-sm">
              Storage almost full! You're using {storageStats.quotaUsagePercent.toFixed(1)}% of your quota.
              Consider deleting some photos to free up space.
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🔄</div>
              <div className="text-gray-600">Loading photos...</div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'gallery' && (
              <PhotoGallery
                plantId={plantId}
                userId={userId}
                photos={photos}
                onPhotosChange={handlePhotosChange}
                onError={handleError}
              />
            )}
            
            {activeTab === 'upload' && (
              <PhotoUploader
                plantId={plantId}
                userId={userId}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                disabled={storageStats ? storageStats.quotaUsagePercent >= 100 : false}
              />
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      {photos.length > 0 && activeTab === 'gallery' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Add More Photos
            </button>
            <button
              onClick={loadPhotos}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Refresh Gallery
            </button>
            {photos.length > 10 && (
              <button
                onClick={() => {
                  const confirmCleanup = window.confirm(
                    'This will help identify and remove any orphaned photos. Continue?'
                  );
                  if (confirmCleanup) {
                    PhotoService.cleanupOrphanedPhotos(userId)
                      .then((count) => {
                        if (count > 0) {
                          alert(`Cleaned up ${count} orphaned photos.`);
                          loadPhotos();
                        } else {
                          alert('No orphaned photos found.');
                        }
                      })
                      .catch((err) => {
                        handleError(`Cleanup failed: ${err.message}`);
                      });
                  }
                }}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
              >
                Cleanup Photos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State for Upload Tab */}
      {activeTab === 'upload' && photos.length === 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📸 Getting Started</h3>
          <p className="text-sm text-blue-700">
            Upload your first photo to start tracking your {plantName.toLowerCase()}'s progress! 
            Photos help you monitor growth, identify issues, and celebrate milestones.
          </p>
        </div>
      )}
    </div>
  );
}