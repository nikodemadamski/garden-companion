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
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <div className="text-lg font-medium text-gray-700">
            {isUploading ? 'Uploading...' : 'Upload Plant Photos'}
          </div>
          <div className="text-sm text-gray-500">
            Drag and drop photos here, or click to select files
          </div>
          <div className="text-xs text-gray-400">
            Supports JPEG, PNG, WebP • Max {maxFiles} files • 10MB each
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Upload Progress</h4>
          {uploads.map((upload, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {/* Preview */}
              <div className="flex-shrink-0">
                <img
                  src={upload.preview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(upload.status)}</span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {upload.file.name}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(upload.file.size)}
                </div>
                {upload.error && (
                  <div className="text-xs text-red-600 mt-1">
                    {upload.error}
                  </div>
                )}
              </div>
              
              {/* Progress */}
              <div className="flex-shrink-0">
                {upload.status === 'uploading' && (
                  <div className="w-16">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center mt-1 text-gray-600">
                      {upload.progress}%
                    </div>
                  </div>
                )}
                {upload.status !== 'uploading' && (
                  <span className={`text-sm ${getStatusColor(upload.status)}`}>
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
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📸 Photo Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Take photos in good lighting for best results</li>
          <li>• Include the whole plant or focus on specific features</li>
          <li>• The first photo uploaded will be set as the primary image</li>
          <li>• You can upload up to {maxFiles} photos at once</li>
        </ul>
      </div>
    </div>
  );
}