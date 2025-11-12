'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantStyles = {
    danger: {
      icon: 'text-status-error',
      button: 'error' as const,
      border: 'border-status-error',
    },
    warning: {
      icon: 'text-status-warning',
      button: 'warning' as const,
      border: 'border-status-warning',
    },
    info: {
      icon: 'text-status-info',
      button: 'primary' as const,
      border: 'border-status-info',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              className={cn(
                'bg-white dark:bg-neutral-800 rounded-xl shadow-2xl',
                'w-full max-w-md p-lg border-2',
                styles.border
              )}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-neutral-text-secondary hover:text-neutral-text-primary rounded-lg hover:bg-neutral-surface transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-md">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center',
                    variant === 'danger' && 'bg-status-error/10',
                    variant === 'warning' && 'bg-status-warning/10',
                    variant === 'info' && 'bg-status-info/10'
                  )}
                >
                  <AlertTriangle className={cn('w-8 h-8', styles.icon)} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-h2 text-center mb-md">{title}</h3>

              {/* Description */}
              <p className="text-body text-neutral-text-secondary text-center mb-xl">
                {description}
              </p>

              {/* Actions */}
              <div className="flex gap-md">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  fullWidth
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={styles.button}
                  onClick={handleConfirm}
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
