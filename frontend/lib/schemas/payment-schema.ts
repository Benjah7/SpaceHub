import { z } from 'zod';

/**
 * M-Pesa payment validation schema
 */
export const mpesaPaymentSchema = z.object({
  amount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .min(1, 'Minimum amount is KES 1')
    .max(150000, 'Maximum amount is KES 150,000')
    .int('Amount must be a whole number'),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+?254[17]\d{8}$/,
      'Please enter a valid Kenyan phone number (e.g., +254712345678 or 0712345678)'
    )
    .transform((val) => {
      // Normalize phone number to +254 format
      if (val.startsWith('0')) {
        return '+254' + val.substring(1);
      }
      if (val.startsWith('254') && !val.startsWith('+')) {
        return '+' + val;
      }
      return val;
    }),
  propertyId: z
    .string()
    .min(1, 'Property ID is required'),
  paymentType: z
    .enum(['DEPOSIT', 'RENT', 'BOOKING_FEE'], {
      required_error: 'Payment type is required',
    }),
});

export type MpesaPaymentFormData = z.infer<typeof mpesaPaymentSchema>;

/**
 * Payment confirmation schema
 */
export const paymentConfirmationSchema = z.object({
  checkoutRequestId: z.string(),
  merchantRequestId: z.string(),
});

export type PaymentConfirmationData = z.infer<typeof paymentConfirmationSchema>;
