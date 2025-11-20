'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger' | 'ghost'| 'outline'| 'success' ;
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  text: 'btn-text',
  danger: 'bg-status-error text-white hover:bg-opacity-90',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  success: 'bg-status-success text-white hover:bg-opacity-90',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-small',
  md: 'px-lg py-3 text-body',
  lg: 'px-xl py-4 text-body',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      href,
      ...props
    },
    ref
  ) => {
    const baseClassName = cn(
      'btn inline-flex items-center justify-center gap-2',
      buttonVariants[variant],
      buttonSizes[size],
      fullWidth && 'w-full',
      (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
      className
    );

    const content = (
      <>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </>
    );

    // If href is provided, render as a link-styled button
    if (href) {
      return (
        <motion.a
          href={href}
          className={baseClassName}
          whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
          whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={baseClassName}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
