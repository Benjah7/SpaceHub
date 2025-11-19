/**
 * API Transformers - COMPLETE FIX
 * Copy this ENTIRE file to: frontend/lib/api/transformers.ts
 */

import { PropertyType, PropertyStatus } from '@/types';
import type {
  Property,
  User,
  PropertyOwner,
  Inquiry,
  Review,
  Notification,
  PaginatedResponse,
} from '@/types';

import type {
  BackendProperty,
  BackendPropertyType,
  BackendPropertyStatus,
  BackendPropertyImage,
  BackendUser,
  BackendInquiry,
  BackendReview,
  BackendNotification,
  BackendPaginatedResponse,
  BackendPaymentStatus,
} from '@/types/backend';

/**
 * Property Transformer
 */
export class PropertyTransformer {
  /**
   * Convert backend property to frontend property
   */
  static toFrontend(backend: BackendProperty): Property {
    return {
      id: String(backend.id),
      title: backend.propertyName,
      description: backend.description,
      propertyType: PropertyTransformer.mapPropertyType(backend.propertyType as unknown as BackendPropertyType),
      status: PropertyTransformer.mapPropertyStatus(backend.status),
      price: Number(backend.monthlyRent),
      size: backend.squareFeet,
      location: {
        lat: backend.latitude,
        lng: backend.longitude,
        address: backend.address,
        neighborhood: backend.neighborhood,
        city: 'Nairobi',
        county: 'Nairobi',
      },
      images: (backend.images || []).map((img: BackendPropertyImage) => ({
        id: String(img.id),
        url: img.url,
        alt: backend.propertyName,
        isPrimary: img.isPrimary,
      })),
      amenities: (backend.amenities || []).map((amenity: string) => ({
        id: amenity,
        name: amenity,
        icon: 'check',
      })),
      verified: backend.owner?.verified || false,
      ownerId: String(backend.ownerId),
      owner: backend.owner
        ? UserTransformer.toPropertyOwner(backend.owner)
        : {
            id: String(backend.ownerId),
            email: '',
            name: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'OWNER' as const,
            verified: false,
            createdAt: backend.createdAt,
            properties: [],
            rating: 0,
            reviewCount: 0,
          },
      availableFrom: backend.createdAt,
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
      views: backend.views || 0,
      inquiries: 0,
    };
  }

  /**
   * Map backend property type to frontend
   */
  static mapPropertyType(backendType: BackendPropertyType): PropertyType {
    const type = String(backendType);
    switch (type) {
      case 'RETAIL':
        return PropertyType.RETAIL;
      case 'OFFICE':
        return PropertyType.OFFICE;
      case 'KIOSK':
        return PropertyType.KIOSK;
      case 'STALL':
        return PropertyType.STALL;
      default:
        return PropertyType.RETAIL;
    }
  }

  /**
   * Map frontend property type to backend
   */
  static mapPropertyTypeToBackend(frontendType: PropertyType): BackendPropertyType {
    const type = String(frontendType);
    return type as BackendPropertyType;
  }

  /**
   * Map backend property status to frontend
   */
  static mapPropertyStatus(backendStatus: BackendPropertyStatus): PropertyStatus {
    const status = String(backendStatus);
    switch (status) {
      case 'AVAILABLE':
        return PropertyStatus.AVAILABLE;
      case 'RENTED':
        return PropertyStatus.RENTED;
      case 'PENDING':
        return PropertyStatus.PENDING;
      case 'INACTIVE':
        return PropertyStatus.INACTIVE;
      default:
        return PropertyStatus.AVAILABLE;
    }
  }

  /**
   * Map frontend property status to backend
   */
  static mapPropertyStatusToBackend(frontendStatus: PropertyStatus): BackendPropertyStatus {
    const status = String(frontendStatus);
    return status as BackendPropertyStatus;
  }
}

/**
 * User Transformer
 */
export class UserTransformer {
  /**
   * Convert backend user to frontend user
   */
  static toFrontend(backend: BackendUser): User {
    const nameParts = backend.name.split(' ');
    const firstName = nameParts[0] || backend.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: String(backend.id),
      email: backend.email,
      name: backend.name,
      firstName,
      lastName,
      phone: backend.phone,
      role: String(backend.role) as 'OWNER' | 'TENANT' | 'ADMIN',
      verified: backend.verified,
      avatar: backend.profileImage,
      createdAt: backend.createdAt,
    };
  }

  /**
   * Convert backend user to property owner format
   */
  static toPropertyOwner(backend: BackendUser): PropertyOwner {
    const baseUser = UserTransformer.toFrontend(backend);
    return {
      ...baseUser,
      properties: [],
      rating: 0,
      reviewCount: 0,
      bio: backend.bio,
    };
  }
}

/**
 * Inquiry Transformer
 */
