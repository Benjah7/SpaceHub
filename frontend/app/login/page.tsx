'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const { login } = useAuthStore();
  const { t } = useLanguageStore();
  const [showPassword, setShowPassword] = useState(false);

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
      router.push('/dashboard');
    } catch (error) {
      ErrorHandler.handle(error, 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center py-xl px-md">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-xl">
          <h1 className="text-h1 mb-md">{t('auth.login')}</h1>
          <p className="text-body text-neutral-text-secondary">
            Welcome back! Please login to your account.
          </p>
        </div>

        <Card>
          <div className="p-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
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
                  className="absolute right-3 top-[42px] text-neutral-text-secondary hover:text-neutral-text-primary"
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
                  <span>{t('auth.rememberMe')}</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-brand-primary hover:text-brand-secondary transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : t('auth.login')}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-border" />
              </div>
              <div className="relative flex justify-center text-small">
                <span className="px-2 bg-white text-neutral-text-secondary">
                  {t('auth.dontHaveAccount')}
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link href="/signup">
              <Button variant="secondary" fullWidth>
                {t('auth.createAccount')}
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}