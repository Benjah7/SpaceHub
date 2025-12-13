// frontend/app/dashboard/properties/new/page.tsx
// INTEGRATED VERSION - Replace latitude/longitude inputs with LocationPicker

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building2, MapPin, Image as ImageIcon, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useAuthStore } from '@/lib/store/auth-store';
import { PropertyType } from '@/types';
import toast from 'react-hot-toast';

const PROPERTY_TYPE_OPTIONS = [
  { value: PropertyType.RETAIL, label: 'Retail Shop' },
  { value: PropertyType.OFFICE, label: 'Office Space' },
  { value: PropertyType.KIOSK, label: 'Kiosk' },
  { value: PropertyType.STALL, label: 'Market Stall' },
];

const COMMON_AMENITIES = [
  { id: 'parking', name: 'Parking', icon: '🅿️' },
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'security', name: '24/7 Security', icon: '🔒' },
  { id: 'water', name: 'Water Supply', icon: '💧' },
  { id: 'electricity', name: 'Electricity', icon: '⚡' },
  { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
  { id: 'elevator', name: 'Elevator', icon: '🛗' },
  { id: 'backup', name: 'Backup Generator', icon: '🔋' },
];

const propertySchema = z.object({
  propertyName: z.string().min(5, 'Name must be at least 5 characters'),
  propertyType: z.nativeEnum(PropertyType),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  monthlyRent: z.number().min(1000, 'Minimum rent is KES 1,000'),
  squareFeet: z.number().min(10, 'Minimum size is 10 sq ft'),
  bedrooms: z.number().min(0).default(0),
  bathrooms: z.number().min(0).default(0),
  description: z.string().min(50, 'Description must be at least 50 characters'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Redirect if user is not an owner
  useEffect(() => {
    if (user && user.role !== 'OWNER') {
      router.push('/');
    }
  }, [user, router]);

  const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyType: PropertyType.RETAIL,
      latitude: -1.2921,
      longitude: 36.8219,
      bedrooms: 0,
      bathrooms: 0,
    },
  });

  const watchedLocation = {
    lat: watch('latitude'),
    lng: watch('longitude'),
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file sizes (10MB max per file)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map(f => f.name).join(', ');
        toast.error(`File(s) too large: ${fileNames}. Maximum file size is 10MB`);
        return;
      }

      setImages(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PropertyFormData) => {
    setUploading(true);
    try {
      // Create property
      const property = await apiClient.createProperty({
        ...data,
        propertyType: data.propertyType,
        amenities: selectedAmenities.map(id =>
          COMMON_AMENITIES.find(a => a.id === id)?.name || id
        ),
      });

      // Upload images
      if (images.length > 0) {
        await apiClient.uploadPropertyImages(property.id, images);
      }

      toast.success('Property created successfully!');
      router.push(`/dashboard/properties/${property.id}`);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to create property');
    } finally {
      setUploading(false);
    }
  };

  // Don't render form if user is not an owner
  if (user?.role !== 'OWNER') {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        <motion.div className="mb-xl" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-h1 mb-2">Add New Property</h1>
          <p className="text-body text-neutral-text-secondary">
            Create a new property listing
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-xl">
          {/* Basic Information */}
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
                        className="w-full px-4 py-3 text-body bg-neutral-surface border-2 border-neutral-border rounded-lg focus:outline-none focus:border-brand-primary transition-all"
                      >
                        {PROPERTY_TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                />

                <Input
                  type="number"
                  label="Monthly Rent (KES)"
                  placeholder="50000"
                  error={errors.monthlyRent?.message}
                  {...register('monthlyRent', { valueAsNumber: true })}
                />

                <Input
                  type="number"
                  label="Size (sq ft)"
                  placeholder="500"
                  error={errors.squareFeet?.message}
                  {...register('squareFeet', { valueAsNumber: true })}
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Describe your property..."
                rows={5}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </Card>

          {/* Location - WITH INTEGRATED MAP PICKER */}
          <Card>
            <div className="p-lg border-b border-neutral-border">
              <h2 className="text-h2 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Location
              </h2>
            </div>
            <div className="p-lg space-y-lg">
              <LocationPicker
                initialLocation={watchedLocation}
                onLocationSelect={(location) => {
                  setValue('latitude', location.lat);
                  setValue('longitude', location.lng);
                  setValue('address', location.address);
                  if (location.neighborhood) {
                    setValue('neighborhood', location.neighborhood);
                  }
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <Input
                  label="Address"
                  placeholder="123 Main Street"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <Input
                  label="Neighborhood"
                  placeholder="e.g., Westlands"
                  error={errors.neighborhood?.message}
                  {...register('neighborhood')}
                />
              </div>

              <div className="p-md bg-neutral-surface rounded-lg">
                <p className="text-tiny text-neutral-text-secondary">
                  📍 Coordinates: {watch('latitude').toFixed(6)}, {watch('longitude').toFixed(6)}
                </p>
              </div>
            </div>
          </Card>

          {/* Amenities */}
          <Card>
            <div className="p-lg border-b border-neutral-border">
              <h2 className="text-h2 flex items-center gap-2">
                <Check className="w-6 h-6" />
                Amenities
              </h2>
            </div>
            <div className="p-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {COMMON_AMENITIES.map(amenity => (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`p-md border-2 rounded-lg transition-all ${
                      selectedAmenities.includes(amenity.id)
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-neutral-border hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{amenity.icon}</div>
                    <p className="text-small font-medium">{amenity.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card>
            <div className="p-lg border-b border-neutral-border">
              <h2 className="text-h2 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Images
              </h2>
            </div>
            <div className="p-lg space-y-lg">
              <div>
                <label className="block text-small font-medium mb-2">
                  Upload Images (Max 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="block w-full text-small"
                  disabled={images.length >= 10}
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-border">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-status-error rounded-full text-white hover:bg-status-error/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-md justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={uploading}
            >
              Create Property
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}