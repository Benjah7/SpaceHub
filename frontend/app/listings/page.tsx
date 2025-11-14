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
import { debounce, buildQueryString } from '@/lib/utils';
import { PropertyType, PropertyStatus, PROPERTY_TYPE_LABELS } from '@/types';
import type { Property, SearchFilters, PaginatedResponse } from '@/types';
import { useLanguageStore } from '@/lib/store/language-store';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list' | 'map';

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

const ITEMS_PER_PAGE = 12;

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguageStore();

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

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (filters.location) params.neighborhood = filters.location;
      if (filters.propertyType && filters.propertyType.length > 0) {
        params.propertyType = filters.propertyType[0];
      }
      if (filters.minPrice) params.minRent = filters.minPrice;
      if (filters.maxPrice) params.maxRent = filters.maxPrice;
      if (filters.status && filters.status.length > 0) {
        params.status = filters.status[0];
      }

      const response = await apiClient.getProperties(params);
      
      setProperties(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to load properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Debounced search
  const handleSearchChange = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, location: value }));
    setCurrentPage(1);
  }, 500);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      propertyType: [],
      minPrice: undefined,
      maxPrice: undefined,
      status: [PropertyStatus.AVAILABLE],
    });
    setCurrentPage(1);
  };

  const handlePropertyClick = (property: Property) => {
    router.push(`/properties/${property.id}`);
  };

  const activeFiltersCount = [
    filters.propertyType?.length || 0,
    filters.minPrice ? 1 : 0,
    filters.maxPrice ? 1 : 0,
    filters.location ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-xl"
        >
          <h1 className="text-h1 mb-md">{t('listings.title')}</h1>
          <p className="text-body text-neutral-text-secondary">
            {t('listings.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-lg"
        >
          <Card>
            <div className="p-md">
              <div className="flex flex-col md:flex-row gap-md">
                {/* Search */}
                <div className="flex-1">
                  <Input
                    placeholder={t('listings.filterByLocation')}
                    leftIcon={<Search className="w-5 h-5" />}
                    defaultValue={filters.location}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>

                {/* View Mode */}
                <div className="hidden md:flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    leftIcon={<Grid className="w-4 h-4" />}
                  >
                    {t('listings.gridView')}
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    leftIcon={<ListIcon className="w-4 h-4" />}
                  >
                    {t('listings.listView')}
                  </Button>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="secondary"
                  leftIcon={<Filter className="w-4 h-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {t('common.filter')}
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-md pt-md border-t border-neutral-border"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                      <Select
                        label={t('listings.filterByType')}
                        options={[
                          { value: '', label: 'All Types' },
                          ...Object.values(PropertyType).map((type) => ({
                            value: type,
                            label: PROPERTY_TYPE_LABELS[type],
                          })),
                        ]}
                        value={filters.propertyType?.[0] || ''}
                        onChange={(e) =>
                          handleFilterChange(
                            'propertyType',
                            e.target.value ? [e.target.value as PropertyType] : []
                          )
                        }
                      />

                      <Input
                        type="number"
                        label={t('listings.filterByPrice') + ' (Min)'}
                        placeholder="Min price"
                        value={filters.minPrice || ''}
                        onChange={(e) =>
                          handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
                        }
                      />

                      <Input
                        type="number"
                        label={t('listings.filterByPrice') + ' (Max)'}
                        placeholder="Max price"
                        value={filters.maxPrice || ''}
                        onChange={(e) =>
                          handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>

                    <div className="flex gap-md mt-md">
                      <Button variant="primary" size="sm" onClick={fetchProperties}>
                        {t('common.apply')}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                        {t('common.clear')}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-md">
            <p className="text-small text-neutral-text-secondary">
              {totalItems} {t('listings.resultsFound')}
            </p>
          </div>
        )}

        {/* Properties Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {[...Array(6)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t('listings.noResults')}
            description={t('listings.noResultsDescription')}
            actionLabel={t('common.reset')}
            onAction={handleClearFilters}
          />
        ) : (
          <>
            <motion.div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg'
                  : 'flex flex-col gap-lg'
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyCard
                    property={property}
                    onClick={handlePropertyClick}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-xl">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  loading={loading}
                  showInfo
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}