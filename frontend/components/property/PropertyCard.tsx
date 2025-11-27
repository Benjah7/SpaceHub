'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Eye, MessageSquare, Check, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useComparisonStore } from '@/lib/store/comparison-store';
import type { Property, PropertyStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useLanguageStore } from '@/lib/store/language-store';
import { PROPERTY_TYPE_LABELS } from '@/types';
import toast from 'react-hot-toast';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface PropertyCardProps {
  property: Property;
  onClick?: (property: Property) => void;
  onContact?: (property: Property) => void;
}

const statusVariant: Record<PropertyStatus, 'success' | 'warning' | 'error'> = {
  AVAILABLE: 'success',
  RENTED: 'warning',
  INACTIVE: 'error',
  PENDING: 'warning',
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onContact,
}) => {
  const { t } = useLanguageStore();
  const { addProperty, removeProperty, isInComparison, canAddMore } = useComparisonStore();
  const inComparison = isInComparison(property.id);

  const handleCardClick = () => {
    if (onClick) {
      onClick(property);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContact) {
      onContact(property);
    }
  };

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (inComparison) {
      removeProperty(property.id);
      toast.success('Removed from comparison');
    } else {
      if (!canAddMore()) {
        toast.error('Maximum 4 properties can be compared');
        return;
      }
      addProperty(property);
      toast.success('Added to comparison');
    }
  };

  return (
    <motion.div
      className="group cursor-pointer"
      onClick={handleCardClick}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-white border-2 border-neutral-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-2xl transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={property.images[0]?.url || '/placeholder-property.jpg'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={statusVariant[property.status]} size="sm">
              {property.status}
            </Badge>
            {property.owner?.verified && (
              <VerifiedBadge size="sm" />
            )}
          </div>

          {/* Comparison indicator */}
          {inComparison && (
            <div className="absolute top-3 right-3">
              <div className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Scale className="w-3 h-3" />
                In Comparison
              </div>
            </div>
          )}

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg">
              <span className="font-mono text-xl font-bold text-brand-primary">
                {formatCurrency(property.price)}
              </span>
              <span className="text-neutral-secondary text-sm ml-1">/month</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title & Location */}
          <h3 className="font-semibold text-lg text-neutral-primary mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-2 text-neutral-secondary text-sm mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.location.neighborhood}, {property.location.city}</span>
          </div>

          {/* Property Type */}
          <Badge variant="secondary" size="sm" className="mb-4">
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </Badge>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-neutral-tertiary">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{property.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{property.inquiries || 0}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {onContact && (
              <Button
                variant="primaryalt"
                size="sm"
                onClick={handleContactClick}
              >
                Contact
              </Button>
            )}
            <Button
              variant={inComparison ? 'primary' : 'outline'}
              size="sm"
              onClick={handleComparisonToggle}
            >
              <Scale className="w-4 h-4 mr-2" />
              {inComparison ? 'Added' : 'Compare'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};