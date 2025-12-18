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
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            📷 {plantName} Photos
          </h2>

          {/* Storage Stats */}
          {storageStats && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', minWidth: '150px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span>Storage:</span>
                <span style={{
                  fontWeight: 700,
                  color: storageStats.quotaUsagePercent >= 90 ? 'var(--color-danger)' :
                    storageStats.quotaUsagePercent >= 75 ? 'var(--color-warning)' : 'var(--color-success)'
                }}>
                  {formatStorageUsage(storageStats.totalSizeBytes)} / 100 MB
                </span>
              </div>
              <div className="progress-bar" style={{ width: '100%' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(storageStats.quotaUsagePercent, 100)}%`,
                    backgroundColor: storageStats.quotaUsagePercent >= 90 ? 'var(--color-danger)' :
                      storageStats.quotaUsagePercent >= 75 ? 'var(--color-warning)' : 'var(--color-primary)'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: '0.25rem', backgroundColor: '#F1F5F9',
          padding: '0.25rem', borderRadius: '12px'
        }}>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'gallery' ? 'white' : 'transparent',
              color: activeTab === 'gallery' ? 'var(--color-text)' : 'var(--color-text-light)',
              boxShadow: activeTab === 'gallery' ? 'var(--shadow-soft)' : 'none'
            }}
          >
            Gallery ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'upload' ? 'white' : 'transparent',
              color: activeTab === 'upload' ? 'var(--color-text)' : 'var(--color-text-light)',
              boxShadow: activeTab === 'upload' ? 'var(--shadow-soft)' : 'none'
            }}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '1rem', padding: '0.75rem 1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          borderRadius: '12px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: 600 }}>{error}</span>
          </div>
          <button
            onClick={clearError}
            style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Storage Warning */}
      {storageStats && storageStats.quotaUsagePercent >= 90 && (
        <div style={{
          marginBottom: '1rem', padding: '0.75rem 1rem',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.1)',
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <span style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 600 }}>
            Storage almost full! ({storageStats.quotaUsagePercent.toFixed(1)}%)
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ minHeight: '300px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="animate-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ color: 'var(--color-text-light)', fontWeight: 600 }}>Loading photos...</div>
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
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('upload')}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              Add More Photos
            </button>
            <button
              onClick={loadPhotos}
              className="btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', backgroundColor: 'white' }}
            >
              Refresh
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
                className="btn"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--color-danger)', backgroundColor: 'white' }}
              >
                Cleanup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}