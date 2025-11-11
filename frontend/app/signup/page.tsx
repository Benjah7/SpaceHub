'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, Building2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type UserRole = 'TENANT' | 'OWNER';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT' as UserRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+254|0)?[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Kenyan phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        role: formData.role,
      });
      toast.success('Account created successfully!');
      router.push(formData.role === 'OWNER' ? '/dashboard' : '/listings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
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
            <label className="block text-small font-medium mb-md">
              I want to: <span className="text-status-error">*</span>
            </label>
            <div className="grid grid-cols-2 gap-md">
              <motion.button
                type="button"
                onClick={() => handleRoleSelect('TENANT')}
                className={cn(
                  'p-lg rounded-lg border-2 transition-all',
                  formData.role === 'TENANT'
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
                  formData.role === 'OWNER'
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
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                leftIcon={<User className="w-5 h-5" />}
                required
              />

              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                leftIcon={<User className="w-5 h-5" />}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+254 712 345 678"
              leftIcon={<Phone className="w-5 h-5" />}
              helperText="Enter Kenyan phone number"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                helperText="Min. 8 characters with uppercase, lowercase & number"
                required
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
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                required
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

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-brand-primary rounded focus:ring-brand-primary"
              />
              <label className="text-small text-neutral-text-secondary">
                I agree to the{' '}
                <Link href="/terms" className="text-brand-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-brand-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-small text-neutral-text-secondary mt-xl">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
