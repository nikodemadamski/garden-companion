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
      <div className={`photo-gallery-empty ${className}`}>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-lg font-medium">No photos yet</div>
          <div className="text-sm">Upload some photos to see your plant's progress!</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`photo-gallery ${className}`}>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden aspect-square"
            onClick={() => openPhotoModal(photo, index)}
          >
            {/* Photo */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={`Plant photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Primary Badge */}
            {photo.isPrimary && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Primary
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
              <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="truncate">
                  {formatDate(photo.createdAt)}
                </div>
                {photo.metadata?.size && (
                  <div className="truncate">
                    {formatFileSize(photo.metadata.size)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex space-x-1">
                {!photo.isPrimary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(photo.id);
                    }}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs disabled:opacity-50"
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
                  className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs disabled:opacity-50"
                  title="Delete photo"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closePhotoModal}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
          >
            ✕
          </button>
          
          {/* Navigation Buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => navigatePhoto('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10"
              >
                ‹
              </button>
              <button
                onClick={() => navigatePhoto('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 z-10"
              >
                ›
              </button>
            </>
          )}
          
          {/* Photo Container */}
          <div className="max-w-4xl max-h-full flex flex-col">
            {/* Main Photo */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPhoto.photo.url}
                alt={`Plant photo ${selectedPhoto.index + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Photo Info */}
            <div className="bg-black bg-opacity-50 text-white p-4 mt-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-300">
                    Photo {selectedPhoto.index + 1} of {photos.length}
                  </div>
                  <div className="text-lg font-medium">
                    {formatDate(selectedPhoto.photo.createdAt)}
                  </div>
                  {selectedPhoto.photo.metadata && (
                    <div className="text-sm text-gray-300 mt-1">
                      {selectedPhoto.photo.metadata.dimensions && (
                        <span>
                          {selectedPhoto.photo.metadata.dimensions.width} × {selectedPhoto.photo.metadata.dimensions.height} • 
                        </span>
                      )}
                      <span> {formatFileSize(selectedPhoto.photo.metadata.size)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {selectedPhoto.photo.isPrimary ? (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                      Primary Photo
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimary(selectedPhoto.photo.id)}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    >
                      Set as Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.photo.id)}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm text-center">
            <div>Use arrow keys to navigate • ESC to close</div>
          </div>
        </div>
      )}
    </div>
  );
}