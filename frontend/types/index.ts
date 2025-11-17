// Core Property Types
export interface Location {
  lat: number;
  lng: number;
  address: string;
  neighborhood: string;
  city: string;
  county: string;
}

// Updated to match backend
export enum PropertyType {
  RETAIL = 'RETAIL',
  OFFICE = 'OFFICE',
  KIOSK = 'KIOSK',
  STALL = 'STALL',
}

// Updated to match backend
export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
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
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'OWNER' | 'TENANT' | 'ADMIN';
  verified: boolean;
  avatar?: string;
  createdAt: string;
}

export interface PropertyOwner extends User {
  properties: Property[];
  rating: number;
  reviewCount: number;
  bio?: string;
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
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  response?: string;
  preferredViewingDate?: string;
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

// Review Types
export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
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

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
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
    neighborhood: string;
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
  preferredViewingDate?: string;
}

export interface ReviewFormData {
  propertyId: string;
  rating: number;
  comment: string;
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

// Constants
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.RETAIL]: 'Retail Shop',
  [PropertyType.OFFICE]: 'Office Space',
  [PropertyType.KIOSK]: 'Kiosk',
  [PropertyType.STALL]: 'Market Stall',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.AVAILABLE]: 'Available',
  [PropertyStatus.RENTED]: 'Rented',
  [PropertyStatus.PENDING]: 'Pending',
  [PropertyStatus.INACTIVE]: 'Inactive',
};


// ============================================
// FORM DATA TYPES
// ============================================

export interface CreatePropertyFormData {
  propertyName: string;
  address: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  monthlyRent: number;
  squareFeet: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  amenities: string[];
  propertyType: 'RETAIL' | 'OFFICE' | 'KIOSK' | 'STALL';
}

export interface UpdatePropertyFormData {
  propertyName?: string;
  address?: string;
  neighborhood?: string;
  monthlyRent?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  amenities?: string[];
  status?: 'AVAILABLE' | 'RENTED' | 'PENDING' | 'INACTIVE';
  featured?: boolean;
}

