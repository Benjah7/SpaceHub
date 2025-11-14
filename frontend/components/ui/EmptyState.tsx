// frontend/components/ui/EmptyState.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionHref?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-3xl px-lg text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-neutral-bg flex items-center justify-center mb-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Icon className="w-12 h-12 text-neutral-text-secondary" />
      </motion.div>

      <motion.h3
        className="text-h3 font-semibold mb-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-body text-neutral-text-secondary max-w-md mb-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {description}
      </motion.p>

      {(actionLabel && (onAction || actionHref)) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button variant="primary" onClick={onAction} href={actionHref}>
            {actionLabel}
          </Button>

          {(secondaryActionLabel && (onSecondaryAction || secondaryActionHref)) && (
            <Button
              variant="secondary"
              onClick={onSecondaryAction}
              href={secondaryActionHref}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

EmptyState.displayName = 'EmptyState';