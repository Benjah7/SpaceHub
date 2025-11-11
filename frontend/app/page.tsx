'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Building2, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useLanguageStore } from '@/lib/store/language-store';
import { useRouter } from 'next/navigation';
import type { Property } from '@/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// Mock featured properties (replace with actual API call)
const mockFeaturedProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Retail Space - Westlands',
    description: 'Prime commercial space in the heart of Westlands with high foot traffic',
    propertyType: 'SHOP',
    status: 'AVAILABLE',
    price: 80000,
    size: 45,
    location: {
      lat: -1.2667,
      lng: 36.8097,
      address: 'Westlands Road',
      neighborhood: 'Westlands',
      city: 'Nairobi',
      county: 'Nairobi',
    },
    images: [
      {
        id: '1',
        url: '/placeholder-property.jpg',
        alt: 'Property image',
        isPrimary: true,
      },
    ],
    amenities: [],
    verified: true,
    ownerId: '1',
    owner: {} as any,
    availableFrom: '2024-01-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 156,
    inquiries: 8,
  },
  // Add more mock properties...
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Search & Filter',
      description: 'Find properties using map & filters',
    },
    {
      icon: Building2,
      title: 'Connect Directly',
      description: 'Message verified property owners',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Pay deposits via M-Pesa safely',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-primary to-status-info text-white py-3xl">
        <div className="container-custom">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-lg"
              variants={itemVariants}
            >
              {t('home.hero_title')}
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-2xl opacity-90"
              variants={itemVariants}
            >
              {t('home.hero_subtitle')}
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto"
              variants={itemVariants}
            >
              <div className="bg-white rounded-lg shadow-card-hover p-2 flex flex-col md:flex-row gap-2">
                <Input
                  type="text"
                  placeholder={t('home.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus:ring-0"
                  leftIcon={<Search className="w-5 h-5" />}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    leftIcon={<Filter className="w-5 h-5" />}
                    onClick={() => router.push('/listings')}
                  >
                    Filters
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    {t('common.search')}
                  </Button>
                </div>
              </div>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-lg justify-center mt-2xl"
              variants={itemVariants}
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/listings')}
                className="bg-white text-brand-primary hover:bg-opacity-90"
              >
                {t('home.browse_properties')}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard/properties/new')}
                className="bg-brand-accent"
              >
                {t('home.list_property')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-bg to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-3xl bg-neutral-surface">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-h1 text-center mb-2xl"
              variants={itemVariants}
            >
              {t('home.how_it_works')}
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className="text-center"
                    variants={itemVariants}
                  >
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary bg-opacity-10 mb-lg"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-10 h-10 text-brand-primary" />
                    </motion.div>
                    <h3 className="text-h3 font-semibold mb-md">
                      {feature.title}
                    </h3>
                    <p className="text-body text-neutral-text-secondary">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-3xl bg-neutral-bg">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <div className="flex items-center justify-between mb-2xl">
              <motion.h2 className="text-h1" variants={itemVariants}>
                {t('home.featured_properties')}
              </motion.h2>
              <motion.div variants={itemVariants}>
                <Button
                  variant="text"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => router.push('/listings')}
                >
                  {t('home.view_all')}
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
              {mockFeaturedProperties.map((property) => (
                <motion.div key={property.id} variants={itemVariants}>
                  <PropertyCard
                    property={property}
                    onClick={(p) => router.push(`/properties/${p.id}`)}
                    onContact={(p) =>
                      console.log('Contact owner for property:', p.id)
                    }
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
