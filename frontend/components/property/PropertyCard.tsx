'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Square, Eye, MessageSquare, Check, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Property, PropertyStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useLanguageStore } from '@/lib/store/language-store';

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
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Badge variant={statusVariant[property.status]} animated>
                {t(`property.${property.status.toLowerCase()}`)}
              </Badge>
            </motion.div>

            {property.verified && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <Badge variant="info" animated className="bg-white/90 text-brand-primary backdrop-blur-sm">
                  <Check className="w-3 h-3 inline mr-1" />
                  {t('property.verified')}
                </Badge>
              </motion.div>
            )}
          </div>

          {/* View count - bottom left */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 text-white">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
              <Eye className="w-4 h-4" />
              <span className="text-data font-mono font-medium">{property.views}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full">
              <MessageSquare className="w-4 h-4" />
              <span className="text-data font-mono font-medium">{property.inquiries}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title - Bricolage Grotesque */}
          <h3 className="text-h3 font-bold mb-3 group-hover:text-brand-primary transition-colors line-clamp-1">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-body-sm text-neutral-text-secondary mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{property.location.neighborhood}, Nairobi</span>
          </div>

          {/* Price and Size - JetBrains Mono for data */}
          <div className="flex items-end justify-between mb-6 pb-6 border-b-2 border-neutral-border">
            <div>
              <div className="text-tiny text-neutral-text-secondary mb-1 uppercase tracking-wide font-medium">
                Monthly Rent
              </div>
              <div className="text-price-lg font-mono font-bold text-brand-accent">
                {formatCurrency(property.price)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-tiny text-neutral-text-secondary mb-1 uppercase tracking-wide font-medium">
                Size
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-price font-mono font-bold text-neutral-text-primary">
                  {property.size}
                </span>
                <span className="text-body-sm text-neutral-text-secondary font-mono">m²</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-body-sm text-neutral-text-secondary line-clamp-2 mb-6 leading-relaxed">
            {property.description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleCardClick}
              className="font-medium group-hover:shadow-lg group-hover:shadow-brand-accent/30 transition-shadow"
            >
              View Details
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleContactClick}
              className="px-6 font-medium"
            >
              Contact
            </Button>
          </div>
        </div>

        {/* Hover effect line */}
        <motion.div
          className="h-1 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </motion.div>
  );
};

PropertyCard.displayName = 'PropertyCard';