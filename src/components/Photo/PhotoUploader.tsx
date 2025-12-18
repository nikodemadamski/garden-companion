'use client';

import React, { useState, useRef, useCallback } from 'react';
import { PhotoService } from '../../services/photoService';
import { validateImageFile, createImagePreview, formatFileSize } from '../../utils/imageUtils';
import { PlantPhoto } from '../../types/plant';

interface PhotoUploaderProps {
  plantId: string;
  userId: string;
  onUploadSuccess: (photo: PlantPhoto) => void;
  onUploadError: (error: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface UploadProgress {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function PhotoUploader({
  plantId,
  userId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  disabled = false,
  className = ''
}: PhotoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (disabled || isUploading) return;

    const fileArray = Array.from(files).slice(0, maxFiles);
    const newUploads: UploadProgress[] = [];

    // Validate and create previews for all files
    for (const file of fileArray) {
      const validation = validateImageFile(file);

      if (!validation.isValid) {
        onUploadError(`${file.name}: ${validation.errors.join(', ')}`);
        continue;
      }

      try {
        const preview = await createImagePreview(file);
        newUploads.push({
          file,
          preview,
          progress: 0,
          status: 'pending'
        });
      } catch (error) {
        onUploadError(`Failed to create preview for ${file.name}`);
      }
    }

    if (newUploads.length === 0) return;

    setUploads(newUploads);
    setIsUploading(true);

    // Upload files sequentially
    for (let i = 0; i < newUploads.length; i++) {
      const upload = newUploads[i];

      try {
        // Update status to uploading
        setUploads(prev => prev.map((u, index) =>
          index === i ? { ...u, status: 'uploading' as const, progress: 0 } : u
        ));

        // Simulate progress updates (since Supabase doesn't provide upload progress)
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map((u, index) =>
            index === i && u.status === 'uploading'
              ? { ...u, progress: Math.min(u.progress + 10, 90) }
              : u
          ));
        }, 200);

        // Upload the photo
        const photo = await PhotoService.uploadPhoto(
          upload.file,
          plantId,
          userId,
          i === 0 // Set first photo as primary
        );

        clearInterval(progressInterval);

        // Update status to success
        setUploads(prev => prev.map((u, index) =>
          index === i ? { ...u, status: 'success' as const, progress: 100 } : u
        ));

        onUploadSuccess(photo);
      } catch (error) {
        // Update status to error
        setUploads(prev => prev.map((u, index) =>
          index === i ? {
            ...u,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed'
          } : u
        ));

        onUploadError(`Failed to upload ${upload.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsUploading(false);

    // Clear uploads after a delay
    setTimeout(() => {
      setUploads([]);
    }, 3000);
  }, [plantId, userId, onUploadSuccess, onUploadError, maxFiles, disabled, isUploading]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📷';
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'uploading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`photo-uploader ${className}`}>
      {/* Upload Area */}
      <div
        className={`upload-area ${isDragOver ? 'dragging' : ''} ${disabled || isUploading ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          opacity: disabled || isUploading ? 0.5 : 1,
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>📷</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {isUploading ? 'Uploading...' : 'Upload Plant Photos'}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            Drag and drop photos here, or click to select files
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', opacity: 0.7 }}>
            Supports JPEG, PNG, WebP • Max {maxFiles} files • 10MB each
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)' }}>Upload Progress</h4>
          {uploads.map((upload, index) => (
            <div key={index} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '12px'
            }}>
              {/* Preview */}
              <div style={{ flexShrink: 0 }}>
                <img
                  src={upload.preview}
                  alt="Preview"
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>

              {/* File Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{getStatusIcon(upload.status)}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {upload.file.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                  {formatFileSize(upload.file.size)}
                </div>
                {upload.error && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.25rem' }}>
                    {upload.error}
                  </div>
                )}
              </div>

              {/* Progress */}
              <div style={{ flexShrink: 0 }}>
                {upload.status === 'uploading' && (
                  <div style={{ width: '80px' }}>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <div style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '0.25rem', color: 'var(--color-text-light)' }}>
                      {upload.progress}%
                    </div>
                  </div>
                )}
                {upload.status !== 'uploading' && (
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: upload.status === 'success' ? 'var(--color-success)' :
                      upload.status === 'error' ? 'var(--color-danger)' : 'var(--color-text-light)'
                  }}>
                    {upload.status === 'success' && 'Done'}
                    {upload.status === 'error' && 'Failed'}
                    {upload.status === 'pending' && 'Waiting'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <div style={{
        marginTop: '1.5rem', padding: '1rem',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)'
      }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '0.5rem' }}>📸 Photo Tips</h4>
        <ul style={{ fontSize: '0.75rem', color: '#1E40AF', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>• Take photos in good lighting for best results</li>
          <li>• Include the whole plant or focus on specific features</li>
          <li>• The first photo uploaded will be set as the primary image</li>
          <li>• You can upload up to {maxFiles} photos at once</li>
        </ul>
      </div>
    </div>
  );
}