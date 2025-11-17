import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import type {
  Property,
  PaginatedResponse,
  Inquiry,
  Review,
  Notification,
  DashboardStats,
  PropertyAnalytics,
  Payment,
  SavedSearch,
} from '@/types';
import type { BackendSearchCriteria } from '@/types/backend';

/**
 * Hook state interface
 */
interface UseDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UsePaginatedDataState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
}

// ============================================
// PROPERTY HOOKS
// ============================================

/**
 * Hook to fetch properties with pagination and filters
 */
export function useProperties(params?: {
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
}) {
  const [state, setState] = useState<UsePaginatedDataState<Property>>({
    data: [],
    loading: true,
    error: null,
    page: params?.page || 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });

  const fetchProperties = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.getProperties(params);
      setState({
        data: response.data,
        loading: false,
        error: null,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch properties');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
      ErrorHandler.handle(error);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    ...state,
    refetch: fetchProperties,
  };
}

/**
 * Hook to fetch a single property by ID
 */
export function useProperty(propertyId: string | null) {
  const [state, setState] = useState<UseDataState<Property>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchProperty = useCallback(async () => {
    if (!propertyId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const property = await apiClient.getPropertyById(propertyId);
      setState({
        data: property,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch property');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  return {
    ...state,
    refetch: fetchProperty,
  };
}

/**
 * Hook to fetch featured properties
 */
export function useFeaturedProperties(limit: number = 6) {
  const [state, setState] = useState<UseDataState<Property[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchFeatured = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const properties = await apiClient.getFeaturedProperties(limit);
      setState({
        data: properties,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch featured properties');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    ...state,
    refetch: fetchFeatured,
  };
}

/**
 * Hook to search properties
 */
export function usePropertySearch(criteria: BackendSearchCriteria) {
  const [state, setState] = useState<UsePaginatedDataState<Property>>({
    data: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });

  const search = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.searchProperties(criteria);
      setState({
        data: response.data,
        loading: false,
        error: null,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Search failed');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
      ErrorHandler.handle(error);
    }
  }, [JSON.stringify(criteria)]);

  return {
    ...state,
    search,
  };
}

// ============================================
// INQUIRY HOOKS
// ============================================

/**
 * Hook to fetch user's inquiries
 */
export function useMyInquiries() {
  const [state, setState] = useState<UseDataState<Inquiry[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchInquiries = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const inquiries = await apiClient.getMyInquiries();
      setState({
        data: inquiries,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch inquiries');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return {
    ...state,
    refetch: fetchInquiries,
  };
}

/**
 * Hook to fetch received inquiries (for property owners)
 */
export function useReceivedInquiries() {
  const [state, setState] = useState<UseDataState<Inquiry[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchInquiries = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const inquiries = await apiClient.getReceivedInquiries();
      setState({
        data: inquiries,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch inquiries');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return {
    ...state,
    refetch: fetchInquiries,
  };
}

/**
 * Hook to fetch property inquiries
 */
export function usePropertyInquiries(propertyId: string | null) {
  const [state, setState] = useState<UseDataState<Inquiry[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchInquiries = useCallback(async () => {
    if (!propertyId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const inquiries = await apiClient.getPropertyInquiries(propertyId);
      setState({
        data: inquiries,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch inquiries');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return {
    ...state,
    refetch: fetchInquiries,
  };
}

// ============================================
// REVIEW HOOKS
// ============================================

/**
 * Hook to fetch property reviews
 */
export function usePropertyReviews(propertyId: string | null) {
  const [state, setState] = useState<UseDataState<Review[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchReviews = useCallback(async () => {
    if (!propertyId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const reviews = await apiClient.getPropertyReviews(propertyId);
      setState({
        data: reviews,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch reviews');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    ...state,
    refetch: fetchReviews,
  };
}

// ============================================
// FAVORITE HOOKS
// ============================================

/**
 * Hook to fetch user's favorites
 */
export function useFavorites() {
  const [state, setState] = useState<UseDataState<Property[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchFavorites = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const favorites = await apiClient.getFavorites();
      setState({
        data: favorites,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch favorites');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (propertyId: string, isFavorite: boolean) => {
      try {
        if (isFavorite) {
          await apiClient.removeFavorite(propertyId);
        } else {
          await apiClient.addFavorite(propertyId);
        }
        await fetchFavorites();
      } catch (error) {
        ErrorHandler.handle(error);
        throw error;
      }
    },
    [fetchFavorites]
  );

  return {
    ...state,
    refetch: fetchFavorites,
    toggleFavorite,
  };
}

/**
 * Hook to check if a property is favorited
 */
export function useIsFavorite(propertyId: string | null) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!propertyId) {
        setIsFavorite(false);
        setLoading(false);
        return;
      }

      try {
        const result = await apiClient.checkFavorite(propertyId);
        setIsFavorite(result);
      } catch (error) {
        ErrorHandler.handle(error);
      } finally {
        setLoading(false);
      }
    };

    checkFavorite();
  }, [propertyId]);

  const toggleFavorite = useCallback(async () => {
    if (!propertyId) return;

    try {
      if (isFavorite) {
        await apiClient.removeFavorite(propertyId);
      } else {
        await apiClient.addFavorite(propertyId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      ErrorHandler.handle(error);
      throw error;
    }
  }, [propertyId, isFavorite]);

  return {
    isFavorite,
    loading,
    toggleFavorite,
  };
}

// ============================================
// NOTIFICATION HOOKS
// ============================================

/**
 * Hook to fetch notifications
 */
export function useNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const [state, setState] = useState<UsePaginatedDataState<Notification>>({
    data: [],
    loading: true,
    error: null,
    page: params?.page || 1,
    totalPages: 1,
    total: 0,
    hasMore: false,
  });

  const fetchNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.getNotifications(params);
      setState({
        data: response.data,
        loading: false,
        error: null,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.totalPages,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch notifications');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err,
      }));
      ErrorHandler.handle(error);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    ...state,
    refetch: fetchNotifications,
  };
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      const result = await apiClient.getUnreadNotificationCount();
      setCount(result);
    } catch (error) {
      ErrorHandler.handle(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    loading,
    refetch: fetchCount,
  };
}

// ============================================
// ANALYTICS HOOKS
// ============================================

/**
 * Hook to fetch owner dashboard stats
 */
export function useOwnerDashboard() {
  const [state, setState] = useState<UseDataState<DashboardStats>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const stats = await apiClient.getOwnerDashboard();
      setState({
        data: stats,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch dashboard stats');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refetch: fetchStats,
  };
}

/**
 * Hook to fetch property analytics
 */
export function usePropertyAnalytics(propertyId: string | null) {
  const [state, setState] = useState<UseDataState<PropertyAnalytics>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchAnalytics = useCallback(async () => {
    if (!propertyId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const analytics = await apiClient.getPropertyAnalytics(propertyId);
      setState({
        data: analytics,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch analytics');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    ...state,
    refetch: fetchAnalytics,
  };
}

// ============================================
// PAYMENT HOOKS
// ============================================

/**
 * Hook to fetch user payments
 */
export function useMyPayments() {
  const [state, setState] = useState<UseDataState<Payment[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchPayments = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const payments = await apiClient.getMyPayments();
      setState({
        data: payments,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch payments');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    ...state,
    refetch: fetchPayments,
  };
}

// ============================================
// SAVED SEARCH HOOKS
// ============================================

/**
 * Hook to fetch saved searches
 */
export function useSavedSearches() {
  const [state, setState] = useState<UseDataState<SavedSearch[]>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchSearches = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const searches = await apiClient.getSavedSearches();
      setState({
        data: searches,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch saved searches');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, []);

  useEffect(() => {
    fetchSearches();
  }, [fetchSearches]);

  return {
    ...state,
    refetch: fetchSearches,
  };
}

// ============================================
// NEIGHBORHOOD HOOKS
// ============================================

/**
 * Hook to fetch neighborhoods
 */
export function useNeighborhoods() {
  const [state, setState] = useState<UseDataState<string[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const neighborhoods = await apiClient.getNeighborhoods();
        setState({
          data: neighborhoods,
          loading: false,
          error: null,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to fetch neighborhoods');
        setState({
          data: null,
          loading: false,
          error: err,
        });
        ErrorHandler.handle(error);
      }
    };

    fetchNeighborhoods();
  }, []);

  return state;
}

/**
 * Hook to fetch neighborhood insights
 */
export function useNeighborhoodInsights(neighborhood: string | null) {
  const [state, setState] = useState<UseDataState<any>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchInsights = useCallback(async () => {
    if (!neighborhood) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const insights = await apiClient.getNeighborhoodInsights(neighborhood);
      setState({
        data: insights,
        loading: false,
        error: null,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch insights');
      setState({
        data: null,
        loading: false,
        error: err,
      });
      ErrorHandler.handle(error);
    }
  }, [neighborhood]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    ...state,
    refetch: fetchInsights,
  };
}
