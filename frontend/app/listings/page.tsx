'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, MapPin, Grid, List as ListIcon, Map } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useLanguageStore } from '@/lib/store/language-store';
import type { Property, PropertyType, SearchFilters } from '@/types';
import { cn, debounce } from '@/lib/utils';

type ViewMode = 'grid' | 'list' | 'map';

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguageStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle responsive filter visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowFilters(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('q') || '',
    propertyType: [],
    minPrice: undefined,
    maxPrice: undefined,
    minSize: undefined,
    maxSize: undefined,
    amenities: [],
    verified: false,
  });

  const propertyTypes: PropertyType[] = ['SHOP', 'KIOSK', 'OFFICE', 'WAREHOUSE', 'STALL'];
  
  const neighborhoods = [
    'CBD',
    'Westlands',
    'Kilimani',
    'Eastlands',
    'Industrial Area',
    'Karen',
    'Lavington',
  ];

  const amenitiesList = [
    'Parking',
    'WiFi',
    'Security',
    'Water',
    'Electricity',
    'Generator',
  ];

  // Fetch properties based on filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get<PaginatedResponse<Property>>('/properties', { params: filters });
      // setProperties(response.data.data);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProperties([]);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const handleFilterChange = debounce((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, 300);

  const handlePropertyTypeToggle = (type: PropertyType) => {
    setFilters(prev => {
      const types = prev.propertyType || [];
      const newTypes = types.includes(type)
        ? types.filter(t => t !== type)
        : [...types, type];
      return { ...prev, propertyType: newTypes };
    });
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      propertyType: [],
      minPrice: undefined,
      maxPrice: undefined,
      minSize: undefined,
      maxSize: undefined,
      amenities: [],
      verified: false,
    });
  };

  const activeFiltersCount = 
    (filters.propertyType?.length || 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.amenities?.length || 0);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg mb-xl">
          <div>
            <h1 className="text-h1 mb-2">Property Listings</h1>
            <p className="text-body text-neutral-text-secondary">
              {properties.length} properties found
            </p>
          </div>

          <div className="flex items-center gap-md">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-neutral-surface rounded-sm p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'grid'
                    ? 'bg-brand-primary text-white'
                    : 'text-neutral-text-secondary hover:text-brand-primary'
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'list'
                    ? 'bg-brand-primary text-white'
                    : 'text-neutral-text-secondary hover:text-brand-primary'
                )}
              >
                <ListIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'map'
                    ? 'bg-brand-primary text-white'
                    : 'text-neutral-text-secondary hover:text-brand-primary'
                )}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="secondary"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-5 h-5" />}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="error" animated>
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-xl">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                className="w-full md:w-80 flex-shrink-0"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Card className="sticky top-20">
                  <div className="flex items-center justify-between mb-lg">
                    <h2 className="text-h3 font-semibold">Filters</h2>
                    <div className="flex items-center gap-2">
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="text"
                          size="sm"
                          onClick={resetFilters}
                        >
                          Reset
                        </Button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="md:hidden text-neutral-text-secondary hover:text-neutral-text-primary"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-lg">
                    {/* Location */}
                    <div>
                      <label className="block text-small font-medium mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        placeholder="Search location..."
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        leftIcon={<MapPin className="w-4 h-4" />}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {neighborhoods.map((neighborhood) => (
                          <button
                            key={neighborhood}
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              location: neighborhood
                            }))}
                            className={cn(
                              'px-3 py-1 rounded-full text-tiny transition-colors',
                              filters.location === neighborhood
                                ? 'bg-brand-primary text-white'
                                : 'bg-neutral-bg text-neutral-text-secondary hover:bg-neutral-border'
                            )}
                          >
                            {neighborhood}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-small font-medium mb-2">
                        Property Type
                      </label>
                      <div className="space-y-2">
                        {propertyTypes.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.propertyType?.includes(type)}
                              onChange={() => handlePropertyTypeToggle(type)}
                              className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                            />
                            <span className="text-small">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-small font-medium mb-2">
                        Price Range (KES/month)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ''}
                          onChange={(e) =>
                            handleFilterChange('minPrice', Number(e.target.value))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) =>
                            handleFilterChange('maxPrice', Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    {/* Size Range */}
                    <div>
                      <label className="block text-small font-medium mb-2">
                        Size (sqm)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minSize || ''}
                          onChange={(e) =>
                            handleFilterChange('minSize', Number(e.target.value))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxSize || ''}
                          onChange={(e) =>
                            handleFilterChange('maxSize', Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-small font-medium mb-2">
                        Amenities
                      </label>
                      <div className="space-y-2">
                        {amenitiesList.map((amenity) => (
                          <label
                            key={amenity}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.amenities?.includes(amenity)}
                              onChange={(e) => {
                                const amenities = filters.amenities || [];
                                const newAmenities = e.target.checked
                                  ? [...amenities, amenity]
                                  : amenities.filter(a => a !== amenity);
                                setFilters(prev => ({
                                  ...prev,
                                  amenities: newAmenities
                                }));
                              }}
                              className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                            />
                            <span className="text-small">{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Verified Only */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verified}
                          onChange={(e) =>
                            setFilters(prev => ({
                              ...prev,
                              verified: e.target.checked
                            }))
                          }
                          className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                        />
                        <span className="text-small font-medium">
                          Verified properties only
                        </span>
                      </label>
                    </div>
                  </div>
                </Card>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Properties Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-3xl">
                <div className="spinner w-12 h-12" />
              </div>
            ) : properties.length === 0 ? (
              <Card className="text-center py-3xl">
                <p className="text-h3 text-neutral-text-secondary mb-md">
                  No properties found
                </p>
                <p className="text-body text-neutral-text-secondary mb-lg">
                  Try adjusting your filters or search terms
                </p>
                <Button variant="primary" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Card>
            ) : (
              <div
                className={cn(
                  viewMode === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl',
                  viewMode === 'list' && 'space-y-lg'
                )}
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={(p) => router.push(`/properties/${p.id}`)}
                    onContact={(p) => console.log('Contact', p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
