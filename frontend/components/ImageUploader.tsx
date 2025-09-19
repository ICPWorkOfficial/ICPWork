'use client';

import React, { useState, useRef } from 'react';
import { useImageUpload, UploadProgress } from '@/lib/image-upload-utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
  userId?: string;
  folder?: string;
  maxFiles?: number;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: UploadProgress;
  status: 'uploading' | 'success' | 'error';
  result?: any;
  error?: string;
}

export function ImageUploader({
  onUploadSuccess,
  onUploadError,
  userId,
  folder,
  maxFiles = 5,
  className = '',
}: ImageUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage } = useImageUpload();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return allowedTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      onUploadError?.('No valid image files selected');
      return;
    }

    if (validFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    validFiles.forEach(file => {
      const id = Math.random().toString(36).substring(7);
      const uploadedFile: UploadedFile = {
        id,
        file,
        progress: { loaded: 0, total: file.size, percentage: 0 },
        status: 'uploading',
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      uploadImage(file, {
        userId,
        folder,
        onProgress: (progress) => {
          setUploadedFiles(prev =>
            prev.map(f => f.id === id ? { ...f, progress } : f)
          );
        },
        onSuccess: (result) => {
          setUploadedFiles(prev =>
            prev.map(f => f.id === id ? { ...f, status: 'success', result } : f)
          );
          onUploadSuccess?.(result);
        },
        onError: (error) => {
          setUploadedFiles(prev =>
            prev.map(f => f.id === id ? { ...f, status: 'error', error } : f)
          );
          onUploadError?.(error);
        },
      });
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Upload images to Tebi.io S3 storage. Supports JPEG, PNG, GIF, and WebP formats (max 10MB each).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Maximum {maxFiles} files, 10MB each
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Select Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(uploadedFile.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                    
                    {uploadedFile.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={uploadedFile.progress.percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadedFile.progress.percentage}%
                        </p>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'success' && uploadedFile.result && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600">
                          ✅ Upload successful
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          URL: {uploadedFile.result.url}
                        </p>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <p className="text-xs text-red-600 mt-2">
                        ❌ {uploadedFile.error}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
