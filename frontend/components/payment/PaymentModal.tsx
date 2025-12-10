'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CreditCard,
    Smartphone,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader2,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useInitiatePayment, usePaymentStatus } from '@/lib/hooks/useForm';
import { formatCurrency } from '@/lib/utils';
import type { Property } from '@/types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
    paymentType?: 'DEPOSIT' | 'RENT' | 'BOOKING';
    amount?: number;
    onSuccess?: (paymentId: string) => void;
}

type PaymentStep = 'form' | 'processing' | 'checking' | 'success' | 'failed';

export function PaymentModal({
    isOpen,
    onClose,
    property,
    paymentType = 'DEPOSIT',
    amount: customAmount,
    onSuccess,
}: PaymentModalProps) {
    const [step, setStep] = useState<PaymentStep>('form');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState(customAmount || property.price * 0.1); // 10% deposit default
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(120); // 2 minutes timeout

    const { initiatePayment, loading: initiating } = useInitiatePayment();
    const { checkStatus, data: paymentStatus } = usePaymentStatus(paymentId);

    // Poll payment status
    useEffect(() => {
        if (step === 'checking' && paymentId) {
            const interval = setInterval(() => {
                checkStatus();
            }, 3000); // Check every 3 seconds

            return () => clearInterval(interval);
        }
    }, [step, paymentId, checkStatus]);

    // Update step based on payment status
    useEffect(() => {
        if (paymentStatus) {
            if (paymentStatus.status === 'PAID') {
                setStep('success');
                if (onSuccess) {
                    onSuccess(paymentStatus.id);
                }
            } else if (paymentStatus.status === 'FAILED') {
                setStep('failed');
            }
        }
    }, [paymentStatus, onSuccess]);

    // Countdown timer
    useEffect(() => {
        if (step === 'checking') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setStep('failed');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [step]);

    const handleInitiatePayment = async () => {
        try {
            const payment = await initiatePayment({
                propertyId: property.id,
                amount,
                phoneNumber: phoneNumber.replace(/\s/g, ''), // Remove spaces
                paymentType,
            });

            setPaymentId(payment.id);
            setStep('processing');

            // Move to checking after 3 seconds
            setTimeout(() => {
                setStep('checking');
            }, 3000);
        } catch (error) {
            setStep('failed');
        }
    };

    const handleClose = () => {
        setStep('form');
        setPhoneNumber('');
        setPaymentId(null);
        setCountdown(120);
        onClose();
    };

    const handleRetry = () => {
        setStep('form');
        setPaymentId(null);
        setCountdown(120);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative z-10 w-full max-w-lg mx-4"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <Card>
                        {/* Header */}
                        <div className="flex items-center justify-between p-lg border-b border-neutral-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="text-h3">Make Payment</h3>
                                    <p className="text-small text-neutral-text-secondary">
                                        {paymentType === 'DEPOSIT' && 'Security Deposit'}
                                        {paymentType === 'RENT' && 'Monthly Rent'}
                                        {paymentType === 'BOOKING' && 'Booking Fee'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-neutral-surface rounded-lg transition-colors"
                                disabled={step === 'processing' || step === 'checking'}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-xl">
                            {/* Property Info */}
                            <div className="mb-xl">
                                <div className="flex items-start gap-md">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-body mb-1">{property.title}</h4>
                                        <p className="text-small text-neutral-text-secondary">
                                            {property.location.address}
                                        </p>
                                    </div>
                                    <Badge variant="info">{formatCurrency(property.price)}/mo</Badge>
                                </div>
                            </div>

                            {/* Form Step */}
                            {step === 'form' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-lg"
                                >
                                    <div>
                                        <label className="block text-small font-semibold mb-2">
                                            Payment Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-text-secondary">
                                                KES
                                            </span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                                className="w-full pl-16 pr-4 py-3 border-2 border-neutral-border rounded-lg text-h3 font-bold focus:border-brand-primary focus:outline-none"
                                                min="0"
                                                step="100"
                                            />
                                        </div>
                                        {paymentType === 'DEPOSIT' && (
                                            <p className="text-tiny text-neutral-text-tertiary mt-2">
                                                Recommended: 10% of monthly rent (
                                                {formatCurrency(property.price * 0.1)})
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            label="M-Pesa Phone Number"
                                            type="tel"
                                            placeholder="254 712 345 678"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            leftIcon={<Smartphone className="w-5 h-5" />}
                                            helperText="Enter your Safaricom number for M-Pesa payment"
                                        />
                                    </div>

                                    <div className="p-md bg-status-info/10 rounded-lg border border-status-info/20">
                                        <div className="flex gap-3">
                                            <Info className="w-5 h-5 text-status-info flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-small font-semibold text-status-info mb-1">
                                                    How it works
                                                </p>
                                                <ul className="text-tiny text-neutral-text-secondary space-y-1">
                                                    <li>• You'll receive an M-Pesa prompt on your phone</li>
                                                    <li>• Enter your M-Pesa PIN to confirm payment</li>
                                                    <li>• Payment confirmation is instant</li>
                                                    <li>• You'll receive a receipt via SMS</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        onClick={handleInitiatePayment}
                                        isLoading={initiating}
                                        disabled={!phoneNumber || !amount || amount <= 0}
                                    >
                                        Pay {formatCurrency(amount)}
                                    </Button>
                                </motion.div>
                            )}

                            {/* Processing Step */}
                            {step === 'processing' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-xl"
                                >
                                    <div className="w-20 h-20 mx-auto mb-lg bg-brand-primary/10 rounded-full flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                                    </div>
                                    <h4 className="text-h3 mb-2">Initiating Payment...</h4>
                                    <p className="text-body text-neutral-text-secondary">
                                        Please wait while we connect to M-Pesa
                                    </p>
                                </motion.div>
                            )}

                            {/* Checking Step */}
                            {step === 'checking' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-xl"
                                >
                                    <div className="w-20 h-20 mx-auto mb-lg bg-status-warning/10 rounded-full flex items-center justify-center">
                                        <Smartphone className="w-10 h-10 text-status-warning animate-pulse" />
                                    </div>
                                    <h4 className="text-h3 mb-2">Check Your Phone</h4>
                                    <p className="text-body text-neutral-text-secondary mb-lg">
                                        Enter your M-Pesa PIN to complete the payment
                                    </p>

                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-surface rounded-lg">
                                        <Clock className="w-4 h-4 text-neutral-text-tertiary" />
                                        <span className="text-small text-neutral-text-secondary">
                                            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <div className="mt-xl p-md bg-neutral-surface rounded-lg">
                                        <p className="text-tiny text-neutral-text-tertiary">
                                            Waiting for payment confirmation...
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Success Step */}
                            {step === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-xl"
                                >
                                    <div className="w-20 h-20 mx-auto mb-lg bg-status-success/10 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-status-success" />
                                    </div>
                                    <h4 className="text-h3 mb-2">Payment Successful!</h4>
                                    <p className="text-body text-neutral-text-secondary mb-lg">
                                        Your payment of {formatCurrency(amount)} has been received
                                    </p>

                                    {paymentStatus?.mpesaReceiptNumber && (
                                        <div className="p-md bg-neutral-surface rounded-lg mb-lg">
                                            <p className="text-tiny text-neutral-text-tertiary mb-1">
                                                M-Pesa Receipt Number
                                            </p>
                                            <p className="text-small font-mono font-semibold">
                                                {paymentStatus.mpesaReceiptNumber}
                                            </p>
                                        </div>
                                    )}

                                    <Button variant="primary" size="lg" className="w-full" onClick={handleClose}>
                                        Done
                                    </Button>
                                </motion.div>
                            )}

                            {/* Failed Step */}
                            {step === 'failed' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-xl"
                                >
                                    <div className="w-20 h-20 mx-auto mb-lg bg-status-error/10 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-10 h-10 text-status-error" />
                                    </div>
                                    <h4 className="text-h3 mb-2">Payment Failed</h4>
                                    <p className="text-body text-neutral-text-secondary mb-lg">
                                        The payment could not be completed. Please try again.
                                    </p>

                                    <div className="space-y-3">
                                        <Button variant="primary" size="lg" className="w-full" onClick={handleRetry}>
                                            Try Again
                                        </Button>
                                        <Button variant="danger" size="lg" className="w-full" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
