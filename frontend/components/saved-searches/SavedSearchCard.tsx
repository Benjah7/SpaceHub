'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Search,
    Trash2,
    Edit2,
    MapPin,
    DollarSign,
    Building2,
    Calendar,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/types';
import type { SavedSearch } from '@/types';

interface SavedSearchCardProps {
    search: SavedSearch;
    onDelete: (id: string) => void;
    onEdit: (search: SavedSearch) => void;
}

export const SavedSearchCard: React.FC<SavedSearchCardProps> = ({
    search,
    onDelete,
    onEdit,
}) => {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const buildSearchUrl = (): string => {
        const params = new URLSearchParams();
        const { criteria } = search;

        if (criteria.neighborhood) params.set('neighborhood', criteria.neighborhood);
        if (criteria.minRent) params.set('minRent', criteria.minRent.toString());
        if (criteria.maxRent) params.set('maxRent', criteria.maxRent.toString());
        if (criteria.propertyType) params.set('propertyType', criteria.propertyType);
        if (criteria.minSquareFeet) params.set('minSquareFeet', criteria.minSquareFeet.toString());
        if (criteria.maxSquareFeet) params.set('maxSquareFeet', criteria.maxSquareFeet.toString());

        return `/listings?${params.toString()}`;
    };

    const handleSearch = () => {
        router.push(buildSearchUrl());
    };

    const handleDelete = () => {
        onDelete(search.id);
        setShowDeleteModal(false);
    };

    const getCriteriaSummary = () => {
        const { criteria } = search;
        const parts: React.ReactNode[] = [];

        if (criteria.neighborhood) {
            parts.push(
                <div key="location" className="flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3" />
                    {criteria.neighborhood}
                </div>
            );
        }

        if (criteria.minRent || criteria.maxRent) {
            const priceText = criteria.minRent && criteria.maxRent
                ? `${formatCurrency(criteria.minRent)} - ${formatCurrency(criteria.maxRent)}`
                : criteria.minRent
                    ? `From ${formatCurrency(criteria.minRent)}`
                    : `Up to ${formatCurrency(criteria.maxRent!)}`;

            parts.push(
                <div key="price" className="flex items-center gap-1 text-sm">
                    <DollarSign className="w-3 h-3" />
                    {priceText}
                </div>
            );
        }

        if (criteria.propertyType) {
            parts.push(
                <Badge key="type" variant="secondary">
                    <Building2 className="w-3 h-3 mr-1" />
                    {PROPERTY_TYPE_LABELS[criteria.propertyType]}
                </Badge>
            );
        }

        return parts;
    };

    return (
        <>
            <Card className="p-6 hover:border-brand-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-primary mb-1">
                            {search.name}
                        </h3>
                        <div className="flex items-center gap-2 text-neutral-tertiary text-xs">
                            <Calendar className="w-3 h-3" />
                            Saved {formatDate(search.createdAt)}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(search)}
                            aria-label="Edit search"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteModal(true)}
                            className="text-status-error hover:text-status-error"
                            aria-label="Delete search"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                    {getCriteriaSummary()}
                </div>

                <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleSearch}
                >
                    <Search className="w-4 h-4 mr-2" />
                    Run Search
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </Card>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Saved Search"
            >
                <div className="space-y-4">
                    <p className="text-neutral-secondary">
                        Are you sure you want to delete "{search.name}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDelete}
                            className="bg-status-error hover:bg-status-error/90"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};