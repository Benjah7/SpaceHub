'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Maximize2,
    Minimize2,
    Plus,
    Minus,
    Navigation,
    Layers,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { PROPERTY_TYPE_LABELS } from '@/types';
import type { Property, MapBounds } from '@/types';

const NAIROBI_CENTER = { lat: -1.2864, lng: 36.8172 };
const DEFAULT_ZOOM = 12;

interface PropertyMapProps {
    properties: Property[];
    center?: { lat: number; lng: number };
    zoom?: number;
    height?: string;
    onBoundsChanged?: (bounds: MapBounds) => void;
    onRadiusChanged?: (radius: number) => void;
    showRadiusControl?: boolean;
    initialRadius?: number;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};

export const PropertyMap: React.FC<PropertyMapProps> = ({
    properties,
    center = NAIROBI_CENTER,
    zoom = DEFAULT_ZOOM,
    height = '600px',
    onBoundsChanged,
    onRadiusChanged,
    showRadiusControl = false,
    initialRadius = 5,
}) => {
    const router = useRouter();
    const mapRef = useRef<google.maps.Map | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mapCenter, setMapCenter] = useState(center);
    const [mapZoom, setMapZoom] = useState(zoom);
    const [searchRadius, setSearchRadius] = useState(initialRadius);
    const [showRadius, setShowRadius] = useState(showRadiusControl);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    const handleBoundsChanged = useCallback(() => {
        if (!mapRef.current || !onBoundsChanged) return;

        const bounds = mapRef.current.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        onBoundsChanged({
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng(),
        });
    }, [onBoundsChanged]);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const zoomIn = () => {
        if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom() || mapZoom;
            mapRef.current.setZoom(currentZoom + 1);
        }
    };

    const zoomOut = () => {
        if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom() || mapZoom;
            mapRef.current.setZoom(currentZoom - 1);
        }
    };

    const goToUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMapCenter(userLocation);
                    if (mapRef.current) {
                        mapRef.current.panTo(userLocation);
                        mapRef.current.setZoom(14);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const adjustRadius = (delta: number) => {
        const newRadius = Math.max(1, Math.min(50, searchRadius + delta));
        setSearchRadius(newRadius);
        if (onRadiusChanged) {
            onRadiusChanged(newRadius);
        }
    };

    const markerIcon = (property: Property): google.maps.Icon => ({
        url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" 
              fill="${property.status === 'AVAILABLE' ? '#2D5F5D' : '#94A3B8'}" 
              stroke="#FFFFFF" 
              stroke-width="2"/>
        <circle cx="20" cy="18" r="8" fill="#FFFFFF"/>
        <text x="20" y="23" text-anchor="middle" font-size="12" font-weight="bold" fill="${property.status === 'AVAILABLE' ? '#2D5F5D' : '#94A3B8'}">
          ${Math.round(property.price / 1000)}K
        </text>
      </svg>
    `),
        scaledSize: new google.maps.Size(40, 50),
        anchor: new google.maps.Point(20, 50),
    });

    if (!isLoaded) {
        return (
            <div
                className="bg-neutral-bg rounded-xl flex items-center justify-center"
                style={{ height }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
                    <p className="text-neutral-secondary">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-xl overflow-hidden border-2 border-neutral-border ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''
                }`}
            style={{ height: isFullScreen ? '100vh' : height }}
        >
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                options={mapOptions}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onBoundsChanged={handleBoundsChanged}
                onZoomChanged={() => {
                    if (mapRef.current) {
                        setMapZoom(mapRef.current.getZoom() || mapZoom);
                    }
                }}
            >
                {/* Radius Circle */}
                {showRadius && (
                    <Circle
                        center={mapCenter}
                        radius={searchRadius * 1000}
                        options={{
                            fillColor: '#2D5F5D',
                            fillOpacity: 0.1,
                            strokeColor: '#2D5F5D',
                            strokeOpacity: 0.5,
                            strokeWeight: 2,
                        }}
                    />
                )}

                {/* Property Markers - USE location.lat and location.lng */}
                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={{
                            lat: property.location.lat,
                            lng: property.location.lng,
                        }}
                        icon={markerIcon(property)}
                        onClick={() => setSelectedProperty(property)}
                    />
                ))}

                {/* Info Window */}
                {selectedProperty && (
                    <InfoWindow
                        position={{
                            lat: selectedProperty.location.lat,
                            lng: selectedProperty.location.lng,
                        }}
                        onCloseClick={() => setSelectedProperty(null)}
                    >
                        <div className="p-2 max-w-xs">
                            <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                                <Image
                                    src={selectedProperty.images[0]?.url || '/placeholder-property.jpg'}
                                    alt={selectedProperty.title}
                                    fill
                                    className="object-cover"
                                    sizes="300px"
                                />
                            </div>
                            <h3 className="font-semibold text-neutral-primary mb-1">
                                {selectedProperty.title}
                            </h3>
                            <p className="text-sm text-neutral-secondary mb-2">
                                {selectedProperty.location.address}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono font-bold text-brand-primary">
                                    {formatCurrency(selectedProperty.price)}
                                </span>
                                <Badge variant="secondary">
                                    {PROPERTY_TYPE_LABELS[selectedProperty.propertyType]}
                                </Badge>
                            </div>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push(`/properties/${selectedProperty.id}`)}
                            >
                                View Details
                            </Button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullScreen}
                    className="bg-white shadow-lg"
                >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={zoomIn}
                        className="border-b border-neutral-border rounded-none"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={zoomOut} className="rounded-none">
                        <Minus className="w-4 h-4" />
                    </Button>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToUserLocation}
                    className="bg-white shadow-lg"
                >
                    <Navigation className="w-4 h-4" />
                </Button>

                {showRadiusControl && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowRadius(!showRadius)}
                        className={`bg-white shadow-lg ${showRadius ? 'bg-brand-primary text-white' : ''}`}
                    >
                        <Layers className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Radius Control */}
            {showRadiusControl && showRadius && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-neutral-primary whitespace-nowrap">
                            Search Radius:
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => adjustRadius(-1)}
                                disabled={searchRadius <= 1}
                            >
                                <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-mono font-bold text-brand-primary min-w-[60px] text-center">
                                {searchRadius} km
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => adjustRadius(1)}
                                disabled={searchRadius >= 50}
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Property Count Badge */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
                <span className="text-sm font-medium text-neutral-primary">
                    {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
                </span>
            </div>

            {/* Close Fullscreen */}
            {isFullScreen && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullScreen}
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg"
                >
                    <X className="w-4 h-4 mr-2" />
                    Exit Fullscreen
                </Button>
            )}
        </div>
    );
};