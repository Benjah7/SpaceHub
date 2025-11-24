'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { PROPERTY_TYPE_LABELS, PropertyType } from '@/types';
import type { Property } from '@/types';

const NAIROBI_CENTER = { lat: -1.2864, lng: 36.8172 };

export default function MapViewPage() {
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [propertyType, setPropertyType] = useState<string>('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [neighborhood, setNeighborhood] = useState<string>('');
    const [searchRadius, setSearchRadius] = useState(5);
    const [mapCenter, setMapCenter] = useState(NAIROBI_CENTER);

    // Fetch all available properties once
    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            try {
                const response = await apiClient.getProperties({
                    page: 1,
                    limit: 200, // Get a large number for map view
                    status: 'AVAILABLE'
                });
                setAllProperties(response.data || []);
                setFilteredProperties(response.data || []);
            } catch (error) {
                ErrorHandler.handle(error as Error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Apply filters to properties
    const applyFilters = useCallback(() => {
        let filtered = [...allProperties];

        // Filter by property type
        if (propertyType) {
            filtered = filtered.filter(p => p.propertyType === propertyType);
        }

        // Filter by price range
        if (minPrice) {
            filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Filter by neighborhood (case-insensitive partial match)
        if (neighborhood) {
            const searchTerm = neighborhood.toLowerCase();
            filtered = filtered.filter(p =>
                p.location.neighborhood.toLowerCase().includes(searchTerm) ||
                p.location.city.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by radius (if user has set a custom center)
        if (mapCenter.lat !== NAIROBI_CENTER.lat || mapCenter.lng !== NAIROBI_CENTER.lng) {
            filtered = filtered.filter(p => {
                const distance = calculateDistance(
                    mapCenter.lat,
                    mapCenter.lng,
                    p.location.lat,
                    p.location.lng
                );
                return distance <= searchRadius;
            });
        }

        setFilteredProperties(filtered);
    }, [allProperties, propertyType, minPrice, maxPrice, neighborhood, mapCenter, searchRadius]);

    // Apply filters when any filter changes
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleRadiusChange = (radius: number) => {
        setSearchRadius(radius);
    };

    const clearFilters = () => {
        setPropertyType('');
        setMinPrice('');
        setMaxPrice('');
        setNeighborhood('');
        setSearchRadius(5);
        setMapCenter(NAIROBI_CENTER);
    };

    const propertyTypeOptions = [
        { value: '', label: 'All Types' },
        ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
        })),
    ];

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-neutral-bg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
                    <p className="text-neutral-secondary">Loading properties...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Filter Bar */}
            <div className="bg-white border-b border-neutral-border p-4 shadow-sm">
                <div className="container mx-auto">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold text-neutral-primary">
                                Map View
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-neutral-secondary">
                                    Showing {filteredProperties.length} of {allProperties.length} properties
                                </span>
                                {(propertyType || minPrice || maxPrice || neighborhood) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                label="Neighborhood"
                                value={neighborhood}
                                onChange={(e) => setNeighborhood(e.target.value)}
                                placeholder="e.g., Westlands, CBD"
                                leftIcon={<Search className="w-4 h-4" />}
                            />

                            <Select
                                label="Property Type"
                                value={propertyType}
                                onChange={(e) => setPropertyType(e.target.value)}
                                options={propertyTypeOptions}
                            />

                            <Input
                                label="Min Price (KES)"
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="20,000"
                            />

                            <Input
                                label="Max Price (KES)"
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="100,000"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                {filteredProperties.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-bg">
                        <div className="text-center">
                            <Search className="w-16 h-16 mx-auto text-neutral-tertiary mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-primary mb-2">
                                No Properties Found
                            </h3>
                            <p className="text-neutral-secondary mb-4">
                                Try adjusting your filters to see more results
                            </p>
                            <Button onClick={clearFilters}>
                                Clear All Filters
                            </Button>
                        </div>
                    </div>
                ) : (
                    <PropertyMap
                        properties={filteredProperties}
                        center={mapCenter}
                        height="100%"
                        onRadiusChanged={handleRadiusChange}
                        showRadiusControl={true}
                        initialRadius={searchRadius}
                    />
                )}
            </div>
        </div>
    );
}