'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Download,
    Filter,
    Search,
    CheckCircle,
    Clock,
    XCircle,
    FileText,
    Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useMyPayments } from '@/lib/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';

const STATUS_CONFIG = {
    PAID: {
        icon: CheckCircle,
        variant: 'success' as const,
        label: 'Completed',
    },
    PENDING: {
        icon: Clock,
        variant: 'warning' as const,
        label: 'Pending',
    },
    FAILED: {
        icon: XCircle,
        variant: 'error' as const,
        label: 'Failed',
    },
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Payments' },
    { value: 'PAID', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
];

export default function PaymentsPage() {
    useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const { data: payments, loading } = useMyPayments();

    const filteredPayments = React.useMemo(() => {
        if (!payments) return [];

        return payments.filter((payment) => {
            const matchesSearch =
                payment.mpesaReceiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                payment.phoneNumber.includes(searchQuery);
            const matchesStatus = !statusFilter || payment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, searchQuery, statusFilter]);

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
        <div className="min-h-screen bg-neutral-bg">
            <div className="container-custom py-xl">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between mb-xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-h1 mb-2">Payment History</h1>
                        <p className="text-body text-neutral-text-secondary">
                            View and manage all your transactions
                        </p>
                    </div>
                    <Button variant="outline" leftIcon={<Download className="w-5 h-5" />}>
                        Export
                    </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <div className="p-lg">
                            <p className="text-small text-neutral-text-secondary mb-1">Total Paid</p>
                            <p className="text-h2 font-bold text-status-success">{formatCurrency(totalPaid)}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-lg">
                            <p className="text-small text-neutral-text-secondary mb-1">Total Transactions</p>
                            <p className="text-h2 font-bold">{payments?.length || 0}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-lg">
                            <p className="text-small text-neutral-text-secondary mb-1">Pending</p>
                            <p className="text-h2 font-bold text-status-warning">
                                {payments?.filter((p) => p.status === 'PENDING').length || 0}
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Filters */}
                <Card className="mb-xl">
                    <div className="p-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                            <Input
                                placeholder="Search by receipt or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-5 h-5" />}
                            />

                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={STATUS_OPTIONS}
                            />

                            <Button variant="outline" leftIcon={<Filter className="w-5 h-5" />}>
                                More Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Payments List */}
                {filteredPayments.length > 0 ? (
                    <motion.div
                        className="space-y-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {filteredPayments.map((payment) => {
                            const StatusIcon = STATUS_CONFIG[payment.status].icon;
                            return (
                                <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                                    <div className="p-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-md flex-1">
                                                <div className="p-3 bg-brand-primary/10 rounded-lg">
                                                    <CreditCard className="w-6 h-6 text-brand-primary" />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-body mb-1">
                                                                Payment #{payment.id.slice(0, 8)}
                                                            </h3>
                                                            <p className="text-small text-neutral-text-secondary">
                                                                {payment.phoneNumber}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-h3 font-bold">{formatCurrency(payment.amount)}</p>
                                                            <Badge variant={STATUS_CONFIG[payment.status].variant}>
                                                                <StatusIcon className="w-4 h-4 mr-1" />
                                                                {STATUS_CONFIG[payment.status].label}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-md text-tiny text-neutral-text-tertiary">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(payment.createdAt)}</span>
                                                        </div>
                                                        {payment.mpesaReceiptNumber && (
                                                            <div className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4" />
                                                                <span className="font-mono">
                                                                    {payment.mpesaReceiptNumber}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={CreditCard}
                        title={
                            searchQuery || statusFilter ? 'No payments found' : 'No payments yet'
                        }
                        description={
                            searchQuery || statusFilter
                                ? 'Try adjusting your filters'
                                : 'Your payment history will appear here'
                        }
                        actionLabel={searchQuery || statusFilter ? 'Clear Filters' : undefined}
                        onAction={
                            searchQuery || statusFilter
                                ? () => {
                                    setSearchQuery('');
                                    setStatusFilter('');
                                }
                                : undefined
                        }
                    />
                )}
            </div>
        </div>
    );
}