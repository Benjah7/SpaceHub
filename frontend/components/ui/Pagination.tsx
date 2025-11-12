'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  showInfo = true,
  totalItems,
  itemsPerPage,
}) => {
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // In the middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    onPageChange(page);
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1;
  const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0);

  return (
    <div className="flex flex-col items-center gap-md py-lg">
      {/* Pagination info */}
      {showInfo && totalItems && itemsPerPage && (
        <p className="text-small text-neutral-text-secondary">
          Showing {startItem} to {endItem} of {totalItems} results
        </p>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          className="min-w-[100px]"
        >
          Previous
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-neutral-text-secondary"
              >
                ...
              </span>
            ) : (
              <motion.button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={cn(
                  'min-w-[40px] h-[40px] px-3 py-2 rounded-lg transition-all',
                  'font-medium text-small',
                  page === currentPage
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-neutral-text-primary hover:bg-neutral-border',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={page !== currentPage && !loading ? { scale: 1.05 } : undefined}
                whileTap={page !== currentPage && !loading ? { scale: 0.95 } : undefined}
              >
                {page}
              </motion.button>
            )
          )}
        </div>

        {/* Next button */}
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          className="min-w-[100px]"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
