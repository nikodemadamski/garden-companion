'use client';

import React, { useState, useEffect } from 'react';
import { PhotoService } from '../../services/photoService';
import { PlantPhoto } from '../../types/plant';
import { formatFileSize } from '../../utils/imageUtils';

interface PhotoGalleryProps {
  plantId: string;
  userId: string;
  photos: PlantPhoto[];
  onPhotosChange: (photos: PlantPhoto[]) => void;
  onError: (error: string) => void;
  className?: string;
}

interface PhotoModalData {
  photo: PlantPhoto;
  index: number;
}

export default function PhotoGallery({
  plantId,
  userId,
  photos,
  onPhotosChange,
  onError,
  className = ''
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoModalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetPrimary = async (photoId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await PhotoService.setPrimaryPhoto(photoId, plantId, userId);

      // Update local state
      const updatedPhotos = photos.map(photo => ({
        ...photo,
        isPrimary: photo.id === photoId
      }));

      onPhotosChange(updatedPhotos);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to set primary photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (isLoading) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this photo? This action cannot be undone.');
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      await PhotoService.deletePhoto(photoId, userId);

      // Update local state
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      onPhotosChange(updatedPhotos);

      // Close modal if deleted photo was selected
      if (selectedPhoto && selectedPhoto.photo.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to delete photo');
    } finally {
      setIsLoading(false);
    }
  };

  const openPhotoModal = (photo: PlantPhoto, index: number) => {
    setSelectedPhoto({ photo, index });
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;

    const currentIndex = selectedPhoto.index;
    let newIndex: number;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedPhoto({
      photo: photos[newIndex],
      index: newIndex
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedPhoto) return;

    switch (e.key) {
      case 'Escape':
        closePhotoModal();
        break;
      case 'ArrowLeft':
        navigatePhoto('prev');
        break;
      case 'ArrowRight':
        navigatePhoto('next');
        break;
    }
  };

  useEffect(() => {
    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (photos.length === 0) {
    return (
      <div className={`photo-gallery-empty ${className}`} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
        <div style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '1.1rem' }}>No photos yet</div>
        <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Upload some photos to see your plant's progress!</div>
      </div>
    );
  }

  return (
    <div className={`photo-gallery ${className}`}>
      {/* Photo Grid */}
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="photo-item"
            onClick={() => openPhotoModal(photo, index)}
          >
            {/* Photo */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={`Plant photo ${index + 1}`}
              loading="lazy"
            />

            {/* Primary Badge */}
            {photo.isPrimary && (
              <div style={{
                position: 'absolute', top: '0.5rem', left: '0.5rem',
                backgroundColor: 'var(--color-primary)', color: 'white',
                fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px',
                borderRadius: '8px', zIndex: 2
              }}>
                PRIMARY
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              display: 'flex', gap: '0.25rem', zIndex: 2
            }}>
              {!photo.isPrimary && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetPrimary(photo.id);
                  }}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'white', color: 'var(--color-primary)',
                    width: '24px', height: '24px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', boxShadow: 'var(--shadow-soft)'
                  }}
                  title="Set as primary"
                >
                  ⭐
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
                disabled={isLoading}
                style={{
                  backgroundColor: 'white', color: 'var(--color-danger)',
                  width: '24px', height: '24px', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', boxShadow: 'var(--shadow-soft)'
                }}
                title="Delete photo"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal (Lightbox) */}
      {selectedPhoto && (
        <div
          onClick={closePhotoModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closePhotoModal}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              color: 'white', fontSize: '1.5rem', background: 'none', border: 'none'
            }}
          >
            ✕
          </button>

          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
                style={{
                  position: 'absolute', left: '1.5rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'white',
                  fontSize: '3rem', background: 'none', border: 'none'
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
                style={{
                  position: 'absolute', right: '1.5rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'white',
                  fontSize: '3rem', background: 'none', border: 'none'
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Photo Container */}
          <div
            style={{ maxWidth: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.photo.url}
              alt={`Plant photo ${selectedPhoto.index + 1}`}
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            />

            {/* Photo Info */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.25rem' }}>
                Photo {selectedPhoto.index + 1} of {photos.length}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {formatDate(selectedPhoto.photo.createdAt)}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                {!selectedPhoto.photo.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(selectedPhoto.photo.id)}
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                  >
                    Set as Primary
                  </button>
                )}
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.photo.id)}
                  disabled={isLoading}
                  className="btn"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}