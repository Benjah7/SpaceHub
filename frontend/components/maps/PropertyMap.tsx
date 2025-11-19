'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { Navigation, Search, Loader2, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import type { Property, MapBounds } from '@/types';

const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];

const mapContainerStyle = {
    width: '100%',
    height: '600px',
};

// Nairobi center coordinates
const nairobiCenter = {
    lat: -1.2864,
    lng: 36.8172,
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    clickableIcons: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};

interface PropertyMapProps {
    properties: Property[];
    center?: { lat: number; lng: number };
    zoom?: number;
    onMarkerClick?: (property: Property) => void;
    onBoundsChanged?: (bounds: MapBounds) => void;
    showRadius?: boolean;
    radiusKm?: number;
    onRadiusChange?: (radiusKm: number) => void;
    showSearch?: boolean;
    height?: string;
}

export function PropertyMap({
    properties,
    center = nairobiCenter,
    zoom = 12,
    onMarkerClick,
    onBoundsChanged,
    showRadius = false,
    radiusKm = 5,
    onRadiusChange,
    showSearch = true,
    height = '600px',
}: PropertyMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [mapCenter, setMapCenter] = useState(center);
    const [currentRadius, setCurrentRadius] = useState(radiusKm);
    const [searchValue, setSearchValue] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);

        // Initialize search box if enabled
        if (showSearch && inputRef.current && window.google) {
            const searchBox = new google.maps.places.SearchBox(inputRef.current);
            searchBoxRef.current = searchBox;

            // Bias search to map's viewport
            map.addListener('bounds_changed', () => {
                searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
            });

            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();
                if (places && places.length > 0) {
                    const place = places[0];
                    if (place.geometry?.location) {
                        const newCenter = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        };
                        setMapCenter(newCenter);
                        map.panTo(newCenter);
                        map.setZoom(15);
                    }
                }
            });
        }
    }, [showSearch]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleBoundsChanged = useCallback(() => {
        if (map && onBoundsChanged) {
            const bounds = map.getBounds();
            if (bounds) {
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                onBoundsChanged({
                    north: ne.lat(),
                    south: sw.lat(),
                    east: ne.lng(),
                    west: sw.lng(),
                });
            }
        }
    }, [map, onBoundsChanged]);

    const handleMarkerClick = (property: Property) => {
        setSelectedProperty(property);
        if (onMarkerClick) {
            onMarkerClick(property);
        }
    };

    const handleGetUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setMapCenter(location);
                    if (map) {
                        map.panTo(location);
                        map.setZoom(14);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    const handleRadiusChange = (newRadius: number) => {
        setCurrentRadius(newRadius);
        if (onRadiusChange) {
            onRadiusChange(newRadius);
        }
    };

    if (loadError) {
        return (
            <Card className="p-xl">
                <div className="text-center">
                    <p className="text-body text-status-error">Error loading maps</p>
                </div>
            </Card>
        );
    }

    if (!isLoaded) {
        return (
            <Card className="p-xl">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    <span className="ml-2">Loading map...</span>
                </div>
            </Card>
        );
    }

    return (
        <div className="relative">
            {/* Map Controls Overlay */}
            {showSearch && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
                    <Card className="shadow-lg">
                        <div className="p-md">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search location..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        leftIcon={<Search className="w-5 h-5" />}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleGetUserLocation}
                                    title="Use my location"
                                >
                                    <Navigation className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Radius Control */}
            {showRadius && (
                <div className="absolute top-4 right-4 z-10">
                    <Card className="shadow-lg">
                        <div className="p-md">
                            <label className="block text-small font-semibold mb-2">Search Radius</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="25"
                                    step="1"
                                    value={currentRadius}
                                    onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                                    className="w-32"
                                />
                                <span className="text-small font-semibold">{currentRadius} km</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Property Count Badge */}
            <div className="absolute bottom-4 left-4 z-10">
                <Badge variant="info" className="shadow-lg">
                    <Building2 className="w-4 h-4 mr-1" />
                    {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
                </Badge>
            </div>

            {/* Map */}
            <GoogleMap
                mapContainerStyle={{ ...mapContainerStyle, height }}
                center={mapCenter}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onBoundsChanged={handleBoundsChanged}
                options={mapOptions}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#3498DB',
                            fillOpacity: 1,
                            strokeColor: '#fff',
                            strokeWeight: 2,
                        }}
                    />
                )}

                {/* Search Radius Circle */}
                {showRadius && (
                    <Circle
                        center={mapCenter}
                        radius={currentRadius * 1000} // Convert km to meters
                        options={{
                            strokeColor: '#E67E22',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#E67E22',
                            fillOpacity: 0.15,
                        }}
                    />
                )}

                {/* Property Markers */}
                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={{
                            lat: property.location.lat,
                            lng: property.location.lng,
                        }}
                        onClick={() => handleMarkerClick(property)}
                        icon={{
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C8.95 0 0 8.95 0 20C0 35 20 52 20 52C20 52 40 35 40 20C40 8.95 31.05 0 20 0Z" fill="${property.status === 'AVAILABLE' ? '#E67E22' : '#95A5A6'}"/>
                  <circle cx="20" cy="20" r="8" fill="white"/>
                </svg>
              `),
                            scaledSize: new google.maps.Size(40, 52),
                            anchor: new google.maps.Point(20, 52),
                        }}
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
                        <div className="p-2" style={{ maxWidth: '250px' }}>
                            {selectedProperty.images.length > 0 && (
                                <img
                                    src={selectedProperty.images[0].url}
                                    alt={selectedProperty.title}
                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                            )}
                            <h3 className="font-semibold text-body mb-1">{selectedProperty.title}</h3>
                            <p className="text-small text-neutral-text-secondary mb-2">
                                {selectedProperty.location.address}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-h3 font-bold text-brand-primary">
                                    {formatCurrency(selectedProperty.price)}
                                </span>
                                <Badge
                                    variant={selectedProperty.status === 'AVAILABLE' ? 'success' : 'secondary'}
                                >
                                    {selectedProperty.status}
                                </Badge>
                            </div>
                            <button
                                onClick={() => window.open(`/properties/${selectedProperty.id}`, '_blank')}
                                className="mt-2 w-full bg-brand-primary text-white py-2 rounded-lg text-small font-semibold hover:bg-brand-secondary transition-colors"
                            >
                                View Details
                            </button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
