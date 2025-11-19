'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart as HeartIcon, Trash2, MapPin, Square, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useFavorites } from '@/lib/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/types';
import { useRouter } from 'next/navigation';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

export default function FavoritesPage() {
    const router = useRouter();
    const { data: favorites, loading, toggleFavorite, refetch } = useFavorites();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (propertyId: string) => {
        try {
            await toggleFavorite(propertyId, true);
            await refetch();
        } catch (error) {
            // Error handled by hook
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={6} />
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
                    <h1 className="text-h1 mb-2">My Favorites</h1>
                    <p className="text-body text-neutral-text-secondary">
                        Properties you've saved for later
                    </p>
                </motion.div>

                {!favorites || favorites.length === 0 ? (
                    <EmptyState
                        icon={HeartIcon}
                        title="No favorites yet"
                        description="Start exploring and save properties you like"
                        actionLabel="Browse Properties"
                        onAction={() => router.push('/listings')}
                    />
                ) : (
                    <>
                        <div className="mb-lg">
                            <p className="text-body text-neutral-text-secondary">
                                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
                            </p>
                        </div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {favorites.map((property) => (
                                <motion.div key={property.id} variants={itemVariants}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                        {/* Image */}
                                        <div className="relative h-48 bg-neutral-bg">
                                            {property.images[0] ? (
                                                <img
                                                    src={property.images[0].url}
                                                    alt={property.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Square className="w-12 h-12 text-neutral-text-secondary" />
                                                </div>
                                            )}
                                            <Badge
                                                variant="default"
                                                className="absolute top-3 left-3"
                                            >
                                                {PROPERTY_TYPE_LABELS[property.propertyType]}
                                            </Badge>
                                        </div>

                                        {/* Content */}
                                        <div className="p-lg">
                                            <h3 className="text-h3 mb-2 line-clamp-1">{property.title}</h3>

                                            <div className="flex items-center gap-2 text-small text-neutral-text-secondary mb-3">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{property.location.neighborhood}</span>
                                            </div>

                                            <div className="flex items-baseline gap-2 mb-lg">
                                                <span className="text-h2 font-bold text-brand-primary">
                                                    {formatCurrency(property.price)}
                                                </span>
                                                <span className="text-small text-neutral-text-secondary">/month</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-small text-neutral-text-secondary mb-lg">
                                                <Square className="w-4 h-4" />
                                                <span>{property.size} m²</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    fullWidth
                                                    leftIcon={<ExternalLink className="w-4 h-4" />}
                                                    onClick={() => router.push(`/properties/${property.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    leftIcon={<Trash2 className="w-4 h-4" />}
                                                    onClick={() => setRemovingId(property.id)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}

                <ConfirmDialog
                    isOpen={!!removingId}
                    onClose={() => setRemovingId(null)}
                    onConfirm={() => handleRemove(removingId as string)}
                    title="Remove from Favorites"
                    description="Are you sure you want to remove this property from your favorites?"
                    confirmLabel="Remove"
                    variant="danger"
                />
            </div>
        </div>
    );
}
