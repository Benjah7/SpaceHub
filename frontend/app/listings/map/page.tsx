
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, List, X } from 'lucide-react';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/Button';
import { useProperties } from '@/lib/hooks/useApi';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Property, MapBounds } from '@/types';

export default function MapViewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showList, setShowList] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [, setMapBounds] = useState<MapBounds | null>(null);
    const [radiusKm, setRadiusKm] = useState(5);

    // Get initial filters from URL
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const initialCenter = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

    const { data: properties, loading } = useProperties({
        limit: 100,
        // Add bounds filtering when available
    });

    const handleMarkerClick = (property: Property) => {
        setSelectedProperty(property);
        setShowList(true);
    };

    const handleViewDetails = (propertyId: string) => {
        router.push(`/properties/${propertyId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen overflow-hidden">
            {/* Map */}
            <div className="h-full">
                <PropertyMap
                    properties={properties || []}
                    center={initialCenter}
                    onMarkerClick={handleMarkerClick}
                    onBoundsChanged={setMapBounds}
                    showRadius
                    radiusKm={radiusKm}
                    onRadiusChange={setRadiusKm}
                    height="100vh"
                />
            </div>

            {/* Sidebar */}
            <motion.div
                className={`absolute top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-20 ${showList ? 'block' : 'hidden'
                    }`}
                initial={false}
                animate={{ x: showList ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-md border-b border-neutral-border flex items-center justify-between">
                        <h2 className="text-h3 font-bold">
                            {properties?.length || 0} Properties
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowList(false)}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Property List */}
                    <div className="flex-1 overflow-y-auto p-md space-y-md">
                        {properties && properties.length > 0 ? (
                            properties.map((property) => (
                                <div
                                    key={property.id}
                                    className={`cursor-pointer transition-all ${selectedProperty?.id === property.id ? 'ring-2 ring-brand-primary' : ''
                                        }`}
                                    onClick={() => setSelectedProperty(property)}
                                >
                                    <PropertyCard
                                        property={property}
                                        onClick={() => handleViewDetails(property.id)}
        
                                    />
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                icon={MapPin}
                                title="No properties found"
                                description="Try adjusting the map view or search radius"
                            />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Toggle List Button */}
            <Button
                variant="primary"
                size="lg"
                className="fixed bottom-4 right-4 z-10 shadow-lg md:hidden"
                onClick={() => setShowList(!showList)}
                leftIcon={showList ? <MapPin /> : <List />}
            >
                {showList ? 'Show Map' : 'Show List'}
            </Button>
        </div>
    );
}

