/**
 * Payment Status Enum
 * - PENDING: Payment initiated, awaiting user action
 * - PROCESSING: STK push sent, waiting for M-Pesa response
 * - COMPLETED: Payment successful
 * - FAILED: Payment failed or was cancelled
 * - CANCELLED: Payment cancelled by user or system
 */
export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

/**
 * Payment Type Enum
 * - DEPOSIT: Security deposit (typically 2x monthly rent)
 * - BOOKING_FEE: Property booking/reservation fee (KES 5,000)
 * - RENT: Monthly rent payment
 */
export enum PaymentType {
    DEPOSIT = 'DEPOSIT',
    BOOKING_FEE = 'BOOKING_FEE',
    RENT = 'RENT',
}

/**
 * Core Payment Interface
 * Represents a payment record in the database
 */
export interface Payment {
    id: string;
    userId: string;
    propertyId: string;
    amount: number;
    type: PaymentType;
    status: PaymentStatus;
    mpesaReceiptNumber?: string | null;
    mpesaCheckoutRequestId?: string | null;
    phoneNumber: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Payment with related data for display purposes
 */
export interface PaymentWithDetails extends Payment {
    user?: {
        id: string;
        name: string;
        email: string;
        phoneNumber?: string;
    };
    property?: {
        id: string;
        title: string;
        monthlyRent: number;
        location: string;
    };
}

/**
 * Request body for initiating M-Pesa STK push
 */
export interface InitiatePaymentRequest {
    propertyId: string;
    amount: number;
    phoneNumber: string; // Format: 254XXXXXXXXX (no + sign)
    paymentType: PaymentType;
}

/**
 * Response from payment initiation endpoint
 */
export interface InitiatePaymentResponse {
    success: boolean;
    message: string;
    payment?: {
        id: string;
        status: PaymentStatus;
        checkoutRequestId?: string;
    };
    error?: string;
}

/**
 * Request body for checking payment status
 */
export interface CheckPaymentStatusRequest {
    paymentId: string;
}

/**
 * Response from payment status query endpoint
 */
export interface PaymentStatusResponse {
    success: boolean;
    payment: {
        id: string;
        status: PaymentStatus;
        mpesaReceiptNumber?: string | null;
        amount: number;
        type: PaymentType;
    };
    error?: string;
}

/**
 * Payment history query parameters
 */
export interface PaymentHistoryParams {
    userId?: string;
    propertyId?: string;
    status?: PaymentStatus;
    type?: PaymentType;
    limit?: number;
    offset?: number;
}

/**
 * Payment history response
 */
export interface PaymentHistoryResponse {
    success: boolean;
    payments: PaymentWithDetails[];
    total: number;
    error?: string;
}

/**
 * Admin payment analytics filters
 */
export interface AdminPaymentFilters {
    filter?: 'all' | 'today' | 'week' | 'month';
    status?: PaymentStatus;
    startDate?: string;
    endDate?: string;
}

/**
 * Admin payment statistics
 */
export interface PaymentStats {
    totalRevenue: number;
    completedPayments: number;
    failedPayments: number;
    pendingPayments: number;
    todayRevenue: number;
    monthRevenue: number;
}

/**
 * Admin analytics response
 */
export interface AdminAnalyticsResponse {
    success: boolean;
    stats: PaymentStats;
    payments: PaymentWithDetails[];
    error?: string;
}

/**
 * Property payments response
 */
export interface PropertyPaymentsResponse {
    success: boolean;
    payments: PaymentWithDetails[];
    error?: string;
}

/**
 * M-Pesa callback request body (from Safaricom)
 */
export interface MpesaCallbackBody {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: number;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: Array<{
                    Name: string;
                    Value: string | number;
                }>;
            };
        };
    };
}

/**
 * M-Pesa STK Push response (from Safaricom)
 */
export interface MpesaStkResponse {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
}

/**
 * M-Pesa query status response (from Safaricom)
 */
export interface MpesaQueryResponse {
    ResponseCode: string;
    ResponseDescription: string;
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: string;
    ResultDesc: string;
}

/**
 * Phone number validation result
 */
export interface PhoneValidationResult {
    isValid: boolean;
    formatted?: string; // 254XXXXXXXXX format
    error?: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
    success: false;
    error: string;
    message?: string;
    statusCode?: number;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: any): response is ApiErrorResponse {
    return response && response.success === false && 'error' in response;
}

/**
 * Type guard to check if payment is in final state
 */
export function isPaymentFinal(status: PaymentStatus): boolean {
    return status === PaymentStatus.COMPLETED || status === PaymentStatus.FAILED;
}

/**
 * Format phone number for M-Pesa (254XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): PhoneValidationResult {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it starts with 254
    if (cleaned.startsWith('254') && cleaned.length === 12) {
        return { isValid: true, formatted: cleaned };
    }

    // Check if it starts with 0 (Kenyan format)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        return { isValid: true, formatted: '254' + cleaned.substring(1) };
    }

    // Check if it's just 9 digits (without country code or leading zero)
    if (cleaned.length === 9) {
        return { isValid: true, formatted: '254' + cleaned };
    }

    return {
        isValid: false,
        error: 'Invalid phone number. Use format: 254XXXXXXXXX, 0XXXXXXXXX, or XXXXXXXXX',
    };
}

/**
 * Calculate deposit amount (2x monthly rent)
 */
export function calculateDeposit(monthlyRent: number): number {
    return monthlyRent * 2;
}

/**
 * Get payment type display label
 */
export function getPaymentTypeLabel(type: PaymentType): string {
    switch (type) {
        case PaymentType.DEPOSIT:
            return 'Security Deposit';
        case PaymentType.BOOKING_FEE:
            return 'Booking Fee';
        case PaymentType.RENT:
            return 'Rent Payment';
        default:
            return type;
    }
}

/**
 * Get payment status display label
 */
export function getPaymentStatusLabel(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.PENDING:
            return 'Pending';
        case PaymentStatus.PROCESSING:
            return 'Processing';
        case PaymentStatus.COMPLETED:
            return 'Completed';
        case PaymentStatus.FAILED:
            return 'Failed';
        case PaymentStatus.CANCELLED:
            return 'Cancelled';
        default:
            return status;
    }
}

/**
 * Get payment status color for UI
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.COMPLETED:
            return 'green';
        case PaymentStatus.PENDING:
        case PaymentStatus.PROCESSING:
            return 'orange';
        case PaymentStatus.FAILED:
        case PaymentStatus.CANCELLED:
            return 'red';
        default:
            return 'gray';
    }
}