'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, MapPin, Grid, List as ListIcon, Map, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { PropertyStatus, PROPERTY_TYPE_LABELS } from '@/types';
import type { Property, SearchFilters } from '@/types';
import { useLanguageStore } from '@/lib/store/language-store';

type ViewMode = 'grid' | 'list';


const ITEMS_PER_PAGE = 12;

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useLanguageStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('q') || '',
    propertyType: [],
    minPrice: undefined,
    maxPrice: undefined,
    status: [PropertyStatus.AVAILABLE],
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.location) params.neighborhood = filters.location;
      if (Array.isArray(filters.propertyType) && filters.propertyType.length > 0) params.propertyType = filters.propertyType[0];
      if (filters.minPrice) params.minRent = filters.minPrice;
      if (filters.maxPrice) params.maxRent = filters.maxPrice;

      const result = await apiClient.getProperties(params);
      setProperties(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      propertyType: [],
      minPrice: undefined,
      maxPrice: undefined,
      status: [PropertyStatus.AVAILABLE],
    });
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  ).length;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-lg">
          <div>
            <h1 className="text-h1 mb-2">Property Listings</h1>
            <p className="text-body text-neutral-text-secondary">
              {totalItems} properties available
            </p>
          </div>
          
          <div className="flex gap-md">
            {/* Map View Button */}
            <Button
              variant="secondary"
              leftIcon={<Map className="w-5 h-5" />}
              onClick={() => router.push('/listings/map')}
            >
              Map View
            </Button>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="md"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="md"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              leftIcon={<Filter />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-lg"
            >
              <Card>
                <div className="p-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                    <Input
                      placeholder="Search location..."
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      leftIcon={<Search />}
                    />

                    <Select
                      value={filters.propertyType?.[0] || ''}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value ? [e.target.value] : [])}
                      options={[
                        { value: '', label: 'All Types' },
                        ...Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }))
                      ]}
                    />

                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />

                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>

                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-md"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg' : 'space-y-lg'}>
            {[...Array(6)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <motion.div
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg' : 'space-y-lg'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {properties.map(property => (
                <div
                  key={property.id}
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className="cursor-pointer"
                >
                  <PropertyCard
                    property={property}
                  />
                </div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="mt-xl">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showInfo
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No properties found"
            description="Try adjusting your filters or search criteria"
            actionLabel="Clear Filters"
            onAction={clearFilters}
          />
        )}
      </div>
    </div>
  );
}