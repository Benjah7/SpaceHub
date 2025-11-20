/**
 * Backend types that exactly match the Prisma schema and backend DTOs
 * These types represent the data structure as returned by the backend API
 */

import { PropertyStatus, PropertyType } from ".";

// Enums from backend
export enum BackendUserRole {
  TENANT = 'TENANT',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export enum BackendPropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

export enum BackendPropertyType {
  RETAIL = 'RETAIL',
  OFFICE = 'OFFICE',
  KIOSK = 'KIOSK',
  STALL = 'STALL',
}

export enum BackendInquiryStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  CLOSED = 'CLOSED',
}

export enum BackendPaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum BackendVerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

// User types from backend
export interface BackendUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: BackendUserRole;
  verified: boolean;
  verificationStatus: BackendVerificationStatus;
  bio?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Property Image from backend
export interface BackendPropertyImage {
  id: number;
  url: string;
  publicId?: string;
  isPrimary: boolean;
  propertyId: number;
  createdAt: string;
}

// Property from backend
export interface BackendProperty {
  id: number;
  propertyName: string;
  address: string;
  neighborhood: string;
  longitude: number;
  latitude: number;
  monthlyRent: string; // Decimal returned as string
  squareFeet: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  amenities: string[];
  propertyType: PropertyType;
  status: BackendPropertyStatus;
  views: number;
  featured: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner?: BackendUser;
  images?: BackendPropertyImage[];
}

// Inquiry from backend
export interface BackendInquiry {
  id: number;
  message: string;
  status: BackendInquiryStatus;
  propertyId: number;
  tenantId: number;
  ownerId: number;
  preferredViewingDate?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  property?: BackendProperty;
  tenant?: BackendUser;
  owner?: BackendUser;
}

// Review from backend
export interface BackendReview {
  id: number;
  rating: number;
  comment: string;
  propertyId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: BackendUser;
  property?: BackendProperty;
}

// Payment from backend
export interface BackendPayment {
  id: number;
  amount: string; // Decimal returned as string
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  status: BackendPaymentStatus;
  propertyId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface BackendApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface BackendPaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth response types
export interface BackendAuthResponse {
  user: BackendUser;
  token: string;
}

// Property creation/update DTOs
export interface BackendCreatePropertyDTO {
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

export interface BackendUpdatePropertyDTO {
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

// Search criteria from backend
export interface BackendSearchCriteria {
  neighborhood?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: BackendPropertyType;
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

// Notification from backend
export interface BackendNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Dashboard stats from backend
export interface BackendDashboardStats {
  activeListings: number;
  totalInquiries: number;
  totalViews: number;
  totalRevenue: string; // Decimal as string
}


// Appointment Status
export enum BackendAppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Message from backend
export interface BackendMessage {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

// Conversation from backend
export interface BackendConversation {
  id: number;
  propertyId?: number;
  createdAt: string;
  updatedAt: string;
  participants: BackendConversationParticipant[];
  messages?: BackendMessage[];
  property?: {
    id: number;
    propertyName: string;
    address: string;
    images?: { url: string }[];
  };
  unreadCount?: number;
}

// Conversation Participant from backend
export interface BackendConversationParticipant {
  id: number;
  conversationId: number;
  userId: number;
  lastReadAt?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
    role: BackendUserRole;
  };
}

// Appointment from backend
export interface BackendAppointment {
  id: number;
  propertyId: number;
  tenantId: number;
  ownerId: number;
  scheduledDate: string;
  status: BackendAppointmentStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: number;
    propertyName: string;
    address: string;
    neighborhood?: string;
    monthlyRent?: string;
    squareFeet?: number;
    images?: { url: string; isPrimary: boolean }[];
  };
  tenant?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  owner?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
}