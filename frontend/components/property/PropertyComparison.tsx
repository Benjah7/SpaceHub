// frontend/components/property/PropertyComparison.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    X,
    Check,
    MapPin,
    Square,
    Building2,
    Calendar,
    Eye,
    MessageSquare,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useComparisonStore } from '@/lib/store/comparison-store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS, PropertyType } from '@/types';
import type { Property } from '@/types';

interface ComparisonRow {
    label: string;
    key: string;
    type?: 'currency' | 'number' | 'text' | 'date' | 'amenities' | 'badge' | 'location';
    icon?: React.ReactNode;
}

const COMPARISON_ROWS: ComparisonRow[] = [
    { label: 'Monthly Rent', key: 'price', type: 'currency', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Property Type', key: 'propertyType', type: 'badge', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Size (sq m)', key: 'size', type: 'number', icon: <Square className="w-4 h-4" /> },
    { label: 'Location', key: 'location', type: 'location', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Available From', key: 'availableFrom', type: 'date', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Views', key: 'views', type: 'number', icon: <Eye className="w-4 h-4" /> },
    { label: 'Inquiries', key: 'inquiries', type: 'number', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Amenities', key: 'amenities', type: 'amenities' },
];

export const PropertyComparison: React.FC = () => {
    const router = useRouter();
    const { properties, removeProperty, clearComparison } = useComparisonStore();

    if (properties.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Building2 className="w-16 h-16 mx-auto text-neutral-tertiary mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-primary mb-2">
                        No Properties to Compare
                    </h3>
                    <p className="text-neutral-secondary mb-6">
                        Add properties from listings to compare them side by side
                    </p>
                    <Button onClick={() => router.push('/listings')}>
                        Browse Properties
                    </Button>
                </div>
            </div>
        );
    }

    const formatValue = (property: Property, row: ComparisonRow): React.ReactNode => {
        const value = (property as any)[row.key];

        if (value === null || value === undefined) {
            return <span className="text-neutral-tertiary">—</span>;
        }

        switch (row.type) {
            case 'currency':
                return <span className="font-mono font-semibold">{formatCurrency(value)}</span>;

            case 'number':
                return <span className="font-mono">{value.toLocaleString()}</span>;

            case 'date':
                return formatDate(value);

            case 'location':
                return (
                    <div>
                        <div className="font-medium">{property.location.neighborhood}</div>
                        <div className="text-sm text-neutral-tertiary">{property.location.city}</div>
                    </div>
                );

            case 'badge':
                if (row.key === 'propertyType') {
                    return (
                        <Badge variant="info">
                            {PROPERTY_TYPE_LABELS[value as PropertyType] || value}
                        </Badge>
                    );
                }
                return value;

            case 'amenities':
                if (!Array.isArray(value) || value.length === 0) {
                    return <span className="text-neutral-tertiary">None listed</span>;
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {value.slice(0, 3).map((amenity, idx) => (
                            <Badge key={idx} variant="secondary" >
                                {amenity.name}
                            </Badge>
                        ))}
                        {value.length > 3 && (
                            <Badge variant="secondary">
                                +{value.length - 3}
                            </Badge>
                        )}
                    </div>
                );

            default:
                return String(value);
        }
    };

    const getBestValue = (row: ComparisonRow): string[] => {
        const propertyIds: string[] = [];

        if (row.key === 'price') {
            const minPrice = Math.min(...properties.map(p => p.price));
            properties.forEach(p => {
                if (p.price === minPrice) propertyIds.push(p.id);
            });
        } else if (row.key === 'size') {
            const maxSize = Math.max(...properties.map(p => p.size));
            properties.forEach(p => {
                if (p.size === maxSize) propertyIds.push(p.id);
            });
        }

        return propertyIds;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-primary">
                        Property Comparison
                    </h1>
                    <p className="text-neutral-secondary mt-1">
                        Comparing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                    </p>
                </div>
                {properties.length > 0 && (
                    <Button variant="outline" onClick={clearComparison}>
                        Clear All
                    </Button>
                )}
            </div>

            {/* Comparison Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Property Headers */}
                        <thead>
                            <tr className="border-b-2 border-neutral-border">
                                <th className="bg-neutral-bg p-4 text-left font-semibold text-neutral-primary sticky left-0 z-10 w-48">
                                    Property
                                </th>
                                {properties.map((property) => (
                                    <th key={property.id} className="p-4 min-w-[280px]">
                                        <div className="relative">
                                            {/* Remove button */}
                                            <button
                                                onClick={() => removeProperty(property.id)}
                                                className="absolute -top-2 -right-2 p-1 bg-status-error text-white rounded-full hover:bg-status-error/80 transition-colors z-10"
                                                aria-label="Remove from comparison"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>

                                            {/* Property Image */}
                                            <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                                                <Image
                                                    src={property.images[0]?.url || '/placeholder-property.jpg'}
                                                    alt={property.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="280px"
                                                />
                                            </div>

                                            {/* Property Title */}
                                            <h3 className="font-semibold text-neutral-primary text-left mb-1 line-clamp-2">
                                                {property.title}
                                            </h3>
                                            <p className="text-sm text-neutral-secondary text-left line-clamp-1">
                                                {property.location.address}
                                            </p>

                                            {/* View Details Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 w-full"
                                                onClick={() => router.push(`/properties/${property.id}`)}
                                            >
                                                View Details
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Comparison Rows */}
                        <tbody>
                            {COMPARISON_ROWS.map((row, idx) => {
                                const bestValues = getBestValue(row);

                                return (
                                    <tr
                                        key={row.key}
                                        className={`border-b border-neutral-border ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-bg'
                                            }`}
                                    >
                                        <td className="sticky left-0 z-10 bg-inherit p-4 font-medium text-neutral-primary">
                                            <div className="flex items-center gap-2">
                                                {row.icon}
                                                {row.label}
                                            </div>
                                        </td>
                                        {properties.map((property) => {
                                            const isBest = bestValues.includes(property.id);

                                            return (
                                                <td
                                                    key={property.id}
                                                    className={`p-4 text-left ${isBest ? 'bg-brand-primary/5' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>{formatValue(property, row)}</div>
                                                        {isBest && bestValues.length > 0 && (
                                                            <Badge variant="success">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Best
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/listings')}
                >
                    Add More Properties
                </Button>
                <Button
                    onClick={() => {
                        if (properties[0]) {
                            router.push(`/properties/${properties[0].id}`);
                        }
                    }}
                >
                    View First Property
                </Button>
            </div>
        </div>
    );
};