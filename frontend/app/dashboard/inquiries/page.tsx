'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Mail,
    Phone,
    Calendar,
    Building2,
    Send,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useReceivedInquiries } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { useLanguageStore } from '@/lib/store/language-store';
import type { Inquiry } from '@/types';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

const STATUS_FILTERS = [
    { value: '', label: 'All Inquiries' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'RESPONDED', label: 'Responded' },
    { value: 'CLOSED', label: 'Closed' },
];

export default function DashboardInquiriesPage() {
    const router = useRouter();
    useLanguageStore();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [isResponding, setIsResponding] = useState(false);

    // Fetch inquiries
    const { data: inquiries, loading, refetch } = useReceivedInquiries();

    // Filter inquiries
    const filteredInquiries = React.useMemo(() => {
        if (!inquiries) return [];

        let filtered = [...inquiries];

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter((inquiry) => inquiry.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (inquiry) =>
                    inquiry.tenant?.name?.toLowerCase().includes(query) ||
                    inquiry.tenant?.email?.toLowerCase().includes(query) ||
                    inquiry.property?.title?.toLowerCase().includes(query) ||
                    inquiry.message.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [inquiries, statusFilter, searchQuery]);

    const handleRespond = async (status: 'RESPONDED' | 'CLOSED') => {
        if (!selectedInquiry || !responseText.trim()) {
            toast.error('Please enter a response message');
            return;
        }

        setIsResponding(true);
        try {
            await apiClient.respondToInquiry(selectedInquiry.id, responseText, status);
            toast.success(
                status === 'RESPONDED' ? 'Response sent successfully' : 'Inquiry closed'
            );
            setShowResponseModal(false);
            setSelectedInquiry(null);
            setResponseText('');
            refetch();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to respond to inquiry');
        } finally {
            setIsResponding(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="warning">Pending</Badge>;
            case 'RESPONDED':
                return <Badge variant="info">Responded</Badge>;
            case 'CLOSED':
                return <Badge variant="default">Closed</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Clock className="w-5 h-5 text-status-warning" />;
            case 'RESPONDED':
                return <CheckCircle className="w-5 h-5 text-status-info" />;
            case 'CLOSED':
                return <XCircle className="w-5 h-5 text-neutral-text-tertiary" />;
            default:
                return <MessageSquare className="w-5 h-5" />;
        }
    };

    // Count by status
    const statusCounts = React.useMemo(() => {
        if (!inquiries) return { pending: 0, responded: 0, closed: 0 };

        return {
            pending: inquiries.filter((i) => i.status === 'PENDING').length,
            responded: inquiries.filter((i) => i.status === 'RESPONDED').length,
            closed: inquiries.filter((i) => i.status === 'CLOSED').length,
        };
    }, [inquiries]);

    if (loading && !inquiries) {
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
                    className="mb-xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-h1 mb-2">Inquiries</h1>
                    <p className="text-body text-neutral-text-secondary mb-lg">
                        Manage and respond to property inquiries from potential tenants
                    </p>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                        <Card>
                            <div className="p-md flex items-center gap-md">
                                <div className="p-3 bg-status-warning/10 rounded-lg">
                                    <Clock className="w-6 h-6 text-status-warning" />
                                </div>
                                <div>
                                    <p className="text-tiny text-neutral-text-secondary">Pending</p>
                                    <p className="text-h2 font-bold">{statusCounts.pending}</p>
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-md flex items-center gap-md">
                                <div className="p-3 bg-status-info/10 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-status-info" />
                                </div>
                                <div>
                                    <p className="text-tiny text-neutral-text-secondary">Responded</p>
                                    <p className="text-h2 font-bold">{statusCounts.responded}</p>
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-md flex items-center gap-md">
                                <div className="p-3 bg-neutral-text-tertiary/10 rounded-lg">
                                    <XCircle className="w-6 h-6 text-neutral-text-tertiary" />
                                </div>
                                <div>
                                    <p className="text-tiny text-neutral-text-secondary">Closed</p>
                                    <p className="text-h2 font-bold">{statusCounts.closed}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <div className="p-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <Input
                                    placeholder="Search by tenant name, email, or property..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    leftIcon={<Search className="w-5 h-5" />}
                                />
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={STATUS_FILTERS}
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Inquiries List */}
                {filteredInquiries.length > 0 ? (
                    <motion.div
                        className="space-y-md"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="wait">
                            {filteredInquiries.map((inquiry) => (
                                <motion.div key={inquiry.id} variants={itemVariants} layout>
                                    <Card>
                                        <div className="p-lg">
                                            <div className="flex items-start justify-between mb-md">
                                                <div className="flex items-start gap-md flex-1">
                                                    <div className="p-3 bg-brand-primary/10 rounded-lg flex-shrink-0">
                                                        {getStatusIcon(inquiry.status)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-h3 line-clamp-1">
                                                                {inquiry.tenant?.name || 'Unknown Tenant'}
                                                            </h3>
                                                            {getStatusBadge(inquiry.status)}
                                                        </div>

                                                        {/* Property Info */}
                                                        {inquiry.property && (
                                                            <button
                                                                onClick={() =>
                                                                    router.push(`/properties/${inquiry.property.id}`)
                                                                }
                                                                className="flex items-center gap-2 text-small text-brand-primary hover:underline mb-2"
                                                            >
                                                                <Building2 className="w-4 h-4" />
                                                                <span className="line-clamp-1">
                                                                    {inquiry.property.title}
                                                                </span>
                                                            </button>
                                                        )}

                                                        {/* Message */}
                                                        <p className="text-body text-neutral-text-secondary mb-md line-clamp-2">
                                                            {inquiry.message}
                                                        </p>

                                                        {/* Contact Info */}
                                                        <div className="flex flex-wrap items-center gap-4 text-small text-neutral-text-tertiary">
                                                            {inquiry.tenant?.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="w-4 h-4" />
                                                                    <a
                                                                        href={`mailto:${inquiry.tenant.email}`}
                                                                        className="hover:text-brand-primary"
                                                                    >
                                                                        {inquiry.tenant.email}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {inquiry.tenant?.phone && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="w-4 h-4" />
                                                                    <a
                                                                        href={`tel:${inquiry.tenant.phone}`}
                                                                        className="hover:text-brand-primary"
                                                                    >
                                                                        {inquiry.tenant.phone}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {inquiry.preferredViewingDate && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>
                                                                        Viewing: {formatDate(inquiry.preferredViewingDate)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    <span className="text-tiny text-neutral-text-tertiary">
                                                        {formatRelativeTime(inquiry.createdAt)}
                                                    </span>
                                                    {inquiry.status === 'PENDING' && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            leftIcon={<Send className="w-4 h-4" />}
                                                            onClick={() => {
                                                                setSelectedInquiry(inquiry);
                                                                setShowResponseModal(true);
                                                            }}
                                                        >
                                                            Respond
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Response (if exists) */}
                                            {inquiry.response && (
                                                <div className="mt-md pt-md border-t border-neutral-border">
                                                    <p className="text-small font-semibold text-neutral-text-primary mb-1">
                                                        Your Response:
                                                    </p>
                                                    <p className="text-small text-neutral-text-secondary">
                                                        {inquiry.response}
                                                    </p>
                                                    {inquiry.updatedAt !== inquiry.createdAt && (
                                                        <p className="text-tiny text-neutral-text-tertiary mt-1">
                                                            Responded {formatRelativeTime(inquiry.updatedAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={MessageSquare}
                        title={searchQuery || statusFilter ? 'No inquiries found' : 'No inquiries yet'}
                        description={
                            searchQuery || statusFilter
                                ? 'Try adjusting your filters'
                                : 'Property inquiries will appear here'
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

            {/* Response Modal */}
            <Modal
                isOpen={showResponseModal}
                onClose={() => {
                    setShowResponseModal(false);
                    setSelectedInquiry(null);
                    setResponseText('');
                }}
                title="Respond to Inquiry"
            >
                {selectedInquiry && (
                    <div className="space-y-lg">
                        {/* Inquiry Details */}
                        <div className="p-md bg-neutral-bg rounded-lg">
                            <p className="text-small font-semibold mb-2">
                                From: {selectedInquiry.tenant?.name}
                            </p>
                            <p className="text-small text-neutral-text-secondary mb-2">
                                Property: {selectedInquiry.property?.title}
                            </p>
                            <p className="text-small text-neutral-text-secondary">
                                "{selectedInquiry.message}"
                            </p>
                        </div>

                        {/* Response Input */}
                        <Textarea
                            label="Your Response"
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Type your response to the tenant..."
                            rows={5}
                            required
                        />

                        {/* Actions */}
                        <div className="flex items-center gap-md">
                            <Button
                                variant="primary"
                                fullWidth
                                leftIcon={<Send className="w-5 h-5" />}
                                onClick={() => handleRespond('RESPONDED')}
                                disabled={isResponding || !responseText.trim()}
                                isLoading={isResponding}
                            >
                                Send Response
                            </Button>
                            <Button
                                variant="secondary"
                                fullWidth
                                leftIcon={<XCircle className="w-5 h-5" />}
                                onClick={() => handleRespond('CLOSED')}
                                disabled={isResponding || !responseText.trim()}
                                isLoading={isResponding}
                            >
                                Send & Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}