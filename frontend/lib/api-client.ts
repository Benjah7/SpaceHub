import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, ApiError, Property, PaginatedResponse, User, Inquiry, Review } from '@/types';
import type { 
  BackendApiResponse, 
  BackendPaginatedResponse, 
  BackendProperty,
  BackendUser,
  BackendInquiry,
  BackendReview,
  BackendAuthResponse,
} from '@/types/backend';
import { 
  PropertyTransformer, 
  UserTransformer, 
  InquiryTransformer,
  ReviewTransformer,
  PaginatedResponseTransformer 
} from '@/lib/api/transformers';

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

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
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

  // Auth endpoints
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

  // Property endpoints
  async getProperties(params?: {
    page?: number;
    limit?: number;
    propertyType?: string;
    minRent?: number;
    maxRent?: number;
    neighborhood?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Property>> {
    const response = await this.get<BackendPaginatedResponse<BackendProperty>>(
      '/properties',
      { params }
    );

    if (response.success && response.data) {
      return PaginatedResponseTransformer.toFrontend(
        { data: response.data, pagination: response.pagination },
        PropertyTransformer.toFrontend
      );
    }

    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const response = await this.get<BackendApiResponse<BackendProperty>>(
      `/properties/${id}`
    );

    if (response.success && response.data) {
      return PropertyTransformer.toFrontend(response.data);
    }

    return null;
  }

  async createProperty(data: Partial<Property>): Promise<Property | null> {
    const backendData = PropertyTransformer.toBackendCreate(data);
    
    const response = await this.post<BackendApiResponse<BackendProperty>>(
      '/properties',
      backendData
    );

    if (response.success && response.data) {
      return PropertyTransformer.toFrontend(response.data);
    }

    return null;
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property | null> {
    const backendData = PropertyTransformer.toBackendUpdate(data);
    
    const response = await this.put<BackendApiResponse<BackendProperty>>(
      `/properties/${id}`,
      backendData
    );

    if (response.success && response.data) {
      return PropertyTransformer.toFrontend(response.data);
    }

    return null;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const response = await this.delete<BackendApiResponse<void>>(
      `/properties/${id}`
    );

    return response.success;
  }

  async searchProperties(params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    minRent?: number;
    maxRent?: number;
    propertyType?: string;
    neighborhood?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Property>> {
    const response = await this.get<BackendPaginatedResponse<BackendProperty>>(
      '/search',
      { params }
    );

    if (response.success && response.data) {
      return PaginatedResponseTransformer.toFrontend(
        { data: response.data, pagination: response.pagination },
        PropertyTransformer.toFrontend
      );
    }

    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }

  // Inquiry endpoints
  async createInquiry(data: {
    propertyId: string;
    message: string;
    preferredViewingDate?: string;
  }): Promise<Inquiry | null> {
    const propertyId = parseInt(data.propertyId);
    const backendData = InquiryTransformer.toBackendCreate(
      propertyId,
      data.message,
      data.preferredViewingDate
    );

    const response = await this.post<BackendApiResponse<BackendInquiry>>(
      '/inquiries',
      backendData
    );

    if (response.success && response.data) {
      return InquiryTransformer.toFrontend(response.data);
    }

    return null;
  }

  async getMyInquiries(): Promise<Inquiry[]> {
    const response = await this.get<BackendApiResponse<BackendInquiry[]>>(
      '/inquiries/my-inquiries'
    );

    if (response.success && response.data) {
      return response.data.map(InquiryTransformer.toFrontend);
    }

    return [];
  }

  async getPropertyInquiries(propertyId: string): Promise<Inquiry[]> {
    const response = await this.get<BackendApiResponse<BackendInquiry[]>>(
      `/inquiries/property/${propertyId}`
    );

    if (response.success && response.data) {
      return response.data.map(InquiryTransformer.toFrontend);
    }

    return [];
  }

  async respondToInquiry(id: string, response: string): Promise<Inquiry | null> {
    const backendResponse = await this.patch<BackendApiResponse<BackendInquiry>>(
      `/inquiries/${id}/respond`,
      { response }
    );

    if (backendResponse.success && backendResponse.data) {
      return InquiryTransformer.toFrontend(backendResponse.data);
    }

    return null;
  }

  // Review endpoints
  async createReview(data: {
    propertyId: string;
    rating: number;
    comment: string;
  }): Promise<Review | null> {
    const propertyId = parseInt(data.propertyId);
    const backendData = ReviewTransformer.toBackendCreate(
      propertyId,
      data.rating,
      data.comment
    );

    const response = await this.post<BackendApiResponse<BackendReview>>(
      '/reviews',
      backendData
    );

    if (response.success && response.data) {
      return ReviewTransformer.toFrontend(response.data);
    }

    return null;
  }

  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const response = await this.get<BackendApiResponse<BackendReview[]>>(
      `/reviews/property/${propertyId}`
    );

    if (response.success && response.data) {
      return response.data.map(ReviewTransformer.toFrontend);
    }

    return [];
  }

  // File upload
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  async uploadPropertyImages(
    propertyId: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    return this.request<any>({
      method: 'POST',
      url: `/properties/${propertyId}/images`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Payment endpoints
  async initiatePayment(data: {
    propertyId: string;
    amount: number;
    phoneNumber: string;
  }): Promise<any> {
    const response = await this.post<any>('/payments/initiate', data);
    return response;
  }

  async checkPaymentStatus(checkoutRequestId: string): Promise<any> {
    const response = await this.get<any>(`/payments/status/${checkoutRequestId}`);
    return response;
  }

  // Auth helpers
  setAuthToken(token: string): void {
    this.setToken(token);
  }

  clearAuthToken(): void {
    this.clearToken();
  }

  getAuthToken(): string | null {
    return this.getToken();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();