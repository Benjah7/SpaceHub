'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      className,
      id,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const currentLength = value?.toString().length || 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-small font-medium text-neutral-text-primary mb-2"
          >
            {label}
            {props.required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'input min-h-[100px] resize-y',
            error && 'input-error',
            className
          )}
          maxLength={maxLength}
          value={value}
          {...props}
        />

        <div className="flex items-center justify-between mt-1">
          <div className="flex-1">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-tiny text-status-error"
              >
                {error}
              </motion.p>
            )}

            {helperText && !error && (
              <p className="text-tiny text-neutral-text-secondary">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-tiny ml-2',
                currentLength > maxLength * 0.9
                  ? 'text-status-warning'
                  : 'text-neutral-text-secondary'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
