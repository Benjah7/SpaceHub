'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlignLeft,
  Tag,
  Calendar,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import {
  PROPERTY_TYPE_OPTIONS,
  NAIROBI_NEIGHBORHOODS,
  COMMON_AMENITIES,
  PropertyType,
} from '@/types';
import toast from 'react-hot-toast';

// Form validation schema
const createPropertySchema = z.object({
  propertyName: z
    .string()
    .min(3, 'Property name must be at least 3 characters')
    .max(200, 'Property name cannot exceed 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  propertyType: z.nativeEnum(PropertyType, {
    required_error: 'Please select a property type',
  }),
  monthlyRent: z
    .number({ required_error: 'Rent is required' })
    .min(1000, 'Minimum rent is KES 1,000')
    .max(10000000, 'Maximum rent is KES 10,000,000'),
  squareFeet: z
    .number({ required_error: 'Size is required' })
    .min(1, 'Size must be at least 1 square foot')
    .max(100000, 'Size cannot exceed 100,000 square feet'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address cannot exceed 500 characters'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  latitude: z.number().min(-1.45).max(-1.16, 'Location must be within Nairobi'),
  longitude: z.number().min(36.65).max(37.11, 'Location must be within Nairobi'),
  bedrooms: z.number().min(0).max(20).optional(),
  bathrooms: z.number().min(0).max(20).optional(),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
});

type CreatePropertyFormData = z.infer<typeof createPropertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { t } = useLanguageStore();

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePropertyFormData>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      latitude: -1.2921,
      longitude: 36.8219,
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
    },
  });

  // Redirect if not authenticated or not owner
  React.useEffect(() => {
    // ✅ Don't redirect while auth is still loading
    if (isLoading) {
      return;
    }

    // Only redirect after auth finishes loading
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent('/dashboard/properties/new')}`);
      return;
    }

    if (user && user.role !== 'OWNER') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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

  const onSubmit = async (data: CreatePropertyFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      // Create property
      const property = await apiClient.createProperty({
        propertyName: data.propertyName,
        address: data.address,
        neighborhood: data.neighborhood,
        latitude: data.latitude,
        longitude: data.longitude,
        monthlyRent: data.monthlyRent,
        squareFeet: data.squareFeet,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        description: data.description,
        amenities: data.amenities,
        propertyType: data.propertyType,
      });

      // Upload images
      if (property.id) {
        setUploading(true);
        await apiClient.uploadPropertyImages(property.id, images, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });
      }

      toast.success('Property created successfully!');
      router.push(`/properties/${property.id}`);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to create property');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (user && user.role !== 'OWNER') {
    return null;
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
          <h1 className="text-h1 mb-2">Add New Property</h1>
          <p className="text-body text-neutral-text-secondary">
            Create a new property listing to attract potential tenants
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
                  required
                  {...register('propertyName')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <Controller
                    name="propertyType"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-small font-medium text-neutral-text-primary mb-1 block">
                          Property Type <span className="text-status-error">*</span>
                        </label>
                        <select
                          {...field}
                          className="w-full px-4 py-3 text-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:outline-none focus:ring-4 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                        >
                          <option value="">Select type</option>
                          {PROPERTY_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.propertyType && (
                          <p className="text-small text-status-error mt-1">
                            {errors.propertyType.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="neighborhood"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-small font-medium text-neutral-text-primary mb-1 block">
                          Neighborhood <span className="text-status-error">*</span>
                        </label>
                        <select
                          {...field}
                          className="w-full px-4 py-3 text-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:outline-none focus:ring-4 focus:border-brand-primary focus:ring-brand-primary/20 transition-all"
                        >
                          <option value="">Select neighborhood</option>
                          {NAIROBI_NEIGHBORHOODS.map((neighborhood) => (
                            <option key={neighborhood} value={neighborhood}>
                              {neighborhood}
                            </option>
                          ))}
                        </select>
                        {errors.neighborhood && (
                          <p className="text-small text-status-error mt-1">
                            {errors.neighborhood.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <Textarea
                  label="Description"
                  placeholder="Describe your property, its features, and what makes it unique..."
                  rows={5}
                  error={errors.description?.message}
                  required
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
                    required
                    {...register('monthlyRent', { valueAsNumber: true })}
                  />

                  <Input
                    label="Size (Square Feet)"
                    type="number"
                    placeholder="500"
                    leftIcon={<Square className="w-5 h-5" />}
                    error={errors.squareFeet?.message}
                    required
                    {...register('squareFeet', { valueAsNumber: true })}
                  />

                  <Input
                    label="Bedrooms (Optional)"
                    type="number"
                    placeholder="0"
                    {...register('bedrooms', { valueAsNumber: true })}
                  />

                  <Input
                    label="Bathrooms (Optional)"
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
              <div className="p-lg space-y-lg">
                <Input
                  label="Full Address"
                  placeholder="e.g., Westlands Road, Nairobi"
                  leftIcon={<MapPin className="w-5 h-5" />}
                  error={errors.address?.message}
                  required
                  {...register('address')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <Input
                    label="Latitude"
                    type="number"
                    step="0.000001"
                    placeholder="-1.2921"
                    error={errors.latitude?.message}
                    required
                    {...register('latitude', { valueAsNumber: true })}
                  />

                  <Input
                    label="Longitude"
                    type="number"
                    step="0.000001"
                    placeholder="36.8219"
                    error={errors.longitude?.message}
                    required
                    {...register('longitude', { valueAsNumber: true })}
                  />
                </div>

                <p className="text-small text-neutral-text-secondary">
                  Tip: You can use Google Maps to find exact coordinates
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
                {errors.amenities && (
                  <p className="text-small text-status-error mt-2">
                    {errors.amenities.message}
                  </p>
                )}
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
              <div className="p-lg">
                <div className="border-2 border-dashed border-neutral-border rounded-lg p-xl text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-neutral-text-tertiary mb-md" />
                    <p className="text-body font-medium mb-2">
                      Click to upload property images
                    </p>
                    <p className="text-small text-neutral-text-secondary">
                      Maximum 10 images, up to 10MB each
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-lg">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-status-error rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-brand-primary text-white text-tiny rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
              {uploading ? 'Uploading Images...' : 'Create Property'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}