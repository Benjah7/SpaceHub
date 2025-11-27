import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  ApiError,
  Property,
  PaginatedResponse,
  User,
  Inquiry,
  Review,
  Notification,
  SavedSearch,
  DashboardStats,
  PropertyAnalytics,
  Payment,
  Message,
  Conversation,
  Appointment,
  AppointmentStatus,
  SearchCriteria,
  PaginationMeta,
  VerificationStats,
  VerificationUser,

} from '@/types';
import type {
  BackendApiResponse,
  BackendPaginatedResponse,
  BackendProperty,
  BackendUser,
  BackendInquiry,
  BackendReview,
  BackendAuthResponse,
  BackendNotification,
  BackendPayment,
  BackendDashboardStats,
  BackendSearchCriteria,
  BackendCreatePropertyDTO,
  BackendUpdatePropertyDTO,
  BackendMessage,
  BackendConversation,
  BackendAppointment,
} from '@/types/backend';
import {
  PropertyTransformer,
  UserTransformer,
  InquiryTransformer,
  ReviewTransformer,
  NotificationTransformer,
  PaginatedResponseTransformer,
  AppointmentTransformer,
  ConversationTransformer,
  MessageTransformer,
} from '@/lib/api/transformers';
import { PaymentTransformer } from '@/lib/api/transformers';

