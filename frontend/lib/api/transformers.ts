/**
 * API Transformers
 * Handles conversion between backend and frontend data structures
 */

import { PropertyType, PropertyStatus } from '@/types';
import type {
  Property,
  User,
  PropertyOwner,
  Inquiry,
  Review,
  Notification,
} from '@/types';

import type {
  BackendProperty,
  BackendPropertyType,
  BackendPropertyStatus,
  BackendUser,
  BackendInquiry,
  BackendReview,
  BackendNotification,
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
      propertyType: PropertyTransformer.mapPropertyType(backend.propertyType),
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
      images: backend.images?.map((img) => ({
        id: String(img.id),
        url: img.url,
        alt: backend.propertyName,
        isPrimary: img.isPrimary,
      })) || [],
      amenities: backend.amenities?.map((amenity) => ({
        id: amenity,
        name: amenity,
        icon: 'check',
      })) || [],
      verified: backend.owner?.verified || false,
      ownerId: String(backend.ownerId),
      owner: backend.owner ? UserTransformer.toFrontendOwner(backend.owner) : ({} as PropertyOwner),
      availableFrom: backend.createdAt,
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
      views: backend.views || 0,
      inquiries: 0,
    };
  }

  /**
   * Convert frontend property data to backend DTO
   */
  static toBackendCreate(frontend: Partial<Property>) {
    return {
      propertyName: frontend.title || '',
      description: frontend.description || '',
      propertyType: frontend.propertyType as BackendPropertyType,
      monthlyRent: frontend.price || 0,
      squareFeet: frontend.size || 0,
      address: frontend.location?.address || '',
      neighborhood: frontend.location?.neighborhood || '',
      latitude: frontend.location?.lat || 0,
      longitude: frontend.location?.lng || 0,
      bedrooms: 0,
      bathrooms: 0,
      amenities: frontend.amenities?.map((a) => a.name) || [],
    };
  }

  /**
   * Convert frontend property update to backend DTO
   */
  static toBackendUpdate(frontend: Partial<Property>) {
    const update: any = {};
    
    if (frontend.title) update.propertyName = frontend.title;
    if (frontend.description) update.description = frontend.description;
    if (frontend.price) update.monthlyRent = frontend.price;
    if (frontend.size) update.squareFeet = frontend.size;
    if (frontend.location?.address) update.address = frontend.location.address;
    if (frontend.location?.neighborhood) update.neighborhood = frontend.location.neighborhood;
    if (frontend.amenities) update.amenities = frontend.amenities.map((a) => a.name);
    if (frontend.status) update.status = PropertyTransformer.mapPropertyStatusToBackend(frontend.status);
    
    return update;
  }

  /**
   * Map backend property type to frontend
   */
  private static mapPropertyType(type: BackendPropertyType): PropertyType {
    const mapping: Record<BackendPropertyType, PropertyType> = {
      RETAIL: PropertyType.RETAIL,
      OFFICE: PropertyType.OFFICE,
      KIOSK: PropertyType.KIOSK,
      STALL: PropertyType.STALL,
    };
    return mapping[type] || PropertyType.RETAIL;
  }

  /**
   * Map backend property status to frontend
   */
  private static mapPropertyStatus(status: BackendPropertyStatus): PropertyStatus {
    const mapping: Record<BackendPropertyStatus, PropertyStatus> = {
      AVAILABLE: PropertyStatus.AVAILABLE,
      RENTED: PropertyStatus.RENTED,
      PENDING: PropertyStatus.PENDING,
      INACTIVE: PropertyStatus.INACTIVE,
    };
    return mapping[status] || PropertyStatus.AVAILABLE;
  }

  /**
   * Map frontend property status to backend
   */
  private static mapPropertyStatusToBackend(status: PropertyStatus): BackendPropertyStatus {
    const mapping: Record<PropertyStatus, BackendPropertyStatus> = {
      [PropertyStatus.AVAILABLE]: 'AVAILABLE' as BackendPropertyStatus,
      [PropertyStatus.RENTED]: 'RENTED' as BackendPropertyStatus,
      [PropertyStatus.PENDING]: 'PENDING' as BackendPropertyStatus,
      [PropertyStatus.INACTIVE]: 'INACTIVE' as BackendPropertyStatus,
    };
    return mapping[status] || 'AVAILABLE' as BackendPropertyStatus;
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
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: String(backend.id),
      email: backend.email,
      name: backend.name,
      firstName,
      lastName,
      phone: backend.phone,
      role: backend.role as 'OWNER' | 'TENANT' | 'ADMIN',
      verified: backend.verified,
      avatar: backend.profileImage,
      createdAt: backend.createdAt,
    };
  }

  /**
   * Convert backend user to frontend property owner
   */
  static toFrontendOwner(backend: BackendUser): PropertyOwner {
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
      propertyId: String(backend.propertyId),
      property: backend.property ? PropertyTransformer.toFrontend(backend.property) : ({} as Property),
      tenantId: String(backend.tenantId),
      tenant: backend.tenant ? UserTransformer.toFrontend(backend.tenant) : ({} as User),
      message: backend.message,
      status: backend.status as 'PENDING' | 'RESPONDED' | 'CLOSED',
      response: backend.response,
      preferredViewingDate: backend.preferredViewingDate,
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
    };
  }

  /**
   * Convert frontend inquiry data to backend DTO
   */
  static toBackendCreate(propertyId: number, message: string, preferredViewingDate?: string) {
    return {
      message,
      propertyId,
      preferredViewingDate: preferredViewingDate ? new Date(preferredViewingDate) : undefined,
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
      propertyId: String(backend.propertyId),
      userId: String(backend.userId),
      user: backend.user ? UserTransformer.toFrontend(backend.user) : ({} as User),
      rating: backend.rating,
      comment: backend.comment,
      createdAt: backend.createdAt,
      updatedAt: backend.updatedAt,
    };
  }

  /**
   * Convert frontend review data to backend DTO
   */
  static toBackendCreate(propertyId: number, rating: number, comment: string) {
    return {
      rating,
      comment,
      propertyId,
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
    return {
      id: String(backend.id),
      userId: String(backend.userId),
      type: NotificationTransformer.mapNotificationType(backend.type),
      title: backend.title,
      message: backend.message,
      read: backend.read,
      createdAt: backend.createdAt,
      actionUrl: backend.metadata?.actionUrl,
    };
  }

  /**
   * Map backend notification type to frontend
   */
  private static mapNotificationType(type: string): 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' {
    const mapping: Record<string, any> = {
      info: 'INFO',
      success: 'SUCCESS',
      warning: 'WARNING',
      error: 'ERROR',
    };
    return mapping[type.toLowerCase()] || 'INFO';
  }
}

/**
 * Paginated Response Transformer
 */
export class PaginatedResponseTransformer {
  /**
   * Transform paginated backend response to frontend
   */
  static toFrontend<T, U>(
    backendResponse: { data: T[]; pagination: any },
    itemTransformer: (item: T) => U
  ) {
    return {
      data: backendResponse.data.map(itemTransformer),
      pagination: backendResponse.pagination,
    };
  }
}