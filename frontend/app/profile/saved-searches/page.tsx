'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Edit, Bell, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useSavedSearches } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { SavedSearch } from '@/types';

export default function SavedSearchesPage() {
    const router = useRouter();
    const { data: searches, loading, refetch } = useSavedSearches();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (searchId: string) => {
        setDeleting(true);
        try {
            await apiClient.deleteSavedSearch(searchId);
            toast.success('Search deleted successfully');
            await refetch();
        } catch (error) {
            toast.error('Failed to delete search');
        } finally {
            setDeleting(false);
            setDeletingId(null);
        }
    };

    const handleRunSearch = (search: SavedSearch) => {
        const params = new URLSearchParams();
        if (search.criteria.neighborhood) params.set('neighborhood', search.criteria.neighborhood);
        if (search.criteria.minRent) params.set('minPrice', search.criteria.minRent.toString());
        if (search.criteria.maxRent) params.set('maxPrice', search.criteria.maxRent.toString());
        if (search.criteria.propertyType) params.set('type', search.criteria.propertyType);
        router.push(`/listings?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={4} />
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
                    <h1 className="text-h1 mb-2">Saved Searches</h1>
                    <p className="text-body text-neutral-text-secondary">
                        Quick access to your favorite search criteria
                    </p>
                </motion.div>

                {!searches || searches.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No saved searches"
                        description="Save your search criteria to quickly find properties later"
                        actionLabel="Search Properties"
                        onAction={() => router.push('/listings')}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                        {searches.map((search) => (
                            <motion.div
                                key={search.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <div className="p-lg">
                                        <div className="flex items-start justify-between mb-md">
                                            <div className="flex-1">
                                                <h3 className="text-h3 mb-2">{search.name}</h3>
                                                <p className="text-small text-neutral-text-secondary">
                                                    Saved {formatDate(search.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="text"
                                                    size="sm"
                                                    leftIcon={<Trash2 className="w-4 h-4" />}
                                                    onClick={() => setDeletingId(search.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Search Criteria */}
                                        <div className="space-y-2 mb-lg">
                                            {search.criteria.neighborhood && (
                                                <div className="flex items-center gap-2 text-small">
                                                    <MapPin className="w-4 h-4 text-neutral-text-secondary" />
                                                    <span>{search.criteria.neighborhood}</span>
                                                </div>
                                            )}
                                            {(search.criteria.minRent || search.criteria.maxRent) && (
                                                <div className="flex items-center gap-2 text-small">
                                                    <DollarSign className="w-4 h-4 text-neutral-text-secondary" />
                                                    <span>
                                                        {search.criteria.minRent && formatCurrency(search.criteria.minRent)}
                                                        {search.criteria.minRent && search.criteria.maxRent && ' - '}
                                                        {search.criteria.maxRent && formatCurrency(search.criteria.maxRent)}
                                                    </span>
                                                </div>
                                            )}
                                            {search.criteria.propertyType && (
                                                <Badge variant="default">{search.criteria.propertyType}</Badge>
                                            )}
                                        </div>

                                        <Button
                                            variant="primary"
                                            fullWidth
                                            onClick={() => handleRunSearch(search)}
                                        >
                                            Run Search
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <ConfirmDialog
                    isOpen={!!deletingId}
                    onClose={() => setDeletingId(null)}
                    onConfirm={() => {
                        if (!deletingId) return;
                        return handleDelete(deletingId);
                    }}
                    title="Delete Saved Search"
                    description="Are you sure you want to delete this saved search?"
                    confirmLabel="Delete"
                    variant="danger"
                    loading={deleting}
                />
            </div>
        </div>
    );
}
