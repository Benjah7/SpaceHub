import axios from 'axios';
import { ApiError } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';

export class MpesaService {
    /**
     * Get M-Pesa access token
     */
    private static async getAccessToken(): Promise<string> {
        const auth = Buffer.from(
            `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
        ).toString('base64');

        const url = process.env.MPESA_ENVIRONMENT === 'production'
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        try {
            const { data } = await axios.get(url, {
                headers: { Authorization: `Basic ${auth}` }
            });

            return data.access_token;
        } catch (error) {
            console.error('M-Pesa token error:', error);
            throw new ApiError(500, 'Failed to get M-Pesa access token');
        }
    }

    /**
     * Initiate STK Push
     */
    static async initiateSTKPush(
        phoneNumber: string,
        amount: number,
        propertyId: number,
        userId: number,
        paymentType: string
    ) {
        // Validate M-Pesa configuration
        if (!process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY || !process.env.MPESA_CALLBACK_URL) {
            console.error('Missing M-Pesa configuration:', {
                hasShortcode: !!process.env.MPESA_SHORTCODE,
                hasPasskey: !!process.env.MPESA_PASSKEY,
                hasCallbackUrl: !!process.env.MPESA_CALLBACK_URL
            });
            throw new ApiError(500, 'M-Pesa configuration incomplete. Please contact support.');
        }

        const token = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString('base64');

        const url = process.env.MPESA_ENVIRONMENT === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        const payload = {
            BusinessShortCode: process.env.MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: phoneNumber,
            PartyB: process.env.MPESA_SHORTCODE,
            PhoneNumber: phoneNumber,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: `SPACEHUB-${propertyId}`,
            TransactionDesc: `Space Hub - ${paymentType}`
        };

        console.log('Initiating M-Pesa STK Push:', {
            url,
            amount: payload.Amount,
            phoneNumber: payload.PhoneNumber,
            environment: process.env.MPESA_ENVIRONMENT
        });

        try {
            const { data } = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Create payment record
            const payment = await prisma.payment.create({
                data: {
                    amount,
                    phoneNumber,
                    paymentType,
                    checkoutRequestID: data.CheckoutRequestID,
                    merchantRequestID: data.MerchantRequestID,
                    userId,
                    propertyId,
                    status: 'PENDING'
                }
            });

            return {
                checkoutRequestID: data.CheckoutRequestID,
                merchantRequestID: data.MerchantRequestID,
                responseCode: data.ResponseCode,
                responseDescription: data.ResponseDescription,
                customerMessage: data.CustomerMessage,
                payment
            };
        } catch (error: any) {
            const errorData = error.response?.data || error;
            console.error('M-Pesa STK Push error:', errorData);

            // Provide more detailed error message
            if (errorData?.errorMessage) {
                throw new ApiError(500, `M-Pesa Error: ${errorData.errorMessage}`);
            } else if (errorData?.ResponseDescription) {
                throw new ApiError(500, `M-Pesa Error: ${errorData.ResponseDescription}`);
            } else {
                throw new ApiError(500, 'Failed to initiate payment. Please check M-Pesa configuration.');
            }
        }
    }

    /**
     * Handle M-Pesa callback
     */
    static async handleCallback(callbackData: any) {
        try {
            const { ResultCode, CheckoutRequestID, CallbackMetadata } = callbackData.Body.stkCallback;

            if (ResultCode === 0) {
                // Payment successful
                const metadata = CallbackMetadata.Item;
                const mpesaReceiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;

                // Update payment record
                const payment = await prisma.payment.update({
                    where: { checkoutRequestID: CheckoutRequestID },
                    data: {
                        status: 'COMPLETED',
                        mpesaReceiptNumber,
                        completedAt: new Date()
                    },
                    include: {
                        user: true,
                        property: {
                            include: {
                                owner: true
                            }
                        }
                    }
                });

                // Send notifications
                // TODO: Implement notification sending

                return payment;
            } else {
                // Payment failed
                await prisma.payment.update({
                    where: { checkoutRequestID: CheckoutRequestID },
                    data: { status: 'FAILED' }
                });

                return null;
            }
        } catch (error) {
            console.error('M-Pesa callback error:', error);
            throw error;
        }
    }
    /**
     * Query payment status
     */
    static async queryPaymentStatus(checkoutRequestID: string) {
        const token = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString('base64');

        const url = process.env.MPESA_ENVIRONMENT === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';

        try {
            const { data } = await axios.post(
                url,
                {
                    BusinessShortCode: process.env.MPESA_SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    CheckoutRequestID: checkoutRequestID
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            return data;
        } catch (error) {
            console.error('M-Pesa query error:', error);
            throw new ApiError(500, 'Failed to query payment status');
        }
    }
}