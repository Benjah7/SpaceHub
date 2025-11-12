'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  MapPin,
  Grid,
  List as ListIcon,
  Map,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { debounce, cn } from '@/lib/utils';
import type { Property, SearchFilters, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list' | 'map';

const propertyTypes = ['SHOP', 'KIOSK', 'OFFICE', 'WAREHOUSE', 'STALL'] as const;

const neighborhoods = [
  'CBD',
  'Westlands',
  'Kilimani',
  'Eastlands',
  'Industrial Area',
  'Karen',
  'Lavington',
  'Parklands',
  'Embakasi',
  'Kasarani',
];

const amenitiesList = [
  'Parking',
  'WiFi',
  'Security',
  'Water',
  'Electricity',
  'Restrooms',
  'Air Conditioning',
  'Backup Generator',
];

const ITEMS_PER_PAGE = 12;

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });

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

  const [searchQuery, setSearchQuery] = useState(filters.location || '');

  // Set showFilters after mount based on screen size
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setShowFilters(true);
    }
  }, []);

  // Fetch properties from API
  const fetchProperties = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.location) params.location = filters.location;
      if (filters.propertyType?.length) {
        params.propertyType = filters.propertyType.join(',');
      }
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minSize) params.minSize = filters.minSize;
      if (filters.maxSize) params.maxSize = filters.maxSize;
      if (filters.amenities?.length) {
        params.amenities = filters.amenities.join(',');
      }
      if (filters.verified) params.verified = true;

      const response = await apiClient.get<PaginatedResponse<Property>>(
        '/properties',
        { params }
      );

      if (response.success && response.data) {
        setProperties(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch properties');
      }
    } catch (err) {
      const errorMessage = 'Failed to load properties';
      setError(errorMessage);
      ErrorHandler.handle(err, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties(1);
  }, [fetchProperties]);

  const debouncedSearchRef = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, location: query }));
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearchRef(value);
  };

  const handlePageChange = (page: number) => {
    fetchProperties(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePropertyClick = (property: Property) => {
    router.push(`/properties/${property.id}`);
  };

  const handleContactOwner = (property: Property) => {
    router.push(`/properties/${property.id}#contact`);
  };

  const handleClearFilters = () => {
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
    setSearchQuery('');
    toast.success('Filters cleared');
  };

  const activeFiltersCount = [
    Array.isArray(filters.propertyType) && filters.propertyType.length > 0,
    filters.minPrice,
    filters.maxPrice,
    filters.minSize,
    filters.maxSize,
    Array.isArray(filters.amenities) && filters.amenities.length > 0,
    filters.verified,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-bg py-xl">
      <div className="container-custom">
        <div className="mb-xl">
          <h1 className="text-h1 mb-md">Property Listings</h1>
          <p className="text-body text-neutral-text-secondary">
            Browse available retail spaces in Nairobi
          </p>
        </div>

        <Card className="p-md mb-lg">
          <div className="flex flex-col md:flex-row gap-md">
            <div className="flex-1">
              <Input
                placeholder="Search by location, neighborhood, or property type..."
                value={searchQuery}
                onChange={handleSearchChange}
                leftIcon={<Search className="w-5 h-5" />}
                rightIcon={
                  searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilters(prev => ({ ...prev, location: '' }));
                      }}
                      className="text-neutral-text-secondary hover:text-neutral-text-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )
                }
              />
            </div>
            <Button variant="primary" leftIcon={<Search />}>
              Search
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between mb-lg">
          <div className="text-body text-neutral-text-secondary">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing {properties.length} of {pagination.total} properties
                {activeFiltersCount > 0 && ` (${activeFiltersCount} filters active)`}
              </>
            )}
          </div>

          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center gap-1 bg-neutral-surface rounded-lg p-1">
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

            <Button
              variant="secondary"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-5 h-5" />}
            >
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="error" animated className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                leftIcon={<X className="w-5 h-5" />}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-xl">
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                className="w-full md:w-80 flex-shrink-0"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <Card className="p-lg sticky top-4">
                  <div className="flex items-center justify-between mb-lg">
                    <h2 className="text-h3 font-semibold">Filters</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="md:hidden p-2 hover:bg-neutral-surface rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-lg">
                    <div>
                      <label className="block text-small font-medium mb-md">
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
                              checked={filters.propertyType?.includes(type as any) || false}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...(filters.propertyType || []), type as any]
                                  : (filters.propertyType || []).filter((t) => t !== type);
                                setFilters((prev) => ({
                                  ...prev,
                                  propertyType: newTypes,
                                }));
                              }}
                              className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                            />
                            <span className="text-small">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-small font-medium mb-md">
                        Neighborhood
                      </label>
                      <Select
                        options={[
                          { value: '', label: 'All Neighborhoods' },
                          ...neighborhoods.map((n) => ({ value: n, label: n })),
                        ]}
                        value={filters.location || ''}
                        onChange={(e) =>
                          setFilters((prev) => ({ ...prev, location: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-small font-medium mb-md">
                        Monthly Rent (KES)
                      </label>
                      <div className="grid grid-cols-2 gap-md">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              minPrice: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxPrice: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-small font-medium mb-md">
                        Size (sqm)
                      </label>
                      <div className="grid grid-cols-2 gap-md">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minSize || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              minSize: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxSize || ''}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              maxSize: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-small font-medium mb-md">
                        Amenities
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {amenitiesList.map((amenity) => (
                          <label
                            key={amenity}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.amenities?.includes(amenity) || false}
                              onChange={(e) => {
                                const newAmenities = e.target.checked
                                  ? [...(filters.amenities || []), amenity]
                                  : (filters.amenities || []).filter((a) => a !== amenity);
                                setFilters((prev) => ({
                                  ...prev,
                                  amenities: newAmenities,
                                }));
                              }}
                              className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                            />
                            <span className="text-small">{amenity}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verified}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              verified: e.target.checked,
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

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
                {[...Array(6)].map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon={<X className="w-full h-full" />}
                title="Error Loading Properties"
                description={error}
                action={{
                  label: 'Try Again',
                  onClick: () => fetchProperties(1),
                }}
              />
            ) : properties.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-full h-full" />}
                title="No Properties Found"
                description="We couldn't find any properties matching your search criteria. Try adjusting your filters or search in a different area."
                action={{
                  label: 'Clear Filters',
                  onClick: handleClearFilters,
                }}
              />
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onClick={handlePropertyClick}
                      onContact={handleContactOwner}
                    />
                  ))}
                </motion.div>

                {pagination.totalPages > 1 && (
                  <div className="mt-xl">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      loading={loading}
                      showInfo
                      totalItems={pagination.total}
                      itemsPerPage={pagination.limit}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}