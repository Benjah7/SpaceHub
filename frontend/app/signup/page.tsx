'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Building2, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { useLanguageStore } from '@/lib/store/language-store';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().regex(/^\+254[17]\d{8}$/, 'Invalid Kenyan phone number (e.g., +254712345678)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['OWNER', 'TENANT'], { required_error: 'Please select a role' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

type UserRole = 'TENANT' | 'OWNER';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const { t } = useLanguageStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = data;
      await signup(signupData);
      
      toast.success(t('auth.signupSuccess'));
      router.push(data.role === 'OWNER' ? '/dashboard' : '/listings');
    } catch (error) {
      ErrorHandler.handle(error, 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex items-center justify-center py-xl px-md">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-xl">
          <h1 className="text-h1 mb-md">{t('auth.signup')}</h1>
          <p className="text-body text-neutral-text-secondary">
            Create your account to get started
          </p>
        </div>

        <Card>
          <div className="p-xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
              {/* Role Selection */}
              <div>
                <label className="block text-small font-medium text-neutral-text-primary mb-md">
                  {t('auth.selectRole')} <span className="text-status-error">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <motion.button
                    type="button"
                    onClick={() => handleRoleSelect('OWNER')}
                    className={cn(
                      'p-lg border-2 rounded-lg transition-all text-left',
                      selectedRole === 'OWNER'
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-neutral-border hover:border-brand-primary/50'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Building2 className={cn(
                      'w-8 h-8 mb-md',
                      selectedRole === 'OWNER' ? 'text-brand-primary' : 'text-neutral-text-secondary'
                    )} />
                    <h3 className="text-body font-semibold mb-1">
                      {t('auth.iAmOwner')}
                    </h3>
                    <p className="text-small text-neutral-text-secondary">
                      List and manage properties
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => handleRoleSelect('TENANT')}
                    className={cn(
                      'p-lg border-2 rounded-lg transition-all text-left',
                      selectedRole === 'TENANT'
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-neutral-border hover:border-brand-primary/50'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <UserCircle className={cn(
                      'w-8 h-8 mb-md',
                      selectedRole === 'TENANT' ? 'text-brand-primary' : 'text-neutral-text-secondary'
                    )} />
                    <h3 className="text-body font-semibold mb-1">
                      {t('auth.iAmTenant')}
                    </h3>
                    <p className="text-small text-neutral-text-secondary">
                      Search and rent properties
                    </p>
                  </motion.button>
                </div>
                {errors.role && (
                  <p className="text-tiny text-status-error mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  leftIcon={<User className="w-5 h-5" />}
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label={t('auth.phone')}
                  type="tel"
                  placeholder="+254712345678"
                  leftIcon={<Phone className="w-5 h-5" />}
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <Input
                label={t('auth.email')}
                type="email"
                placeholder="your@email.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
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

                <div className="relative">
                  <Input
                    label={t('auth.confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[42px] text-neutral-text-secondary hover:text-neutral-text-primary"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-brand-primary rounded focus:ring-brand-primary"
                />
                <p className="text-small text-neutral-text-secondary">
                  I agree to the{' '}
                  <Link href="/terms" className="text-brand-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-brand-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : t('auth.createAccount')}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-border" />
              </div>
              <div className="relative flex justify-center text-small">
                <span className="px-2 bg-white text-neutral-text-secondary">
                  {t('auth.alreadyHaveAccount')}
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link href="/login">
              <Button variant="secondary" fullWidth>
                {t('auth.login')}
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}