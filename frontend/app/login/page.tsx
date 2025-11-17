'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useLanguageStore } from '@/lib/store/language-store';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const { t } = useLanguageStore();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Get return URL from query params
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // ✅ Redirect if already authenticated
  React.useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success(t('auth.loginSuccess'));
      router.push(returnUrl);
    } catch (error) {
      ErrorHandler.handle(error, 'Login failed');
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-3">
            {t('auth.login')}
          </h1>
          <p className="text-lg text-neutral-600">
            Welcome back! Please login to your account.
          </p>
        </div>

        <Card>
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label={t('auth.email')}
                type="email"
                placeholder="your@email.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-5 h-5" />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-600">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-brand-primary hover:text-brand-secondary"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : t('auth.login')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-600">
                  {t('auth.dontHaveAccount')}
                </span>
              </div>
            </div>

            <Link href="/signup">
              <Button variant="primary" fullWidth>
                {t('auth.createAccount')}
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}