export class InquiryTransformer {
  /**
   * Convert backend inquiry to frontend inquiry
   */
  static toFrontend(backend: BackendInquiry): Inquiry {
    return {
      id: String(backend.id),
      message: backend.message,
      status: String(backend.status) as 'PENDING' | 'RESPONDED' | 'CLOSED',
      propertyId: String(backend.propertyId),
      property: backend.property
        ? PropertyTransformer.toFrontend(backend.property)
        : {
            id: String(backend.propertyId),
            title: '',
            description: '',
            propertyType: PropertyType.RETAIL,
            status: PropertyStatus.AVAILABLE,
            price: 0,
            size: 0,
            location: {
              lat: 0,
              lng: 0,
              address: '',
              neighborhood: '',
              city: 'Nairobi',
              county: 'Nairobi',
            },
            images: [],
            amenities: [],
            verified: false,
            ownerId: '',
            owner: {} as PropertyOwner,
            availableFrom: '',
            createdAt: '',
            updatedAt: '',
            views: 0,
            inquiries: 0,
          },
      tenantId: String(backend.tenantId),
      tenant: backend.tenant
        ? UserTransformer.toFrontend(backend.tenant)
        : {
            id: String(backend.tenantId),
            email: '',
            name: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'TENANT' as const,
            verified: false,
            createdAt: '',
          },
      preferredViewingDate: backend.preferredViewingDate,
      response: backend.response,
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
    };
  }
}

/**
 * Review Transformer
 */
export class ReviewTransformer {
  /**
   * Convert backend review to frontend review
   */
  static toFrontend(backend: BackendReview): Review {
    return {
      id: String(backend.id),
      rating: backend.rating,
      comment: backend.comment,
      propertyId: String(backend.propertyId),
      userId: String(backend.userId),
      user: backend.user
        ? UserTransformer.toFrontend(backend.user)
        : {
            id: String(backend.userId),
            email: '',
            name: '',
            firstName: '',
            lastName: '',
            phone: '',
            role: 'TENANT' as const,
            verified: false,
            createdAt: '',
          },
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
    };
  }
}

/**
 * Notification Transformer
 */
export class NotificationTransformer {
  /**
   * Convert backend notification to frontend notification
   */
  static toFrontend(backend: BackendNotification): Notification {
    const mapType = (type: string): 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' => {
      const upperType = type.toUpperCase();
      if (['INFO', 'SUCCESS', 'WARNING', 'ERROR'].includes(upperType)) {
        return upperType as 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
      }
      return 'INFO';
    };

    return {
      id: String(backend.id),
      userId: String(backend.userId),
      type: mapType(backend.type),
      title: backend.title,
      message: backend.message,
      read: backend.read,
      createdAt: backend.createdAt,
      actionUrl: backend.metadata?.actionUrl,
    };
  }
}

/**
 * Payment Status Transformer
 */
export class PaymentTransformer {
  /**
   * Map backend payment status to frontend
   */
  static mapPaymentStatus(backendStatus: BackendPaymentStatus): 'PENDING' | 'PAID' | 'FAILED' {
    const status = String(backendStatus);
    switch (status) {
      case 'COMPLETED':
        return 'PAID';
      case 'FAILED':
        return 'FAILED';
      case 'PENDING':
      case 'REFUNDED':
      default:
        return 'PENDING';
    }
  }

  /**
   * Map frontend payment status to backend
   */
  static mapPaymentStatusToBackend(frontendStatus: 'PENDING' | 'PAID' | 'FAILED'): string {
    switch (frontendStatus) {
      case 'PAID':
        return 'COMPLETED';
      case 'FAILED':
        return 'FAILED';
      case 'PENDING':
      default:
        return 'PENDING';
    }
  }
}

/**
 * Paginated Response Transformer
 */
export class PaginatedResponseTransformer {
  /**
   * Convert backend paginated response to frontend paginated response
   */
  static toFrontend<T, U>(
    backend: BackendPaginatedResponse<T>,
    itemTransformer: (item: T) => U
  ): PaginatedResponse<U> {
    return {
      data: backend.data.map(itemTransformer),
      pagination: {
        page: backend.pagination.page,
        limit: backend.pagination.limit,
        total: backend.pagination.total,
        totalPages: backend.pagination.totalPages,
      },
    };
  }
}

/**
 * Utility function to safely transform any backend data
 */
export function safeTransform<T, U>(
  data: T | null | undefined,
  transformer: (data: T) => U
): U | null {
  if (!data) return null;
  try {
    return transformer(data);
  } catch (error) {
    console.error('Transform error:', error);
    return null;
  }
}

/**
 * Utility function to safely transform arrays
 */
export function safeTransformArray<T, U>(
  data: T[] | null | undefined,
  transformer: (data: T) => U
): U[] {
  if (!data || !Array.isArray(data)) return [];
  try {
    return data.map(transformer);
  } catch (error) {
    console.error('Transform array error:', error);
    return [];
  }
}