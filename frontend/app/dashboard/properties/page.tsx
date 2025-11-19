'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plus,
    Search,
    Eye,
    MessageSquare,
    Edit,
    Trash2,
    MapPin,
    DollarSign,
    Square,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useProperties } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { PROPERTY_STATUS_LABELS, PropertyStatus } from '@/types';
import type { Property } from '@/types';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'RENTED', label: 'Rented' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'INACTIVE', label: 'Inactive' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'views', label: 'Most Viewed' },
];

export default function DashboardPropertiesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { t } = useLanguageStore();

    // Filters and pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch properties with filters
    const { data, loading, total, totalPages, refetch } = useProperties({
        ownerId: user?.id,
        status: statusFilter || undefined,
        page: currentPage,
        limit: 12,
        sortBy: sortBy.includes('price') ? 'price' : sortBy === 'views' ? 'views' : 'createdAt',
        sortOrder: sortBy.includes('high') || sortBy === 'newest' ? 'desc' : 'asc',

    });

    // Filter properties by search query on client side
    const filteredProperties = React.useMemo(() => {
        if (!data) return [];
        if (!searchQuery.trim()) return data;

        const query = searchQuery.toLowerCase();
        return data.filter(
            (property) =>
                property.title.toLowerCase().includes(query) ||
                property.location.address.toLowerCase().includes(query) ||
                property.location.neighborhood.toLowerCase().includes(query)
        );
    }, [data, searchQuery]);

    const handleDeleteProperty = async () => {
        if (!propertyToDelete) return;

        setIsDeleting(true);
        try {
            await apiClient.deleteProperty(propertyToDelete.id);
            toast.success('Property deleted successfully');
            setShowDeleteDialog(false);
            setPropertyToDelete(null);
            refetch();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to delete property');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (propertyId: string, newStatus: PropertyStatus) => {
        try {
            await apiClient.updateProperty(propertyId, { status: newStatus });
            toast.success('Property status updated');
            refetch();
        } catch (error) {
            ErrorHandler.handle(error, 'Failed to update property status');
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={6} />
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
                    <div className="flex items-center justify-between mb-md">
                        <div>
                            <h1 className="text-h1 mb-2">{t('dashboard.myProperties')}</h1>
                            <p className="text-body text-neutral-text-secondary">
                                Manage all your property listings in one place
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            leftIcon={<Plus className="w-5 h-5" />}
                            href="/dashboard/properties/new"
                        >
                            Add Property
                        </Button>
                    </div>

                    {/* Filters and Search */}
                    <Card>
                        <div className="p-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <Input
                                        placeholder="Search by title, address, or neighborhood..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        leftIcon={<Search className="w-5 h-5" />}
                                    />
                                </div>

                                {/* Status Filter */}
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    options={STATUS_OPTIONS}
                                />

                                {/* Sort */}
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    options={SORT_OPTIONS}
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Properties Grid */}
                {filteredProperties.length > 0 ? (
                    <>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence mode="wait">
                                {filteredProperties.map((property) => (
                                    <motion.div
                                        key={property.id}
                                        variants={itemVariants}
                                        layout
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card className="h-full">
                                            <div className="relative h-48 w-full">
                                                {property.images && property.images.length > 0 ? (
                                                    <Image
                                                        src={property.images[0].url}
                                                        alt={property.title}
                                                        fill
                                                        className="object-cover rounded-t-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-border flex items-center justify-center rounded-t-lg">
                                                        <Building2 className="w-16 h-16 text-neutral-text-tertiary" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <Badge
                                                        variant={
                                                            property.status === 'AVAILABLE'
                                                                ? 'success'
                                                                : property.status === 'RENTED'
                                                                    ? 'error'
                                                                    : 'warning'
                                                        }
                                                    >
                                                        {PROPERTY_STATUS_LABELS[property.status]}
                                                    </Badge>
                                                </div>
                                                {/* {property.featured && (
                                                    <div className="absolute top-3 right-3">
                                                        <Badge variant='default'>Featured</Badge>
                                                    </div>
                                                )} */}
                                            </div>

                                            <div className="p-lg">
                                                <h3
                                                    className="text-h3 mb-2 line-clamp-1 cursor-pointer hover:text-brand-primary transition-colors"
                                                    onClick={() => router.push(`/properties/${property.id}`)}
                                                >
                                                    {property.title}
                                                </h3>

                                                <div className="flex items-center gap-2 text-small text-neutral-text-secondary mb-md">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    <span className="line-clamp-1">{property.location.neighborhood}</span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mb-md pb-md border-b border-neutral-border">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-neutral-text-tertiary" />
                                                        <span className="text-small font-semibold">
                                                            {formatCurrency(property.price)}/mo
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Square className="w-4 h-4 text-neutral-text-tertiary" />
                                                        <span className="text-small">
                                                            {formatNumber(property.size)} ft²
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center justify-between mb-md">
                                                    <div className="flex items-center gap-4 text-tiny text-neutral-text-secondary">
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>{formatNumber(property.views)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span>{property.inquiries}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-tiny text-neutral-text-tertiary">
                                                        {formatDate(property.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        fullWidth
                                                        leftIcon={<Eye className="w-4 h-4" />}
                                                        onClick={() => router.push(`/properties/${property.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        fullWidth
                                                        leftIcon={<Edit className="w-4 h-4" />}
                                                        onClick={() =>
                                                            router.push(`/dashboard/properties/${property.id}/edit`)
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setPropertyToDelete(property);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-status-error" />
                                                    </Button>
                                                </div>

                                                {/* Quick Status Change */}
                                                {property.status !== 'RENTED' && (
                                                    <div className="mt-md pt-md border-t border-neutral-border">
                                                        <select
                                                            value={property.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    property.id,
                                                                    e.target.value as PropertyStatus
                                                                )
                                                            }
                                                            className="w-full text-small py-2 px-3 border border-neutral-border rounded-lg bg-neutral-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                                        >
                                                            <option value="AVAILABLE">Available</option>
                                                            <option value="PENDING">Pending</option>
                                                            <option value="RENTED">Rented</option>
                                                            <option value="INACTIVE">Inactive</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                loading={loading}
                                showInfo
                                totalItems={total}
                                itemsPerPage={12}
                            />
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={Building2}
                        title={
                            searchQuery || statusFilter
                                ? 'No properties found'
                                : 'No properties yet'
                        }
                        description={
                            searchQuery || statusFilter
                                ? 'Try adjusting your filters to find what you\'re looking for'
                                : 'Get started by adding your first property listing'
                        }
                        actionLabel={searchQuery || statusFilter ? 'Clear Filters' : 'Add Property'}
                        onAction={
                            searchQuery || statusFilter
                                ? () => {
                                    setSearchQuery('');
                                    setStatusFilter('');
                                }
                                : undefined
                        }
                        actionHref={
                            !searchQuery && !statusFilter ? '/dashboard/properties/new' : undefined
                        }
                    />
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setPropertyToDelete(null);
                }}
                onConfirm={handleDeleteProperty}
                title="Delete Property"
                description={`Are you sure you want to delete "${propertyToDelete?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}