import { z } from 'zod';
import { PropertyType } from '@/types';

/**
 * Property creation/update validation schema
 */
export const propertySchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  propertyType: z.nativeEnum(PropertyType, {
    required_error: 'Please select a property type',
  }),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .min(1000, 'Minimum price is KES 1,000')
    .max(10000000, 'Maximum price is KES 10,000,000')
    .int('Price must be a whole number'),
  size: z
    .number({
      required_error: 'Size is required',
      invalid_type_error: 'Size must be a number',
    })
    .min(1, 'Size must be at least 1 square meter')
    .max(10000, 'Size cannot exceed 10,000 square meters')
    .int('Size must be a whole number'),
  location: z.object({
    address: z
      .string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address cannot exceed 200 characters'),
    neighborhood: z
      .string()
      .min(2, 'Neighborhood is required')
      .max(100, 'Neighborhood cannot exceed 100 characters'),
    city: z
      .string()
      .min(1, 'City is required')
      .default('Nairobi'),
    county: z
      .string()
      .min(1, 'County is required')
      .default('Nairobi'),
    lat: z
      .number()
      .min(-90, 'Invalid latitude')
      .max(90, 'Invalid latitude'),
    lng: z
      .number()
      .min(-180, 'Invalid longitude')
      .max(180, 'Invalid longitude'),
  }),
  amenities: z
    .array(z.string())
    .min(1, 'Please select at least one amenity')
    .max(20, 'Maximum 20 amenities allowed'),
  availableFrom: z
    .string()
    .min(1, 'Available from date is required')
    .refine((date) => new Date(date) >= new Date(), {
      message: 'Available from date cannot be in the past',
    }),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

/**
 * Inquiry creation validation schema
 */
export const inquirySchema = z.object({
  propertyId: z
    .string()
    .min(1, 'Property ID is required'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .trim(),
  preferredViewingDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || new Date(date) >= new Date(),
      'Viewing date cannot be in the past'
    ),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;

/**
 * Review creation validation schema
 */
export const reviewSchema = z.object({
  propertyId: z
    .string()
    .min(1, 'Property ID is required'),
  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating must be a number',
    })
    .int('Rating must be a whole number')
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment cannot exceed 1000 characters')
    .trim(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

/**
 * Property search filters validation schema
 */
export const searchFiltersSchema = z.object({
  location: z.string().optional(),
  propertyType: z.array(z.nativeEnum(PropertyType)).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minSize: z.number().min(0).optional(),
  maxSize: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  radius: z.number().min(0.1).max(50).optional(),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'Minimum price cannot be greater than maximum price',
    path: ['maxPrice'],
  }
).refine(
  (data) => {
    if (data.minSize && data.maxSize) {
      return data.minSize <= data.maxSize;
    }
    return true;
  },
  {
    message: 'Minimum size cannot be greater than maximum size',
    path: ['maxSize'],
  }
);

export type SearchFiltersFormData = z.infer<typeof searchFiltersSchema>;
