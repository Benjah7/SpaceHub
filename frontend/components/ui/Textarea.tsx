'use client';

import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      className,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="text-small font-medium text-neutral-text-primary">
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <motion.div
          className="relative"
          initial={false}
          animate={{ scale: error ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            ref={ref}
            rows={rows}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full px-4 py-3 text-body',
              'bg-neutral-surface border-2 rounded-lg',
              'transition-all duration-200',
              'placeholder:text-neutral-text-tertiary',
              resizeClasses[resize],

              // Focus states
              'focus:outline-none focus:ring-4',

              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed bg-neutral-bg',

              // Error state
              error
                ? 'border-status-error focus:border-status-error focus:ring-status-error/20'
                : 'border-neutral-border focus:border-brand-primary focus:ring-brand-primary/20',

              className
            )}
            {...props}
          />

          {/* Character count (if maxLength is provided) */}
          {props.maxLength && props.value !== undefined && (
            <div className="absolute bottom-2 right-2 text-tiny text-neutral-text-tertiary">
              {String(props.value).length}/{props.maxLength}
            </div>
          )}
        </motion.div>

        {/* Helper text or error */}
        {(error || helperText) && (
          <motion.p
            className={cn(
              'text-small',
              error ? 'text-status-error' : 'text-neutral-text-secondary'
            )}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';