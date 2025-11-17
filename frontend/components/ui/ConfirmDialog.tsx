'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const variantStyles = {
    danger: {
      icon: 'text-status-error',
      iconBg: 'bg-status-error/10',
      button: 'danger' as const,
    },
    warning: {
      icon: 'text-status-warning',
      iconBg: 'bg-status-warning/10',
      button: 'primary' as const,
    },
    info: {
      icon: 'text-status-info',
      iconBg: 'bg-status-info/10',
      button: 'primary' as const,
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-neutral-text-primary/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-md pointer-events-none">
            <motion.div
              className="bg-neutral-surface rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-lg border-b border-neutral-border">
                <div className="flex items-start gap-md">
                  <div className={cn('p-3 rounded-lg flex-shrink-0', styles.iconBg)}>
                    <AlertTriangle className={cn('w-6 h-6', styles.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-h3 mb-2">{title}</h3>
                    <p className="text-body text-neutral-text-secondary">{description}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-neutral-text-tertiary hover:text-neutral-text-primary transition-colors flex-shrink-0"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-lg flex items-center gap-md">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={styles.button}
                  fullWidth
                  onClick={handleConfirm}
                  isLoading={loading}
                  disabled={loading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};