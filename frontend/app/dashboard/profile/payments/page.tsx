'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Clock, Building2, Calendar, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useMyPayments } from '@/lib/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG = {
    PENDING: { icon: Clock, variant: 'warning' as const, label: 'Pending' },
    PAID: { icon: CheckCircle, variant: 'success' as const, label: 'Paid' },
    FAILED: { icon: XCircle, variant: 'danger' as const, label: 'Failed' },
    REFUNDED: { icon: CheckCircle, variant: 'secondary' as const, label: 'Refunded' },
};

export default function PaymentsPage() {
    const router = useRouter();
    const { data: payments, loading } = useMyPayments();

    const totalPaid = React.useMemo(() => {
        if (!payments) return 0;
        return payments
            .filter((p) => p.status === 'PAID')
            .reduce((sum, p) => sum + p.amount, 0);
    }, [payments]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-bg py-xl">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-xl"
                >
                    <h1 className="text-h1 mb-2">Payment History</h1>
                    <p className="text-body text-neutral-text-secondary">
                        View all your M-Pesa transactions
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
                    <Card>
                        <div className="p-lg">
                            <p className="text-small text-neutral-text-secondary mb-2">Total Paid</p>
                            <p className="text-h2 font-bold text-brand-primary">{formatCurrency(totalPaid)}</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="p-lg">
                            <p className="text-small text-neutral-text-secondary mb-2">Total Transactions</p>
                            <p className="text-h2 font-bold">{payments?.length || 0}</p>
                        </div>
                    </Card>
                    <Card>
                        <div className="p-lg">
                            <p className="text-small text-neutral-text-secondary mb-2">Successful</p>
                            <p className="text-h2 font-bold text-status-success">
                                {payments?.filter((p) => p.status === 'PAID').length || 0}
                            </p>
                        </div>
                    </Card>
                </div>

                {!payments || payments.length === 0 ? (
                    <EmptyState
                        icon={<CreditCard className="w-12 h-12" />}
                        title="No payments yet"
                        description="Your payment history will appear here"
                        actionLabel="Browse Properties"
                        onAction={() => router.push('/listings')}
                    />
                ) : (
                    <div className="space-y-md">
                        {payments.map((payment) => {
                            const StatusIcon = STATUS_CONFIG[payment.status].icon;
                            return (
                                <motion.div
                                    key={payment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="hover:shadow-md transition-shadow">
                                        <div className="p-lg">
                                            <div className="flex items-start justify-between mb-md">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-h3 font-bold">{formatCurrency(payment.amount)}</span>
                                                        <Badge variant={STATUS_CONFIG[payment.status].variant}>
                                                            <StatusIcon className="w-4 h-4 mr-1" />
                                                            {STATUS_CONFIG[payment.status].label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-small text-neutral-text-secondary">
                                                        {formatDate(payment.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-small">
                                                <div>
                                                    <p className="text-neutral-text-secondary mb-1">Phone Number</p>
                                                    <p className="font-medium">{payment.phoneNumber}</p>
                                                </div>
                                                {payment.mpesaReceiptNumber && (
                                                    <div>
                                                        <p className="text-neutral-text-secondary mb-1">M-Pesa Receipt</p>
                                                        <p className="font-medium font-mono">{payment.mpesaReceiptNumber}</p>
                                                    </div>
                                                )}
                                                {payment.transactionDate && (
                                                    <div>
                                                        <p className="text-neutral-text-secondary mb-1">Transaction Date</p>
                                                        <p className="font-medium">{formatDate(payment.transactionDate)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