export interface InquiryFormData {
  message: string;
  preferredViewingDate?: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ProfileUpdateFormData {
  name?: string;
  phone?: string;
  bio?: string;
}

export interface PaymentFormData {
  amount: number;
  phoneNumber: string;
}

export interface SavedSearchFormData {
  name: string;
  criteria: SearchCriteria;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface SearchCriteria {
  query?: string;
  neighborhood?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: 'RETAIL' | 'OFFICE' | 'KIOSK' | 'STALL';
  minSquareFeet?: number;
  maxSquareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  status?: 'AVAILABLE' | 'RENTED' | 'PENDING' | 'INACTIVE';
  featured?: boolean;
  verified?: boolean;
}

export interface FilterOptions {
  propertyTypes: Array<{ value: string; label: string }>;
  neighborhoods: string[];
  amenities: Array<{ id: string; name: string; icon: string }>;
  priceRanges: Array<{ min: number; max: number; label: string }>;
  sizeRanges: Array<{ min: number; max: number; label: string }>;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface PropertyAnalytics {
  propertyId: string;
  views: number;
  inquiries: number;
  favorites: number;
  viewsOverTime: TimeSeriesData[];
  inquiriesOverTime: TimeSeriesData[];
  conversionRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface PlatformStats {
  totalProperties: number;
  totalUsers: number;
  totalInquiries: number;
  totalRevenue: number;
  activeUsers: number;
  newPropertiesThisMonth: number;
  averagePropertyViews: number;
  conversionRate: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface LoadingState {
  loading: boolean;
  message?: string;
}

export interface ErrorState {
  error: Error | null;
  message?: string;
  statusCode?: number;
}

export interface SuccessState {
  success: boolean;
  message?: string;
}

export interface FormState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
  errors?: Record<string, string[]>;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// FILE UPLOAD TYPES
// ============================================

export interface ImageUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface DocumentUpload {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  documentType: string;
  propertyId?: string;
  createdAt: string;
}

// ============================================
// MAP TYPES
// ============================================

export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  property: Property;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface LocationSearchResult {
  placeId: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  neighborhood?: string;
}

// ============================================
// NEIGHBORHOOD INSIGHTS TYPES
// ============================================

export interface NeighborhoodInsights {
  neighborhood: string;
  averageRent: number;
  totalProperties: number;
  availableProperties: number;
  demographics: {
    population: number;
    medianIncome?: number;
    ageGroups?: Record<string, number>;
  };
  amenities: {
    schools: number;
    hospitals: number;
    shoppingCenters: number;
    publicTransport: number;
  };
  footTraffic: 'low' | 'medium' | 'high';
  businessDensity: 'low' | 'medium' | 'high';
}

// ============================================
// CHAT/MESSAGING TYPES (Future feature)
// ============================================

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  property?: Property;
  createdAt: string;
}

// ============================================
// APPOINTMENT TYPES (Future feature)
// ============================================

export interface Appointment {
  id: string;
  propertyId: string;
  property?: Property;
  tenantId: string;
  tenant?: User;
  ownerId: string;
  owner?: User;
  scheduledDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

// ============================================
// VERIFICATION TYPES
// ============================================

export interface VerificationRequest {
  id: string;
  userId: string;
  documentType: 'ID' | 'BUSINESS_PERMIT' | 'TITLE_DEED';
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface Report {
  id: string;
  reporterId: string;
  reportType: 'PROPERTY' | 'USER' | 'REVIEW';
  targetId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type SortOrder = 'asc' | 'desc';

export type Status =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export type PropertySortBy =
  | 'price'
  | 'distance'
  | 'newest'
  | 'views'
  | 'inquiries';

// ============================================
// API RESPONSE HELPERS
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export type ApiResponseType<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// CONSTANTS
// ============================================

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'RETAIL', label: 'Retail Shop' },
  { value: 'OFFICE', label: 'Office Space' },
  { value: 'KIOSK', label: 'Kiosk' },
  { value: 'STALL', label: 'Market Stall' },
] as const;

export const PROPERTY_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RENTED', label: 'Rented' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export const NAIROBI_NEIGHBORHOODS = [
  'Westlands',
  'Kilimani',
  'Lavington',
  'Karen',
  'Runda',
  'Muthaiga',
  'Parklands',
  'Ngara',
  'CBD',
  'Eastleigh',
  'South C',
  'South B',
  'Kileleshwa',
  'Hurlingham',
  'Spring Valley',
  'Ridgeways',
  'Loresho',
  'Garden Estate',
  'Kasarani',
  'Ruaka',
] as const;

export const COMMON_AMENITIES = [
  { id: 'parking', name: 'Parking', icon: 'parking' },
  { id: 'security', name: '24/7 Security', icon: 'shield' },
  { id: 'water', name: 'Water Supply', icon: 'droplet' },
  { id: 'electricity', name: 'Electricity', icon: 'zap' },
  { id: 'wifi', name: 'Wi-Fi', icon: 'wifi' },
  { id: 'ac', name: 'Air Conditioning', icon: 'wind' },
  { id: 'generator', name: 'Backup Generator', icon: 'battery' },
  { id: 'cctv', name: 'CCTV Cameras', icon: 'camera' },
  { id: 'elevator', name: 'Elevator', icon: 'arrow-up' },
  { id: 'washroom', name: 'Washrooms', icon: 'droplet' },
] as const;

// ============================================
// TYPE GUARDS
// ============================================

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}

export function isProperty(obj: unknown): obj is Property {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'price' in obj &&
    'location' in obj
  );
}

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'role' in obj
  );
}

/**
 * Additional Type Exports
 * Add these to your existing frontend/types/index.ts file
 */

// Payment Types (add these if not already present)
export interface Payment {
  id: string;
  amount: number;
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  propertyId: string;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  criteria: SearchFilters;
  createdAt: string;
}

export interface Favorite {
  id: string;
  propertyId: string;
  property: Property;
  userId: string;
  createdAt: string;
}

export type UserRole = 'OWNER' | 'TENANT' | 'ADMIN';
export type InquiryStatus = 'PENDING' | 'RESPONDED' | 'CLOSED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

// export { PropertyType, PropertyStatus };