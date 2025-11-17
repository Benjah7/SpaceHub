'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Clock, CheckCircle, XCircle, Building2, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useMyInquiries } from '@/lib/hooks/useApi';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'RESPONDED', label: 'Responded' },
    { value: 'CLOSED', label: 'Closed' },
];

const STATUS_CONFIG = {
    PENDING: { icon: Clock, variant: 'warning' as const, label: 'Pending' },
    RESPONDED: { icon: CheckCircle, variant: 'success' as const, label: 'Responded' },
    CLOSED: { icon: XCircle, variant: 'secondary' as const, label: 'Closed' },
};

export default function InquiriesPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { data: inquiries, loading } = useMyInquiries();

    const filteredInquiries = React.useMemo(() => {
        if (!inquiries) return [];
        return inquiries.filter((inquiry) => {
            const matchesSearch = inquiry.property.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = !statusFilter || inquiry.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [inquiries, searchQuery, statusFilter]);

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
                    <h1 className="text-h1 mb-2">My Inquiries</h1>
                    <p className="text-body text-neutral-text-secondary">
                        Track your property inquiries and responses
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-md mb-xl">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by property..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-5 h-5" />}
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={STATUS_OPTIONS}
                        className="md:w-64"
                    />
                </div>

                {!inquiries || filteredInquiries.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title={searchQuery || statusFilter ? 'No matching inquiries' : 'No inquiries yet'}
                        description={
                            searchQuery || statusFilter
                                ? 'Try adjusting your filters'
                                : 'Start browsing properties and send inquiries to owners'
                        }
                        actionLabel={searchQuery || statusFilter ? 'Clear Filters' : 'Browse Properties'}
                        onAction={() => {
                            if (searchQuery || statusFilter) {
                                setSearchQuery('');
                                setStatusFilter('');
                            } else {
                                router.push('/listings');
                            }
                        }}
                    />
                ) : (
                    <div className="space-y-md">
                        {filteredInquiries.map((inquiry) => {
                            const StatusIcon = STATUS_CONFIG[inquiry.status].icon;
                            return (
                                <motion.div
                                    key={inquiry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className="hover:shadow-md transition-shadow">
                                        <div className="p-lg">
                                            <div className="flex items-start justify-between mb-md">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Building2 className="w-5 h-5 text-brand-primary" />
                                                        <button
                                                            onClick={() => router.push(`/properties/${inquiry.property.id}`)}
                                                            className="text-h3 hover:text-brand-primary transition-colors"
                                                        >
                                                            {inquiry.property.title}
                                                        </button>
                                                    </div>
                                                    <p className="text-small text-neutral-text-secondary">
                                                        {formatRelativeTime(inquiry.createdAt)}
                                                    </p>
                                                </div>
                                                <Badge variant={STATUS_CONFIG[inquiry.status].variant}>
                                                    <StatusIcon className="w-4 h-4 mr-1" />
                                                    {STATUS_CONFIG[inquiry.status].label}
                                                </Badge>
                                            </div>

                                            {/* Your Message */}
                                            <div className="bg-neutral-bg p-md rounded-lg mb-md">
                                                <p className="text-tiny text-neutral-text-secondary mb-1">Your Message</p>
                                                <p className="text-body">{inquiry.message}</p>
                                                {inquiry.preferredViewingDate && (
                                                    <div className="flex items-center gap-2 mt-2 text-small text-neutral-text-secondary">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>Preferred viewing: {formatDate(inquiry.preferredViewingDate)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Owner Response */}
                                            {inquiry.response && (
                                                <div className="bg-brand-primary/5 p-md rounded-lg border-l-4 border-brand-primary">
                                                    <p className="text-tiny text-brand-primary mb-1 font-semibold">Owner Response</p>
                                                    <p className="text-body">{inquiry.response}</p>
                                                </div>
                                            )}
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