/**
 * Complete API Client with all backend integrations
 */
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          statusCode: error.response?.status || 500,
          errors: error.response?.data?.errors,
        };

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  public setAuthToken(token: string): void {
    this.setToken(token);
  }

  public clearAuthToken(): void {
    this.clearToken();
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  }

  // Generic methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.post<BackendApiResponse<BackendAuthResponse>>(
      '/auth/login',
      { email, password }
    );

    if (response.success && response.data) {
      const { user, token } = response.data;
      this.setToken(token);
      return {
        user: UserTransformer.toFrontend(user),
        token,
      };
    }

    throw new Error('Login failed');
  }

  /**
   * Register new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'OWNER' | 'TENANT';
  }): Promise<{ user: User; token: string }> {
    const response = await this.post<BackendApiResponse<BackendAuthResponse>>(
      '/auth/register',
      data
    );

    if (response.success && response.data) {
      const { user, token } = response.data;
      this.setToken(token);
      return {
        user: UserTransformer.toFrontend(user),
        token,
      };
    }

    throw new Error('Registration failed');
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<User | null> {
    try {
      const response = await this.get<BackendApiResponse<BackendUser>>('/auth/me');
      if (response.success && response.data) {
        return UserTransformer.toFrontend(response.data);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    name?: string;
    phone?: string;
    bio?: string;
  }): Promise<User> {
    const response = await this.put<BackendApiResponse<BackendUser>>('/auth/me', data);

    if (response.success && response.data) {
      return UserTransformer.toFrontend(response.data);
    }

    throw new Error('Profile update failed');
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.post<BackendApiResponse<BackendUser>>(
      '/auth/me/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return UserTransformer.toFrontend(response.data);
    }

    throw new Error('Image upload failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.post('/auth/logout');
    this.clearToken();
  }

  /**
   * Delete account
   */
  async deleteAccount(): Promise<void> {
    await this.delete('/auth/me');
    this.clearToken();
  }

  // ============================================
  // PROPERTY ENDPOINTS
  // ============================================

  /**
   * Get all properties with filters and pagination
   */
  async getProperties(params?: {
    page?: number;
    limit?: number;
    propertyType?: string;
    minRent?: number;
    maxRent?: number;
    neighborhood?: string;
    status?: string;
    ownerId?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Property>> {
    const response = await this.get<BackendPaginatedResponse<BackendProperty>>(
      '/properties',
      { params }
    );

    if (response.success && response.data) {
      return PaginatedResponseTransformer.toFrontend(
        response,
        PropertyTransformer.toFrontend
      );
    }

    throw new Error('Failed to fetch properties');
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: string): Promise<Property> {
    const response = await this.get<BackendApiResponse<BackendProperty>>(
      `/properties/${id}`
    );

    if (response.success && response.data) {
      return PropertyTransformer.toFrontend(response.data);
    }

    throw new Error('Property not found');
  }

  /**
   * Create new property
   */
  async createProperty(data: BackendCreatePropertyDTO): Promise<Property> {
    const response = await this.post<BackendApiResponse<BackendProperty>>(
      '/properties',
      data
    );

    if (response.success && response.data) {
      return PropertyTransformer.toFrontend(response.data);
    }

    throw new Error('Failed to create property');
  }

  /**
   * Update property
   */
  async updateProperty(
    id: string,
    data: BackendUpdatePropertyDTO
  ): Promise<Property> {
    const response = await this.put<BackendApiResponse<BackendProperty>>(
      `/properties/${id}`,
      data
    );

    if (response.success && response.data) {
      return PropertyTransformer.toFrontend(response.data);
    }

    throw new Error('Failed to update property');
  }

  /**
   * Delete property
   */
  async deleteProperty(id: string): Promise<void> {
    await this.delete(`/properties/${id}`);
  }

  /**
   * Upload property images
   */
  async uploadPropertyImages(
    propertyId: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    await this.post(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  }

  /**
   * Delete property image
   */
  async deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
    await this.delete(`/properties/${propertyId}/images/${imageId}`);
  }

  /**
   * Set primary property image
   */
  async setPrimaryImage(propertyId: string, imageId: string): Promise<void> {
    await this.patch(`/properties/${propertyId}/images/${imageId}/primary`);
  }

  // ============================================
  // SEARCH ENDPOINTS
  // ============================================

  /**
   * Search properties with advanced criteria
   */
  async searchProperties(
    criteria: BackendSearchCriteria
  ): Promise<PaginatedResponse<Property>> {
    const response = await this.post<BackendPaginatedResponse<BackendProperty>>(
      '/search',
      criteria
    );

    if (response.success && response.data) {
      return PaginatedResponseTransformer.toFrontend(
        response,
        PropertyTransformer.toFrontend
      );
    }

    throw new Error('Search failed');
  }

  /**
   * Search properties by location
   */
  async searchByLocation(params: {
    latitude: number;
    longitude: number;
    radius: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Property>> {
    const response = await this.get<BackendPaginatedResponse<BackendProperty>>(
      '/search/location',
      { params }
    );

    if (response.success && response.data) {
      return PaginatedResponseTransformer.toFrontend(
        response,
        PropertyTransformer.toFrontend
      );
    }

    throw new Error('Location search failed');
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    const response = await this.get<BackendApiResponse<BackendProperty[]>>(
      '/properties/featured',
      { params: { limit } }
    );

    if (response.success && response.data) {
      return response.data.map(PropertyTransformer.toFrontend);
    }

    return [];
  }

  // ============================================
  // INQUIRY ENDPOINTS
  // ============================================

  /**
   * Create new inquiry
   */
  async createInquiry(data: {
    propertyId: string;
    message: string;
    preferredViewingDate?: string;
  }): Promise<Inquiry> {
    const response = await this.post<BackendApiResponse<BackendInquiry>>(
      '/inquiries',
      {
        propertyId: parseInt(data.propertyId),
        message: data.message,
        preferredViewingDate: data.preferredViewingDate,
      }
    );

    if (response.success && response.data) {
      return InquiryTransformer.toFrontend(response.data);
    }

    throw new Error('Failed to create inquiry');
  }

  /**
   * Get user's inquiries
   */
  async getMyInquiries(): Promise<Inquiry[]> {
    const response = await this.get<BackendApiResponse<BackendInquiry[]>>('/inquiries');

    if (response.success && response.data) {
      return response.data.map(InquiryTransformer.toFrontend);
    }

    return [];
  }

  /**
   * Get received inquiries (for property owners)
   */
  async getReceivedInquiries(): Promise<Inquiry[]> {
    const response = await this.get<BackendApiResponse<BackendInquiry[]>>(
      '/inquiries/received'
    );

    if (response.success && response.data) {
      return response.data.map(InquiryTransformer.toFrontend);
    }

    return [];
  }

  /**
   * Get inquiries for a specific property
   */
  async getPropertyInquiries(propertyId: string): Promise<Inquiry[]> {
    const response = await this.get<BackendApiResponse<BackendInquiry[]>>(
      `/properties/${propertyId}/inquiries`
    );

    if (response.success && response.data) {
      return response.data.map(InquiryTransformer.toFrontend);
    }

    return [];
  }

  /**
   * Respond to inquiry
   */
  async respondToInquiry(
    inquiryId: string,
    response: string,
    status?: 'RESPONDED' | 'CLOSED'
  ): Promise<Inquiry> {
    const result = await this.put<BackendApiResponse<BackendInquiry>>(
      `/inquiries/${inquiryId}/respond`,
      { response, status }
    );

    if (result.success && result.data) {
      return InquiryTransformer.toFrontend(result.data);
    }

    throw new Error('Failed to respond to inquiry');
  }

  /**
   * Delete inquiry
   */
  async deleteInquiry(inquiryId: string): Promise<void> {
    await this.delete(`/inquiries/${inquiryId}`);
  }

  // ============================================
  // REVIEW ENDPOINTS
  // ============================================

  /**
   * Create review
   */
  async createReview(data: {
    propertyId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const response = await this.post<BackendApiResponse<BackendReview>>('/reviews', {
      propertyId: parseInt(data.propertyId),
      rating: data.rating,
      comment: data.comment,
    });

    if (response.success && response.data) {
      return ReviewTransformer.toFrontend(response.data);
    }

    throw new Error('Failed to create review');
  }

  /**
   * Get property reviews
   */
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await this.get<BackendApiResponse<BackendReview[]>>(
      `/properties/${propertyId}/reviews`
    );

    if (response.success && response.data) {
      return response.data.map(ReviewTransformer.toFrontend);
    }

    return [];
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<Review> {
    const response = await this.put<BackendApiResponse<BackendReview>>(
      `/reviews/${reviewId}`,
      data
    );

    if (response.success && response.data) {
      return ReviewTransformer.toFrontend(response.data);
    }

    throw new Error('Failed to update review');
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<void> {
    await this.delete(`/reviews/${reviewId}`);
  }

  // ============================================
  // FAVORITES ENDPOINTS
  // ============================================

  /**
   * Get user favorites
   */
  async getFavorites(): Promise<Property[]> {
    const response = await this.get<BackendApiResponse<BackendProperty[]>>('/favorites');

    if (response.success && response.data) {
      return response.data.map(PropertyTransformer.toFrontend);
    }

    return [];
  }

  /**
   * Add to favorites
   */
  async addFavorite(propertyId: string): Promise<void> {
    await this.post(`/favorites/${propertyId}`);
  }

  /**
   * Remove from favorites
   */
  async removeFavorite(propertyId: string): Promise<void> {
    await this.delete(`/favorites/${propertyId}`);
  }

  /**
   * Check if property is favorited
   */
  async checkFavorite(propertyId: string): Promise<boolean> {
    const response = await this.get<BackendApiResponse<{ isFavorite: boolean }>>(
      `/favorites/check/${propertyId}`
    );

    return response.success && response.data ? response.data.isFavorite : false;
  }

  // ============================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================

  /**
   * Get notifications
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const response = await this.get<BackendPaginatedResponse<BackendNotification>>(
      '/notifications',
      { params }
    );

    if (response.success && response.data) {
      return PaginatedResponseTransformer.toFrontend(
        response,
        NotificationTransformer.toFrontend
      );
    }

    throw new Error('Failed to fetch notifications');
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(): Promise<number> {
    const response = await this.get<BackendApiResponse<{ count: number }>>(
      '/notifications/unread/count'
    );

    return response.success && response.data ? response.data.count : 0;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await this.put('/notifications/read-all');
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.delete(`/notifications/${notificationId}`);
  }

  // ============================================
  // SAVED SEARCHES ENDPOINTS
  // ============================================

  /**
   * Create saved search
   */
  async createSavedSearch(data: {
    name: string;
    criteria: SearchCriteria;
  }): Promise<SavedSearch> {
    const response = await this.post<BackendApiResponse<any>>(
      '/saved-searches',
      data
    );

    if (response.success && response.data) {
      return {
        id: String(response.data.id),
        name: response.data.name,
        criteria: response.data.criteria,
        createdAt: response.data.createdAt,
      };
    }

    throw new Error('Failed to create saved search');
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    const response = await this.get<BackendApiResponse<any[]>>('/saved-searches');

    if (response.success && response.data) {
      return response.data.map((item) => ({
        id: String(item.id),
        name: item.name,
        criteria: item.criteria,
        createdAt: item.createdAt,
      }));
    }

    return [];
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    searchId: string,
    data: { name?: string; criteria?: SearchCriteria }
  ): Promise<SavedSearch> {
    const response = await this.put<BackendApiResponse<any>>(
      `/saved-searches/${searchId}`,
      data
    );

    if (response.success && response.data) {
      return {
        id: String(response.data.id),
        name: response.data.name,
        criteria: response.data.criteria,
        createdAt: response.data.createdAt,
      };
    }

    throw new Error('Failed to update saved search');
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    await this.delete(`/saved-searches/${searchId}`);
  }

  // ============================================
  // ANALYTICS ENDPOINTS
  // ============================================

  /**
   * Get owner dashboard stats
   */
  async getOwnerDashboard(): Promise<DashboardStats> {
    const response = await this.get<BackendApiResponse<BackendDashboardStats>>(
      '/analytics/dashboard'
    );

    if (response.success && response.data) {
      return {
        activeListings: response.data.activeListings,
        totalInquiries: response.data.totalInquiries,
        totalViews: response.data.totalViews,
        bookedProperties: 0, // Add when backend supports this
        monthlyRevenue: parseFloat(response.data.totalRevenue),
        recentActivity: [], // Add when backend supports this
      };
    }

    throw new Error('Failed to fetch dashboard stats');
  }

  /**
   * Get property analytics
   */
  async getPropertyAnalytics(propertyId: string): Promise<PropertyAnalytics> {
    const response = await this.get<BackendApiResponse<any>>(
      `/analytics/property/${propertyId}`
    );

    if (response.success && response.data) {
      return {
        propertyId,
        views: response.data.views || 0,
        inquiries: response.data.inquiries || 0,
        favorites: response.data.favorites || 0,                    // ← ADD THIS
        bookings: response.data.bookings || 0,
        revenue: response.data.revenue || 0,
        viewsOverTime: response.data.viewsOverTime || [],
        inquiriesOverTime: response.data.inquiriesOverTime || [],   // ← ADD THIS
        inquiriesBySource: response.data.inquiriesBySource || [],
        conversionRate: response.data.conversionRate || 0,          // ← ADD THIS
      };
    }

    throw new Error('Failed to fetch property analytics');
  }
  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================

  /**
   * Initiate M-Pesa payment
   */
  async initiatePayment(data: {
    propertyId: string;
    amount: number;
    phoneNumber: string;
  }): Promise<Payment> {
    const response = await this.post<BackendApiResponse<BackendPayment>>(
      '/payments/initiate',
      {
        propertyId: parseInt(data.propertyId),
        amount: data.amount,
        phoneNumber: data.phoneNumber,
      }
    );

    if (response.success && response.data) {
      return {
        id: String(response.data.id),
        amount: parseFloat(response.data.amount),
        phoneNumber: response.data.phoneNumber,
        mpesaReceiptNumber: response.data.mpesaReceiptNumber,
        status: PaymentTransformer.mapPaymentStatus(response.data.status),
        propertyId: String(response.data.propertyId),
        createdAt: response.data.createdAt,
      };
    }

    throw new Error('Failed to initiate payment');
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    const response = await this.get<BackendApiResponse<BackendPayment>>(
      `/payments/${paymentId}`
    );

    if (response.success && response.data) {
      return {
        id: String(response.data.id),
        amount: parseFloat(response.data.amount),
        phoneNumber: response.data.phoneNumber,
        mpesaReceiptNumber: response.data.mpesaReceiptNumber,
        status: PaymentTransformer.mapPaymentStatus(response.data.status),
        propertyId: String(response.data.propertyId),
        createdAt: response.data.createdAt,
      };
    }

    throw new Error('Failed to fetch payment status');
  }

  /**
   * Get user payments
   */
  async getMyPayments(): Promise<Payment[]> {
    const response = await this.get<BackendApiResponse<BackendPayment[]>>('/payments');

    if (response.success && response.data) {
      return response.data.map((payment) => ({
        id: String(payment.id),
        amount: parseFloat(payment.amount),
        phoneNumber: payment.phoneNumber,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        status: PaymentTransformer.mapPaymentStatus(payment.status),
        propertyId: String(payment.propertyId),
        createdAt: payment.createdAt,
      }));
    }

    return [];
  }

  // ============================================
  // NEIGHBORHOOD ENDPOINTS
  // ============================================

  /**
   * Get neighborhoods
   */
  async getNeighborhoods(): Promise<string[]> {
    const response = await this.get<BackendApiResponse<string[]>>('/neighborhoods');

    if (response.success && response.data) {
      return response.data;
    }

    return [];
  }

  /**
   * Get neighborhood insights
   */
  async getNeighborhoodInsights(neighborhood: string): Promise<any> {
    const response = await this.get<BackendApiResponse<any>>(
      `/neighborhoods/${encodeURIComponent(neighborhood)}/insights`
    );

    if (response.success && response.data) {
      return response.data;
    }

    return null;
  }

  // ============================================
  // DOCUMENT ENDPOINTS
  // ============================================

  /**
   * Upload document
   */
  async uploadDocument(
    file: File,
    documentType: string,
    propertyId?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType); // Already fixed
    if (propertyId) {
      formData.append('propertyId', propertyId);
    }

    const response = await this.post<BackendApiResponse<any>>(
      '/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      // Transform backend format to frontend format
      return this.transformDocument(response.data);
    }

    throw new Error('Failed to upload document');
  }

  // Add this transformation method
  private transformDocument(backendDoc: any): any {
    return {
      id: String(backendDoc.id),
      fileName: backendDoc.filename, // Backend uses 'filename'
      fileType: backendDoc.type,
      fileSize: 0, // Backend doesn't store file size
      url: backendDoc.url,
      documentType: backendDoc.type,
      propertyId: backendDoc.propertyId ? String(backendDoc.propertyId) : undefined,
      userId: String(backendDoc.userId),
      uploadedAt: backendDoc.createdAt, // Map createdAt to uploadedAt
    };
  }

  /**
   * Get user documents
   */
  async getMyDocuments(): Promise<any[]> {
    const response = await this.get<BackendApiResponse<any[]>>('/documents');
    if (response.success && response.data) {
      return response.data.map(doc => this.transformDocument(doc));
    }
    return [];
  }

  async getPropertyDocuments(propertyId: string): Promise<any[]> {
    const response = await this.get<BackendApiResponse<any[]>>(
      `/documents/property/${propertyId}`
    );
    if (response.success && response.data) {
      return response.data.map(doc => this.transformDocument(doc));
    }
    return [];
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.delete(`/documents/${documentId}`);
  }

  // ============================================
  // MESSAGING ENDPOINTS
  // ============================================

  async createConversation(data: {
    participantId: string;
    propertyId?: string;
  }): Promise<Conversation> {
    const response = await this.post<BackendApiResponse<BackendConversation>>(
      '/messages/conversations',
      {
        participantId: parseInt(data.participantId),
        propertyId: data.propertyId ? parseInt(data.propertyId) : undefined,
      }
    );

    if (response.success && response.data) {
      return ConversationTransformer.toFrontend(response.data);
    }
    throw new Error('Failed to create conversation');
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await this.get<BackendApiResponse<BackendConversation[]>>(
      '/messages/conversations'
    );
    if (response.success && response.data) {
      return response.data.map(ConversationTransformer.toFrontend);
    }
    return [];
  }

  async getMessages(
    conversationId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Message>> {
    const response = await this.get<{
      success: boolean;
      data: {
        data: BackendMessage[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    }>(`/messages/conversations/${conversationId}/messages`, { params });

    if (response.success && response.data) {
      return {
        data: response.data.data.map(MessageTransformer.toFrontend),
        pagination: response.data.pagination,
      };
    }
    throw new Error('Failed to fetch messages');
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await this.post<BackendApiResponse<BackendMessage>>(
      `/messages/conversations/${conversationId}/messages`,
      { content }
    );
    if (response.success && response.data) {
      return MessageTransformer.toFrontend(response.data);
    }
    throw new Error('Failed to send message');
  }

  async markMessagesAsRead(conversationId: string): Promise<void> {
    await this.put(`/messages/conversations/${conversationId}/read`);
  }

  async getUnreadMessageCount(): Promise<number> {
    const response = await this.get<BackendApiResponse<{ count: number }>>(
      '/messages/unread/count'
    );
    return response.success && response.data ? response.data.count : 0;
  }

  // ============================================
  // APPOINTMENT ENDPOINTS
  // ============================================

  async createAppointment(data: {
    propertyId: string;
    scheduledDate: string;
    notes?: string;
  }): Promise<Appointment> {
    const response = await this.post<BackendApiResponse<BackendAppointment>>(
      '/appointments',
      {
        propertyId: parseInt(data.propertyId),
        scheduledDate: data.scheduledDate,
        notes: data.notes,
      }
    );
    if (response.success && response.data) {
      return AppointmentTransformer.toFrontend(response.data);
    }
    throw new Error('Failed to create appointment');
  }

  async getAppointments(params?: {
    status?: AppointmentStatus;
    role?: 'tenant' | 'owner';
  }): Promise<Appointment[]> {
    const response = await this.get<BackendApiResponse<BackendAppointment[]>>(
      '/appointments',
      { params }
    );
    if (response.success && response.data) {
      return response.data.map(AppointmentTransformer.toFrontend);
    }
    return [];
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response = await this.get<BackendApiResponse<BackendAppointment>>(
      `/appointments/${id}`
    );
    if (response.success && response.data) {
      return AppointmentTransformer.toFrontend(response.data);
    }
    throw new Error('Appointment not found');
  }

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    cancellationReason?: string
  ): Promise<Appointment> {
    const response = await this.put<BackendApiResponse<BackendAppointment>>(
      `/appointments/${id}/status`,
      { status, cancellationReason }
    );
    if (response.success && response.data) {
      return AppointmentTransformer.toFrontend(response.data);
    }
    throw new Error('Failed to update appointment');
  }

  async deleteAppointment(id: string): Promise<void> {
    await this.delete(`/appointments/${id}`);
  }

  async getUpcomingAppointmentsCount(): Promise<number> {
    const response = await this.get<BackendApiResponse<{ count: number }>>(
      '/appointments/upcoming/count'
    );
    return response.success && response.data ? response.data.count : 0;
  }

  /**
 * Search properties by map bounds
 */
  async searchPropertiesByBounds(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
    filters?: {
      propertyType?: string;
      minRent?: number;
      maxRent?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<{ properties: Property[]; pagination: PaginationMeta }> {
    const params: any = {
      minLat,
      minLng,
      maxLat,
      maxLng,
      ...filters,
    };

    const response = await this.get<BackendPaginatedResponse<BackendProperty>>(
      '/search/bounds',
      { params }
    );

    if (response.success && response.data) {
      return {
        properties: response.data.map(PropertyTransformer.toFrontend),
        pagination: response.pagination,
      };
    }

    return {
      properties: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * Search properties by radius
   */
  async searchPropertiesByRadius(
    latitude: number,
    longitude: number,
    radius: number,
    filters?: {
      propertyType?: string;
      minRent?: number;
      maxRent?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<{ properties: Property[]; pagination: PaginationMeta }> {
    const params: any = {
      lat: latitude,
      lng: longitude,
      radius,
      ...filters,
    };

    const response = await this.get<BackendPaginatedResponse<BackendProperty>>(
      '/search/radius',
      { params }
    );

    if (response.success && response.data) {
      return {
        properties: response.data.map(PropertyTransformer.toFrontend),
        pagination: response.pagination,
      };
    }

    return {
      properties: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Verification endpoints
  async getPendingVerifications(): Promise<VerificationUser[]> {
    const response = await this.get<BackendApiResponse<any[]>>('/verification/pending');
    if (response.success && response.data) {
      return response.data.map(user => ({
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
        documents: user.documents || [],
        properties: user.properties || []
      }));
    }
    return [];
  }

  async getAllVerifications(status?: string): Promise<VerificationUser[]> {
    const endpoint = status ? `/verification/all?status=${status}` : '/verification/all';
    const response = await this.get<BackendApiResponse<any[]>>(endpoint);
    if (response.success && response.data) {
      return response.data.map(user => ({
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        verificationStatus: user.verificationStatus,
        createdAt: user.createdAt,
        documents: user.documents || [],
        properties: user.properties || []
      }));
    }
    return [];
  }

  async getVerificationStats(): Promise<VerificationStats> {
    const response = await this.get<BackendApiResponse<VerificationStats>>('/verification/stats');
    if (response.success && response.data) {
      return response.data;
    }
    return {
      unverified: 0,
      pending: 0,
      verified: 0,
      rejected: 0,
      total: 0
    };
  }

  async approveVerification(userId: string, notes?: string): Promise<void> {
    await this.post(`/verification/${userId}/approve`, { notes });
  }

  async rejectVerification(userId: string, reason: string): Promise<void> {
    await this.post(`/verification/${userId}/reject`, { reason });
  }

  async requestVerification(): Promise<void> {
    await this.post('/verification/request');
  }
}




export const apiClient = new ApiClient();