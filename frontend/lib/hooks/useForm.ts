import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import type {
  Property,
  Inquiry,
  Review,
  User,
  Payment,
  SavedSearch,
} from '@/types';
import type {
  BackendCreatePropertyDTO,
  BackendUpdatePropertyDTO,
  BackendSearchCriteria,
} from '@/types/backend';

/**
 * Generic form state interface
 */
interface FormState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

// ============================================
// PROPERTY FORM HOOKS
// ============================================

/**
 * Hook for creating a new property
 */
export function useCreateProperty() {
  const router = useRouter();
  const [state, setState] = useState<FormState<Property>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const createProperty = useCallback(
    async (data: BackendCreatePropertyDTO) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const property = await apiClient.createProperty(data);
        setState({
          data: property,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Property created successfully!');
        return property;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to create property');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to create property');
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    createProperty,
    reset,
  };
}

/**
 * Hook for updating a property
 */
export function useUpdateProperty(propertyId: string) {
  const [state, setState] = useState<FormState<Property>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const updateProperty = useCallback(
    async (data: BackendUpdatePropertyDTO) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const property = await apiClient.updateProperty(propertyId, data);
        setState({
          data: property,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Property updated successfully!');
        return property;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to update property');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to update property');
        throw error;
      }
    },
    [propertyId]
  );

  return {
    ...state,
    updateProperty,
  };
}

/**
 * Hook for deleting a property
 */
export function useDeleteProperty() {
  const router = useRouter();
  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
    success: false,
  });

  const deleteProperty = useCallback(
    async (propertyId: string) => {
      setState({ loading: true, error: null, success: false });

      try {
        await apiClient.deleteProperty(propertyId);
        setState({
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Property deleted successfully!');
        router.push('/dashboard/properties');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to delete property');
        setState({
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to delete property');
        throw error;
      }
    },
    [router]
  );

  return {
    ...state,
    deleteProperty,
  };
}

/**
 * Hook for uploading property images
 */
export function usePropertyImageUpload(propertyId: string) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadImages = useCallback(
    async (files: File[]) => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        await apiClient.uploadPropertyImages(propertyId, files, (prog) => {
          setProgress(prog);
        });
        setUploading(false);
        setProgress(100);
        toast.success('Images uploaded successfully!');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to upload images');
        setError(err);
        setUploading(false);
        ErrorHandler.handle(error, 'Failed to upload images');
        throw error;
      }
    },
    [propertyId]
  );

  const deleteImage = useCallback(
    async (imageId: string) => {
      try {
        await apiClient.deletePropertyImage(propertyId, imageId);
        toast.success('Image deleted successfully!');
      } catch (error) {
        ErrorHandler.handle(error, 'Failed to delete image');
        throw error;
      }
    },
    [propertyId]
  );

  const setPrimaryImage = useCallback(
    async (imageId: string) => {
      try {
        await apiClient.setPrimaryImage(propertyId, imageId);
        toast.success('Primary image updated!');
      } catch (error) {
        ErrorHandler.handle(error, 'Failed to set primary image');
        throw error;
      }
    },
    [propertyId]
  );

  return {
    uploadImages,
    deleteImage,
    setPrimaryImage,
    progress,
    uploading,
    error,
  };
}

// ============================================
// INQUIRY FORM HOOKS
// ============================================

/**
 * Hook for creating an inquiry
 */
export function useCreateInquiry() {
  const [state, setState] = useState<FormState<Inquiry>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const createInquiry = useCallback(
    async (data: {
      propertyId: string;
      message: string;
      preferredViewingDate?: string;
    }) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const inquiry = await apiClient.createInquiry(data);
        setState({
          data: inquiry,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Inquiry sent successfully!');
        return inquiry;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to send inquiry');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to send inquiry');
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    createInquiry,
    reset,
  };
}

/**
 * Hook for responding to an inquiry
 */
export function useRespondToInquiry() {
  const [state, setState] = useState<FormState<Inquiry>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const respondToInquiry = useCallback(
    async (
      inquiryId: string,
      response: string,
      status?: 'RESPONDED' | 'CLOSED'
    ) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const inquiry = await apiClient.respondToInquiry(inquiryId, response, status);
        setState({
          data: inquiry,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Response sent successfully!');
        return inquiry;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to send response');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to send response');
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    respondToInquiry,
  };
}

/**
 * Hook for deleting an inquiry
 */
export function useDeleteInquiry() {
  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
    success: false,
  });

  const deleteInquiry = useCallback(async (inquiryId: string) => {
    setState({ loading: true, error: null, success: false });

    try {
      await apiClient.deleteInquiry(inquiryId);
      setState({
        loading: false,
        error: null,
        success: true,
      });
      toast.success('Inquiry deleted successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete inquiry');
      setState({
        loading: false,
        error: err,
        success: false,
      });
      ErrorHandler.handle(error, 'Failed to delete inquiry');
      throw error;
    }
  }, []);

  return {
    ...state,
    deleteInquiry,
  };
}

// ============================================
// REVIEW FORM HOOKS
// ============================================

/**
 * Hook for creating a review
 */
