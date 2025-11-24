'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  MapPin,
  Upload,
  X,
  DollarSign,
  Square,
  Check,
  Trash2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useProperty } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  PROPERTY_TYPE_OPTIONS,
  NAIROBI_NEIGHBORHOODS,
  COMMON_AMENITIES,
  PROPERTY_STATUS_OPTIONS,
  PropertyType,
  PropertyStatus,
} from '@/types';
import toast from 'react-hot-toast';
import { PropertyDocuments } from '@/components/documents/PropertyDocuments';

// Form validation schema
const updatePropertySchema = z.object({
  propertyName: z
    .string()
    .min(3, 'Property name must be at least 3 characters')
    .max(200, 'Property name cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  monthlyRent: z
    .number()
    .min(1000, 'Minimum rent is KES 1,000')
    .max(10000000, 'Maximum rent is KES 10,000,000')
    .optional(),
  squareFeet: z
    .number()
    .min(1, 'Size must be at least 1 square foot')
    .max(100000, 'Size cannot exceed 100,000 square feet')
    .optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address cannot exceed 500 characters')
    .optional(),
  neighborhood: z.string().min(2, 'Neighborhood is required').optional(),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  amenities: z.array(z.string()).optional(),
});

type UpdatePropertyFormData = z.infer<typeof updatePropertySchema>;

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Fetch property data
  const { data: property, loading, error } = useProperty(propertyId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePropertyFormData>({
    resolver: zodResolver(updatePropertySchema),
  });

  // Redirect if not authenticated or not owner
  useEffect(() => {

    if (isLoading) return;

    // Only redirect if we've checked auth and user is not authenticated
    if (isAuthenticated === false) {
      router.push('/login');
      return;
    }

    // Only redirect if authenticated but not an owner
    if (isAuthenticated && user && user.role !== 'OWNER') {
      router.push('/');
      return;
    }

    // Check ownership after property loads
    if (property && user && property.ownerId !== user?.id) {
      toast.error('You do not have permission to edit this property');
      router.push('/dashboard/properties');
    }
  }, [isAuthenticated, user, property, isLoading, router]);

  // Populate form with property data
  useEffect(() => {
    if (property) {
      reset({
        propertyName: property.title,
        description: property.description,
        propertyType: property.propertyType as PropertyType,
        monthlyRent: property.price,
        squareFeet: property.size,
        address: property.location.address,
        neighborhood: property.location.neighborhood,
        bedrooms: 0, // These might not be in the Property type
        bathrooms: 0,
        status: property.status as PropertyStatus,
      });

      // Set amenities
      const amenityIds = property.amenities.map((a) => a.id);
      setSelectedAmenities(amenityIds);
      setValue('amenities', amenityIds);
    }
  }, [property, reset, setValue]);

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const currentTotal = (property?.images.length || 0) - deletedImageIds.length + newImages.length;

    if (currentTotal + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imageId: string) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await apiClient.setPrimaryImage(propertyId, imageId);
      toast.success('Primary image updated');
      window.location.reload();
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to update primary image');
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) => {
      const newAmenities = prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId];
      setValue('amenities', newAmenities);
      return newAmenities;
    });
  };

  const onSubmit = async (data: UpdatePropertyFormData) => {
    try {
      // Update property details
      await apiClient.updateProperty(propertyId, {
        propertyName: data.propertyName,
        address: data.address,
        neighborhood: data.neighborhood,
        monthlyRent: data.monthlyRent,
        squareFeet: data.squareFeet,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        description: data.description,
        amenities: data.amenities,
        status: data.status,
      });

      // Delete marked images
      for (const imageId of deletedImageIds) {
        try {
          await apiClient.deletePropertyImage(propertyId, imageId);
        } catch (error) {
          console.error(`Failed to delete image ${imageId}`);
        }
      }

      // Upload new images
      if (newImages.length > 0) {
        setUploading(true);
        await apiClient.uploadPropertyImages(propertyId, newImages, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
      }

      toast.success('Property updated successfully!');
      router.push(`/properties/${propertyId}`);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to update property');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg py-xl">
        <div className="container-custom">
          <ListSkeleton count={5} />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-neutral-bg py-xl">
        <div className="container-custom">
          <Card>
            <div className="p-xl text-center">
              <h2 className="text-h2 mb-md">Property Not Found</h2>
              <p className="text-body text-neutral-text-secondary mb-lg">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Button href="/dashboard/properties">Back to Properties</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not owner
  if (!isAuthenticated || user?.role !== 'OWNER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        {/* Header */}
        <motion.div
          className="mb-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-h1 mb-2">Edit Property</h1>
          <p className="text-body text-neutral-text-secondary">
            Update your property information and images
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-xl">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h2 className="text-h2 flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Basic Information
                </h2>
              </div>
              <div className="p-lg space-y-lg">
                <Input
                  label="Property Name"
                  placeholder="e.g., Prime Retail Space in Westlands"
                  error={errors.propertyName?.message}
                  {...register('propertyName')}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                  <Controller
                    name="propertyType"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-small font-medium text-neutral-text-primary mb-1 block">
                          Property Type
                        </label>
                        <select
                          {...field}
                          className="w-full px-4 py-3 text-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:outline-none focus:ring-4 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                        >
                          {PROPERTY_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />

                  <Controller
                    name="neighborhood"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-small font-medium text-neutral-text-primary mb-1 block">
                          Neighborhood
                        </label>
                        <select
                          {...field}
                          className="w-full px-4 py-3 text-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:outline-none focus:ring-4 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                        >
                          {NAIROBI_NEIGHBORHOODS.map((neighborhood) => (
                            <option key={neighborhood} value={neighborhood}>
                              {neighborhood}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />

                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-small font-medium text-neutral-text-primary mb-1 block">
                          Status
                        </label>
                        <select
                          {...field}
                          className="w-full px-4 py-3 text-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:outline-none focus:ring-4 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                        >
                          {PROPERTY_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                </div>

                <Textarea
                  label="Description"
                  placeholder="Describe your property, its features, and what makes it unique..."
                  rows={5}
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>
            </Card>
          </motion.div>

          {/* Pricing & Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h2 className="text-h2 flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Pricing & Size
                </h2>
              </div>
              <div className="p-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <Input
                    label="Monthly Rent (KES)"
                    type="number"
                    placeholder="50000"
                    leftIcon={<DollarSign className="w-5 h-5" />}
                    error={errors.monthlyRent?.message}
                    {...register('monthlyRent', { valueAsNumber: true })}
                  />

                  <Input
                    label="Size (Square Feet)"
                    type="number"
                    placeholder="500"
                    leftIcon={<Square className="w-5 h-5" />}
                    error={errors.squareFeet?.message}
                    {...register('squareFeet', { valueAsNumber: true })}
                  />

                  <Input
                    label="Bedrooms"
                    type="number"
                    placeholder="0"
                    {...register('bedrooms', { valueAsNumber: true })}
                  />

                  <Input
                    label="Bathrooms"
                    type="number"
                    placeholder="0"
                    {...register('bathrooms', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h2 className="text-h2 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Location
                </h2>
              </div>
              <div className="p-lg">
                <Input
                  label="Full Address"
                  placeholder="e.g., Westlands Road, Nairobi"
                  leftIcon={<MapPin className="w-5 h-5" />}
                  error={errors.address?.message}
                  {...register('address')}
                />
                <p className="text-small text-neutral-text-secondary mt-2">
                  Note: Coordinates cannot be changed after creation
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h2 className="text-h2 flex items-center gap-2">
                  <Check className="w-6 h-6" />
                  Amenities
                </h2>
              </div>
              <div className="p-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                  {COMMON_AMENITIES.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`p-md border-2 rounded-lg transition-all ${selectedAmenities.includes(amenity.id)
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-neutral-border hover:border-brand-primary/50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={`w-5 h-5 ${selectedAmenities.includes(amenity.id)
                              ? 'text-brand-primary'
                              : 'text-transparent'
                            }`}
                        />
                        <span className="text-small font-medium">{amenity.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h2 className="text-h2 flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  Property Images
                </h2>
              </div>
              <div className="p-lg space-y-lg">
                {/* Existing Images */}
                {property.images && property.images.length > 0 && (
                  <div>
                    <h3 className="text-body font-semibold mb-md">Current Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                      {property.images
                        .filter((img) => !deletedImageIds.includes(img.id))
                        .map((image) => (
                          <div key={image.id} className="relative group">
                            <Image
                              src={image.url}
                              alt={image.alt || 'Property image'}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(image.id)}
                                className="p-1 bg-brand-primary rounded-full"
                                title="Set as primary"
                              >
                                <Star className="w-4 h-4 text-white" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExistingImage(image.id)}
                                className="p-1 bg-status-error rounded-full"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                            {image.isPrimary && (
                              <div className="absolute bottom-2 left-2 px-2 py-1 bg-brand-primary text-white text-tiny rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div>
                  <h3 className="text-body font-semibold mb-md">Add New Images</h3>
                  <div className="border-2 border-dashed border-neutral-border rounded-lg p-lg text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewImageSelect}
                      className="hidden"
                      id="new-image-upload"
                    />
                    <label
                      htmlFor="new-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-10 h-10 text-neutral-text-tertiary mb-md" />
                      <p className="text-body font-medium mb-2">
                        Click to upload new images
                      </p>
                      <p className="text-small text-neutral-text-secondary">
                        Maximum 10 images total
                      </p>
                    </label>
                  </div>

                  {/* New Image Previews */}
                  {newImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-md">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-2 right-2 p-1 bg-status-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-status-success text-white text-tiny rounded">
                            New
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex items-center gap-md justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || uploading}
              disabled={isSubmitting || uploading}
            >
              {uploading ? 'Uploading Images...' : 'Update Property'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}