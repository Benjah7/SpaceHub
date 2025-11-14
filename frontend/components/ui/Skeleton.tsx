'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

/**
 * Base skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, animate = true }) => {
  return (
    <div
      className={cn(
        'bg-neutral-border rounded',
        animate && 'animate-pulse',
        className
      )}
    />
  );
};

/**
 * Property card skeleton
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <motion.div
      className="card overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-t-md" />
      
      <div className="p-md space-y-md">
        {/* Status badge skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Location skeleton */}
        <Skeleton className="h-4 w-1/2" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        {/* Price and size skeleton */}
        <div className="flex items-center justify-between pt-md border-t">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </motion.div>
  );
};

/**
 * Property detail skeleton
 */
export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-xl">
      {/* Image gallery skeleton */}
      <div className="space-y-md">
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-md">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        <div className="lg:col-span-2 space-y-lg">
          {/* Title */}
          <Skeleton className="h-8 w-3/4" />
          
          {/* Location */}
          <Skeleton className="h-6 w-1/2" />
          
          {/* Description */}
          <div className="space-y-md">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          
          {/* Amenities */}
          <div className="space-y-md">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-md">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-lg">
          <div className="card p-lg space-y-md">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard stats skeleton
 */
export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-lg space-y-md">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
};

/**
 * List item skeleton
 */
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="card p-md flex items-center gap-md">
      <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24 rounded-lg flex-shrink-0" />
    </div>
  );
};

/**
 * Table row skeleton
 */
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr>
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="p-md">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  );
};

/**
 * Form skeleton
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => {
  return (
    <div className="space-y-lg">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
};

/**
 * List skeleton (multiple items)
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-md">
      {[...Array(count)].map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
};