'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  maxFiles?: number;
  maxSizeMB?: number;
  onUpload: (files: File[]) => void;
  onChange?: (files: File[]) => void;
  existingImages?: string[];
  onRemove?: (index: number) => void;
  error?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  maxFiles = 10,
  maxSizeMB = 5,
  onUpload,
  onChange,
  existingImages = [],
  onRemove,
  error,
  disabled = false,
}) => {
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFiles = (fileList: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    // Check total count
    if (fileList.length + previews.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} images allowed`);
      return { valid, errors };
    }

    // Validate each file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    for (const file of fileList) {
      // Check file type
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPG, PNG, and WebP images are allowed`);
        continue;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than ${maxSizeMB}MB`);
        continue;
      }

      valid.push(file);
    }

    return { valid, errors };
  };

  const createPreviews = async (fileList: File[]): Promise<string[]> => {
    return Promise.all(
      fileList.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleFileChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const fileArray = Array.from(fileList);
    const { valid, errors } = validateFiles(fileArray);

    // Show errors
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      if (valid.length === 0) return;
    }

    // Create previews for valid files
    const newPreviews = await createPreviews(valid);
    const updatedPreviews = [...previews, ...newPreviews];
    const updatedFiles = [...files, ...valid];

    setPreviews(updatedPreviews);
    setFiles(updatedFiles);

    // Call callbacks
    onUpload(valid);
    if (onChange) {
      onChange(updatedFiles);
    }

    // Show success message
    toast.success(`${valid.length} image(s) added successfully`);
  };

  const handleRemove = (index: number) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedFiles = files.filter((_, i) => i !== index);

    setPreviews(updatedPreviews);
    setFiles(updatedFiles);

    if (onRemove) {
      onRemove(index);
    }

    if (onChange) {
      onChange(updatedFiles);
    }

    toast.success('Image removed');
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const { files } = e.dataTransfer;
      handleFileChange(files);
    },
    [disabled]
  );

  return (
    <div className="w-full">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square rounded-lg overflow-hidden group bg-neutral-border"
            >
              <Image
                src={preview}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-brand-primary text-white text-tiny rounded-full">
                  Primary
                </div>
              )}

              {/* Remove button */}
              {!disabled && (
                <motion.button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-2 bg-status-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Upload Button */}
        {previews.length < maxFiles && !disabled && (
          <motion.label
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed transition-all cursor-pointer',
              'flex flex-col items-center justify-center',
              isDragging
                ? 'border-brand-primary bg-brand-primary/10'
                : 'border-neutral-border hover:border-brand-primary hover:bg-neutral-surface'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragging ? (
              <>
                <ImageIcon className="w-8 h-8 text-brand-primary mb-2" />
                <span className="text-small text-brand-primary font-medium">
                  Drop images here
                </span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-neutral-text-secondary mb-2" />
                <span className="text-small text-neutral-text-secondary">
                  Upload Image
                </span>
                <span className="text-tiny text-neutral-text-tertiary mt-1">
                  or drag and drop
                </span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => handleFileChange(e.target.files)}
              className="hidden"
              disabled={disabled}
            />
          </motion.label>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-tiny text-status-error mb-2"
        >
          {error}
        </motion.p>
      )}

      {/* Helper text */}
      <p className="text-tiny text-neutral-text-secondary">
        Upload up to {maxFiles} images. Max size: {maxSizeMB}MB per image. Supported
        formats: JPG, PNG, WebP. First image will be the primary image.
      </p>
    </div>
  );
};
