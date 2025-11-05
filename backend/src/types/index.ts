import { UserRole, PropertyType, PropertyStatus } from '@prisma/client';

export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface CreatePropertyDTO {
    propertyName: string;
    address: string;
    neighborhood: string;
    longitude: number;
    latitude: number;
    monthlyRent: number;
    squareFeet: number;
    bedrooms?: number;
    bathrooms?: number;
    description: string;
    amenities: string[];
    propertyType: PropertyType;
}

export interface UpdatePropertyDTO {
    propertyName?: string;
    address?: string;
    neighborhood?: string;
    monthlyRent?: number;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    amenities?: string[];
    status?: PropertyStatus;
    featured?: boolean;
}

export interface SearchCriteria {
    neighborhood?: string;
    minRent?: number;
    maxRent?: number;
    propertyType?: PropertyType;
    minSquareFeet?: number;
    maxSquareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number; // in kilometers
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'distance' | 'newest' | 'views';
    sortOrder?: 'asc' | 'desc';
}

export interface CreateInquiryDTO {
    message: string;
    propertyId: number;
    preferredViewingDate?: Date;
}

export interface RespondInquiryDTO {
    response: string;
    status?: 'RESPONDED' | 'CLOSED';
}

export interface CreateReviewDTO {
    rating: number;
    comment: string;
    aspects?: {
        location?: number;
        value?: number;
        condition?: number;
        landlord?: number;
    };
    propertyId: number;
}

export interface InitiatePaymentDTO {
    amount: number;
    phoneNumber: string;
    propertyId: number;
    paymentType: string;
}

export interface SavedSearchDTO {
    name: string;
    criteria: SearchCriteria;
    notifyEmail?: boolean;
    notifySMS?: boolean;
}