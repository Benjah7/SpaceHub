'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.listings'), href: '/listings' },
    ...(isAuthenticated ? [{ name: t('nav.dashboard'), href: '/dashboard' }] : []),
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 bg-neutral-surface border-b border-neutral-border shadow-sm">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="text-h2 font-bold text-brand-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Space Hub
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-lg">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-body font-medium transition-colors hover:text-brand-primary',
                  pathname === item.href
                    ? 'text-brand-primary'
                    : 'text-neutral-text-secondary'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-md">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 text-small font-medium text-neutral-text-secondary hover:text-brand-primary transition-colors"
            >
              {language === 'en' ? 'EN' : 'SW'}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-md">
                <div className="text-small">
                  <p className="font-medium text-neutral-text-primary">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-tiny text-neutral-text-secondary">
                    {user.role}
                  </p>
                </div>
                <Button
                  variant="text"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <>
                <Button variant="text" size="sm" href="/login">
                  {t('nav.login')}
                </Button>
                <Button variant="primary" size="sm" href="/signup">
                  {t('nav.signup')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-text-primary"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-lg space-y-md">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'block px-md py-2 text-body font-medium rounded-sm transition-colors',
                      pathname === item.href
                        ? 'bg-brand-primary bg-opacity-10 text-brand-primary'
                        : 'text-neutral-text-secondary hover:bg-neutral-bg'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="pt-md border-t">
                  <button
                    onClick={toggleLanguage}
                    className="w-full px-md py-2 text-left text-body font-medium text-neutral-text-secondary hover:bg-neutral-bg rounded-sm"
                  >
                    Language: {language === 'en' ? 'English' : 'Kiswahili'}
                  </button>
                </div>

                {isAuthenticated && user ? (
                  <div className="space-y-md pt-md border-t">
                    <div className="px-md py-2">
                      <p className="font-medium text-neutral-text-primary">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-tiny text-neutral-text-secondary">
                        {user.email}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      leftIcon={<LogOut className="w-4 h-4" />}
                    >
                      {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-md pt-md border-t">
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                      href="/login"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => setMobileMenuOpen(false)}
                      href="/signup"
                    >
                      {t('nav.signup')}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

Header.displayName = 'Header';
