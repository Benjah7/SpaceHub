'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Square, Eye, MessageSquare, Check } from 'lucide-react';
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
  BOOKED: 'warning',
  UNAVAILABLE: 'error',
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
    <Card
      hoverable
      clickable
      onClick={handleCardClick}
      className="overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-md">
        <Image
          src={property.images[0]?.url || '/placeholder-property.jpg'}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status Badge */}
        <motion.div
          className="absolute top-md left-md"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge variant={statusVariant[property.status]} animated>
            {t(`property.${property.status.toLowerCase()}`)}
          </Badge>
        </motion.div>

        {/* Verified Badge */}
        {property.verified && (
          <motion.div
            className="absolute top-md right-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Badge variant="info" animated>
              <Check className="w-3 h-3 inline mr-1" />
              {t('property.verified')}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-md">
        {/* Title */}
        <motion.h3
          className="text-h3 font-semibold mb-2 truncate"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {property.title}
        </motion.h3>

        {/* Location */}
        <motion.div
          className="flex items-center gap-2 text-small text-neutral-text-secondary mb-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MapPin className="w-4 h-4" />
          <span className="truncate">{property.location.neighborhood}</span>
        </motion.div>

        {/* Price and Size */}
        <motion.div
          className="flex items-center justify-between mb-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <p className="text-h3 font-bold text-brand-accent">
              {formatCurrency(property.price)}
            </p>
            <p className="text-tiny text-neutral-text-secondary">
              {t('property.per_month')}
            </p>
          </div>
          <div className="flex items-center gap-1 text-neutral-text-secondary">
            <Square className="w-4 h-4" />
            <span className="text-small font-medium">
              {property.size} {t('property.sqm')}
            </span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-small text-neutral-text-secondary truncate-2 mb-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {property.description}
        </motion.p>

        {/* Stats */}
        <motion.div
          className="flex items-center gap-lg mb-md text-tiny text-neutral-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{property.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{property.inquiries}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleCardClick}
          >
            {t('property.view_details')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleContactClick}
          >
            {t('property.contact_owner')}
          </Button>
        </motion.div>
      </div>
    </Card>
  );
};

PropertyCard.displayName = 'PropertyCard';
