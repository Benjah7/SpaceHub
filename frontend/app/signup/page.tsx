'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Building2, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import { signupSchema, type SignupFormData } from '@/lib/schemas/auth-schema';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { ApiError } from '@/types';

type UserRole = 'TENANT' | 'OWNER';

export default function SignupPage() {
  const router = useRouter();
  const { signup: registerUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Transform data for API: combine firstName and lastName into name, remove confirmPassword
      const { firstName, lastName, confirmPassword, ...rest } = data;
      const registerData = {
        ...rest,
        name: `${firstName} ${lastName}`.trim(),
      };
      
      await registerUser(registerData);
      toast.success('Account created successfully!');
      router.push(data.role === 'OWNER' ? '/dashboard' : '/listings');
    } catch (error) {
      const apiError = error as ApiError;
      
      // Handle field-level errors from backend
      if (apiError.errors) {
        const fieldErrors = ErrorHandler.parseValidationErrors(apiError.errors);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof SignupFormData, { message });
        });
      }
      
      // Show general error
      ErrorHandler.handle(error, 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-status-info flex items-center justify-center p-4 py-xl">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-xl">
          {/* Header */}
          <div className="text-center mb-xl">
            <h1 className="text-h1 text-brand-primary mb-2">Space Hub</h1>
            <h2 className="text-h2 mb-md">Create Your Account</h2>
            <p className="text-body text-neutral-text-secondary">
              Join Space Hub to find or list properties
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-xl">
            <label className="block text-small font-medium mb-md text-neutral-text-primary">
              I want to: <span className="text-status-error">*</span>
            </label>
            <div className="grid grid-cols-2 gap-md">
              <motion.button
                type="button"
                onClick={() => handleRoleSelect('TENANT')}
                className={cn(
                  'p-lg rounded-lg border-2 transition-all',
                  selectedRole === 'TENANT'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-neutral-border hover:border-brand-primary/50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <UserCircle className="w-12 h-12 mx-auto mb-md text-brand-primary" />
                <p className="text-h3 font-semibold mb-1">Find a Property</p>
                <p className="text-small text-neutral-text-secondary">
                  Search and rent retail spaces
                </p>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleRoleSelect('OWNER')}
                className={cn(
                  'p-lg rounded-lg border-2 transition-all',
                  selectedRole === 'OWNER'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-neutral-border hover:border-brand-primary/50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Building2 className="w-12 h-12 mx-auto mb-md text-brand-primary" />
                <p className="text-h3 font-semibold mb-1">List a Property</p>
                <p className="text-small text-neutral-text-secondary">
                  Rent out your retail space
                </p>
              </motion.button>
            </div>
            {errors.role && (
              <p className="text-tiny text-status-error mt-2">{errors.role.message}</p>
            )}
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <Input
                label="First Name"
                type="text"
                {...register('firstName')}
                error={errors.firstName?.message}
                placeholder="John"
                leftIcon={<User className="w-5 h-5" />}
                disabled={isSubmitting}
              />

              <Input
                label="Last Name"
                type="text"
                {...register('lastName')}
                error={errors.lastName?.message}
                placeholder="Doe"
                leftIcon={<User className="w-5 h-5" />}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              autoComplete="email"
              disabled={isSubmitting}
            />

            <Input
              label="Phone Number"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+254 712 345 678"
              leftIcon={<Phone className="w-5 h-5" />}
              helperText="Enter Kenyan phone number in format +254XXXXXXXXX"
              disabled={isSubmitting}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                helperText="Min. 8 characters with uppercase, lowercase, and number"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-brand-primary rounded focus:ring-brand-primary"
                disabled={isSubmitting}
              />
              <label className="text-small text-neutral-text-secondary">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-brand-primary hover:text-brand-secondary"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-lg">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-border" />
            </div>
            <div className="relative flex justify-center text-small">
              <span className="px-2 bg-white text-neutral-text-secondary">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              Log In
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}