export function useCreateReview() {
  const [state, setState] = useState<FormState<Review>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const createReview = useCallback(
    async (data: {
      propertyId: string;
      rating: number;
      comment: string;
    }) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const review = await apiClient.createReview(data);
        setState({
          data: review,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Review submitted successfully!');
        return review;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to submit review');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to submit review');
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    createReview,
    reset,
  };
}

/**
 * Hook for updating a review
 */
export function useUpdateReview() {
  const [state, setState] = useState<FormState<Review>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const updateReview = useCallback(
    async (
      reviewId: string,
      data: { rating?: number; comment?: string }
    ) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const review = await apiClient.updateReview(reviewId, data);
        setState({
          data: review,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Review updated successfully!');
        return review;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to update review');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to update review');
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    updateReview,
  };
}

/**
 * Hook for deleting a review
 */
export function useDeleteReview() {
  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
    success: false,
  });

  const deleteReview = useCallback(async (reviewId: string) => {
    setState({ loading: true, error: null, success: false });

    try {
      await apiClient.deleteReview(reviewId);
      setState({
        loading: false,
        error: null,
        success: true,
      });
      toast.success('Review deleted successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete review');
      setState({
        loading: false,
        error: err,
        success: false,
      });
      ErrorHandler.handle(error, 'Failed to delete review');
      throw error;
    }
  }, []);

  return {
    ...state,
    deleteReview,
  };
}

// ============================================
// PROFILE FORM HOOKS
// ============================================

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const [state, setState] = useState<FormState<User>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const updateProfile = useCallback(
    async (data: {
      name?: string;
      phone?: string;
      bio?: string;
    }) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const user = await apiClient.updateProfile(data);
        setState({
          data: user,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Profile updated successfully!');
        return user;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to update profile');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to update profile');
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    updateProfile,
  };
}

/**
 * Hook for uploading profile image
 */
export function useProfileImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const user = await apiClient.uploadProfileImage(file);
      setUploading(false);
      toast.success('Profile image updated successfully!');
      return user;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to upload image');
      setError(err);
      setUploading(false);
      ErrorHandler.handle(error, 'Failed to upload profile image');
      throw error;
    }
  }, []);

  return {
    uploadImage,
    uploading,
    error,
  };
}

// ============================================
// PAYMENT FORM HOOKS
// ============================================

/**
 * Hook for initiating M-Pesa payment
 */
export function useInitiatePayment() {
  const [state, setState] = useState<FormState<Payment>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const initiatePayment = useCallback(
    async (data: {
      propertyId: string;
      amount: number;
      phoneNumber: string;
    }) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const payment = await apiClient.initiatePayment(data);
        setState({
          data: payment,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Payment initiated! Check your phone for the M-Pesa prompt.');
        return payment;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to initiate payment');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to initiate payment');
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    initiatePayment,
  };
}

/**
 * Hook for checking payment status
 */
export function usePaymentStatus(paymentId: string | null) {
  const [state, setState] = useState<FormState<Payment>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const checkStatus = useCallback(async () => {
    if (!paymentId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const payment = await apiClient.getPaymentStatus(paymentId);
      setState({
        data: payment,
        loading: false,
        error: null,
        success: payment.status === 'PAID', // Compare with frontend status
      });
      return payment;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to check payment status');
      setState({
        data: null,
        loading: false,
        error: err,
        success: false,
      });
      ErrorHandler.handle(error);
      throw error;
    }
  }, [paymentId]);

  return {
    ...state,
    checkStatus,
  };
}

// ============================================
// SAVED SEARCH HOOKS
// ============================================

/**
 * Hook for creating a saved search
 */
export function useCreateSavedSearch() {
  const [state, setState] = useState<FormState<SavedSearch>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const createSavedSearch = useCallback(
    async (data: {
      name: string;
      criteria: BackendSearchCriteria;
    }) => {
      setState({ data: null, loading: true, error: null, success: false });

      try {
        const savedSearch = await apiClient.createSavedSearch(data);
        setState({
          data: savedSearch,
          loading: false,
          error: null,
          success: true,
        });
        toast.success('Search saved successfully!');
        return savedSearch;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to save search');
        setState({
          data: null,
          loading: false,
          error: err,
          success: false,
        });
        ErrorHandler.handle(error, 'Failed to save search');
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    createSavedSearch,
  };
}

/**
 * Hook for deleting a saved search
 */
export function useDeleteSavedSearch() {
  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
    success: false,
  });

  const deleteSavedSearch = useCallback(async (searchId: string) => {
    setState({ loading: true, error: null, success: false });

    try {
      await apiClient.deleteSavedSearch(searchId);
      setState({
        loading: false,
        error: null,
        success: true,
      });
      toast.success('Saved search deleted successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete saved search');
      setState({
        loading: false,
        error: err,
        success: false,
      });
      ErrorHandler.handle(error, 'Failed to delete saved search');
      throw error;
    }
  }, []);

  return {
    ...state,
    deleteSavedSearch,
  };
}

// ============================================
// DOCUMENT UPLOAD HOOKS
// ============================================

/**
 * Hook for uploading documents
 */
export function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadDocument = useCallback(
    async (file: File, documentType: string, propertyId?: string) => {
      setUploading(true);
      setError(null);

      try {
        const document = await apiClient.uploadDocument(file, documentType, propertyId);
        setUploading(false);
        toast.success('Document uploaded successfully!');
        return document;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to upload document');
        setError(err);
        setUploading(false);
        ErrorHandler.handle(error, 'Failed to upload document');
        throw error;
      }
    },
    []
  );

  return {
    uploadDocument,
    uploading,
    error,
  };
}
