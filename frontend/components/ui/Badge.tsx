'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'secondary' | 'primary';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default: 'bg-neutral-border text-neutral-text-primary',
  secondary: 'badge-secondary',
  primary: "bg-neutral-border text-neutral-text-primary"
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  animated = false,
  size,
  className,
  children,
  ...props
}) => {
  const BadgeComponent = (animated ? motion.span : 'span') as unknown as React.ElementType<any>;

  return (
    <BadgeComponent
      className={cn('badge', badgeVariants[variant], className, {
        'badge-sm': size === 'sm',
        'badge-md': size === 'md',
        'badge-lg': size === 'lg',
      })}
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
