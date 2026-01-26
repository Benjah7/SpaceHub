/**
 * Enhanced Payment Success Handler
 * 
 * This file provides the logic to handle payment success properly:
 * 1. Refresh property data to show updated status
 * 2. Show detailed success information
 * 3. Navigate appropriately based on context
 */

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface PaymentSuccessOptions {
    paymentId: string;
    propertyId: string;
    amount: number;
    paymentType: 'DEPOSIT' | 'BOOKING' | 'RENT';
    mpesaReceipt?: string;
}

/**
 * Handle payment success with comprehensive actions
 */
export async function handlePaymentSuccess(options: PaymentSuccessOptions) {
    const { paymentId, propertyId, amount, paymentType, mpesaReceipt } = options;

    // 1. Show success toast with receipt number
    const receiptMessage = mpesaReceipt
        ? `Receipt: ${mpesaReceipt}`
        : 'Payment confirmed';

    toast.success(`Payment Successful! ${receiptMessage}`, {
        duration: 5000,
        description: `KES ${amount.toLocaleString()} - ${paymentType}`
    });

    // 2. Return success data for component to handle
    return {
        success: true,
        paymentId,
        propertyId,
        shouldRefreshProperty: true,
        shouldShowReceipt: true,
        navigationSuggestion: getNavigationSuggestion(paymentType)
    };
}

/**
 * Get navigation suggestion based on payment type
 */
function getNavigationSuggestion(paymentType: string): {
    message: string;
    path: string;
    label: string;
} {
    switch (paymentType) {
        case 'BOOKING':
        case 'BOOKING_FEE':
            return {
                message: 'Property has been reserved! Schedule a viewing to proceed.',
                path: '/dashboard/appointments',
                label: 'Schedule Viewing'
            };

        case 'DEPOSIT':
            return {
                message: 'Deposit received! The owner will confirm your booking soon.',
                path: '/dashboard',
                label: 'View Dashboard'
            };

        case 'RENT':
            return {
                message: 'Rent payment received! Check your payment history.',
                path: '/dashboard/payments',
                label: 'View Payments'
            };

        default:
            return {
                message: 'Payment completed successfully!',
                path: '/dashboard',
                label: 'Go to Dashboard'
            };
    }
}

/**
 * Hook for payment success handling in components
 */
export function usePaymentSuccess() {
    const router = useRouter();

    const handleSuccess = async (options: PaymentSuccessOptions) => {
        const result = await handlePaymentSuccess(options);

        return {
            ...result,
            navigate: (path?: string) => {
                router.push(path || result.navigationSuggestion.path);
            },
            refresh: () => {
                router.refresh();
            }
        };
    };

    return { handleSuccess };
}

/**
 * Example usage in PropertyPage:
 * 
 * const { handleSuccess } = usePaymentSuccess();
 * 
 * const handlePaymentSuccess = async (paymentId: string) => {
 *   const result = await handleSuccess({
 *     paymentId,
 *     propertyId: property.id,
 *     amount,
 *     paymentType: selectedPaymentType,
 *     mpesaReceipt: paymentStatus?.mpesaReceiptNumber
 *   });
 *   
 *   setShowPaymentModal(false);
 *   
 *   // Optionally show next steps
 *   if (result.success) {
 *     toast.info(result.navigationSuggestion.message, {
 *       action: {
 *         label: result.navigationSuggestion.label,
 *         onClick: () => result.navigate()
 *       }
 *     });
 *   }
 * };
 */