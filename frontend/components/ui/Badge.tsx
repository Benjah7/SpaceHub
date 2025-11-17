'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'secondary';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  animated?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default: 'bg-neutral-border text-neutral-text-primary',
  secondary: 'badge-secondary',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  animated = false,
  className,
  children,
  ...props
}) => {
  const BadgeComponent = (animated ? motion.span : 'span') as unknown as React.ElementType<any>;

  return (
    <BadgeComponent
      className={cn('badge', badgeVariants[variant], className)}
      {...(animated && {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      })}
      {...props}
    >
      {children}
    </BadgeComponent>
  );
};

Badge.displayName = 'Badge';
