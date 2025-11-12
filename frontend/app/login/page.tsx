'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth-schema';
import { ErrorHandler } from '@/lib/utils/error-handler';
import toast from 'react-hot-toast';
import type { ApiError } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error) {
      const apiError = error as ApiError;
      
      // Handle field-level errors from backend
      if (apiError.errors) {
        const fieldErrors = ErrorHandler.parseValidationErrors(apiError.errors);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof LoginFormData, { message });
        });
      }
      
      // Show general error
      ErrorHandler.handle(error, 'Failed to log in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-status-info flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-xl">
          {/* Header */}
          <div className="text-center mb-xl">
            <h1 className="text-h1 text-brand-primary mb-2">Space Hub</h1>
            <h2 className="text-h2 mb-md">Welcome Back</h2>
            <p className="text-body text-neutral-text-secondary">
              Log in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
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

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
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

            <div className="flex items-center justify-between text-small">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-brand-primary hover:text-brand-secondary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-lg">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-border" />
            </div>
            <div className="relative flex justify-center text-small">
              <span className="px-2 bg-white text-neutral-text-secondary">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link href="/signup">
            <Button variant="secondary" fullWidth>
              Create Account
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}
