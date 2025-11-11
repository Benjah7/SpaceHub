// Core Property Types
export interface Location {
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  city: string;
  county: string;
}

export enum PropertyType {
  SHOP = 'SHOP',
  KIOSK = 'KIOSK',
  OFFICE = 'OFFICE',
  WAREHOUSE = 'WAREHOUSE',
  STALL = 'STALL',
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  UNAVAILABLE = 'UNAVAILABLE',
  PENDING = 'PENDING',
}

export interface PropertyAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  size: number; // in square meters
  location: Location;
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  verified: boolean;
  ownerId: string;
  owner: PropertyOwner;
  availableFrom: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  inquiries: number;
  businessInsights?: BusinessInsights;
}

export interface BusinessInsights {
  footTraffic: 'LOW' | 'MEDIUM' | 'HIGH';
  demographics: string;
  nearbyBusinesses: string[];
  transportAccess: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'OWNER' | 'TENANT';
  verified: boolean;
  avatar?: string;
  createdAt: string;
}

export interface PropertyOwner extends User {
  properties: Property[];
  rating: number;
  reviewCount: number;
}

// Search & Filter Types
export interface SearchFilters {
  location?: string;
  propertyType?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  amenities?: string[];
  status?: PropertyStatus[];
  verified?: boolean;
  radius?: number; // in kilometers
}

export interface SearchParams extends SearchFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'size' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Inquiry & Booking Types
export interface Inquiry {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  message: string;
  status: 'PENDING' | 'RESPONDED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  startDate: string;
  endDate?: string;
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  mpesaTransactionId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

// Payment Types
export interface MpesaPayment {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  checkoutRequestId?: string;
}

// Dashboard Analytics Types
export interface PropertyAnalytics {
  propertyId: string;
  views: number;
  inquiries: number;
  bookings: number;
  revenue: number;
  viewsOverTime: TimeSeriesData[];
  inquiriesBySource: { source: string; count: number }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface DashboardStats {
  activeListings: number;
  totalInquiries: number;
  totalViews: number;
  bookedProperties: number;
  monthlyRevenue: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'INQUIRY' | 'VIEW' | 'BOOKING' | 'PAYMENT';
  description: string;
  timestamp: string;
  propertyId?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  firstName: string;
  lastName: string;
  phone: string;
  role: 'OWNER' | 'TENANT';
}

export interface PropertyFormData {
  title: string;
  description: string;
  propertyType: PropertyType;
  price: number;
  size: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  amenities: string[];
  availableFrom: string;
  images: File[];
}

export interface InquiryFormData {
  propertyId: string;
  message: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Language Types
export type Language = 'en' | 'sw';

export interface Translation {
  [key: string]: string | Translation;
}
