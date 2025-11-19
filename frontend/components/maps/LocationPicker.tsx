'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const libraries: ('places' | 'geometry')[] = ['places', 'geometry'];

const nairobiCenter = { lat: -1.2921, lng: 36.8219 };

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

interface LocationPickerProps {
    initialLocation?: { lat: number; lng: number };
    onLocationSelect: (location: {
        lat: number;
        lng: number;
        address: string;
        neighborhood?: string;
    }) => void;
}

export function LocationPicker({ initialLocation = nairobiCenter, onLocationSelect }: LocationPickerProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [markerPosition, setMarkerPosition] = useState(initialLocation);
    const [address, setAddress] = useState('');
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                const newLocation = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setSelectedLocation(newLocation);
                setMarkerPosition(newLocation);
                setAddress(place.formatted_address || '');

                if (map) {
                    map.panTo(newLocation);
                    map.setZoom(16);
                }

                // Extract neighborhood
                const neighborhood = place.address_components?.find(
                    (component) => component.types.includes('sublocality') || component.types.includes('neighborhood')
                )?.long_name;

                onLocationSelect({
                    lat: newLocation.lat,
                    lng: newLocation.lng,
                    address: place.formatted_address || '',
                    neighborhood,
                });
            }
        }
    };

    const handleMapClick = async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });

            // Reverse geocode to get address
            if (window.google) {
                const geocoder = new google.maps.Geocoder();
                try {
                    const result = await geocoder.geocode({ location: { lat, lng } });
                    if (result.results[0]) {
                        const formattedAddress = result.results[0].formatted_address;
                        setAddress(formattedAddress);

                        const neighborhood = result.results[0].address_components.find(
                            (component) => component.types.includes('sublocality') || component.types.includes('neighborhood')
                        )?.long_name;

                        onLocationSelect({
                            lat,
                            lng,
                            address: formattedAddress,
                            neighborhood,
                        });
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                }
            }
        }
    };

    const handleGetUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setSelectedLocation(location);
                    setMarkerPosition(location);

                    if (map) {
                        map.panTo(location);
                        map.setZoom(16);
                    }

                    // Get address for user location
                    if (window.google) {
                        const geocoder = new google.maps.Geocoder();
                        try {
                            const result = await geocoder.geocode({ location });
                            if (result.results[0]) {
                                const formattedAddress = result.results[0].formatted_address;
                                setAddress(formattedAddress);

                                const neighborhood = result.results[0].address_components.find(
                                    (component) =>
                                        component.types.includes('sublocality') ||
                                        component.types.includes('neighborhood')
                                )?.long_name;

                                onLocationSelect({
                                    lat: location.lat,
                                    lng: location.lng,
                                    address: formattedAddress,
                                    neighborhood,
                                });
                            }
                        } catch (error) {
                            console.error('Geocoding error:', error);
                        }
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
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
        <div className="space-y-md">
            {/* Search Input */}
            <Card>
                <div className="p-md">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                                <Input
                                    type="text"
                                    placeholder="Search for a location..."
                                    leftIcon={<Search className="w-5 h-5" />}
                                />
                            </Autocomplete>
                        </div>
                        <Button variant="primary" size="md" onClick={handleGetUserLocation} title="Use my location">
                            <Navigation className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                {/* Map */}
                <Card>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={selectedLocation}
                        zoom={15}
                        onLoad={onLoad}
                        onClick={handleMapClick}
                        options={{}}
                    >
                        <Marker position={markerPosition} draggable onDragEnd={handleMapClick} />
                    </GoogleMap>
                </Card>
            </Card>

            {/* Selected Location Info */}
            {address && (
                <Card>
                    <div className="p-md">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-small font-semibold mb-1">Selected Location</p>
                                <p className="text-small text-neutral-text-secondary">{address}</p>
                                <p className="text-tiny text-neutral-text-tertiary mt-1">
                                    {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <p className="text-tiny text-neutral-text-tertiary">
                💡 Click on the map or search for a location to set the property coordinates
            </p>
        </div>
    );
}
