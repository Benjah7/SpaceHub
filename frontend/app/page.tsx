'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, CreditCard, ArrowRight, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useLanguageStore } from '@/lib/store/language-store';
import { useRouter } from 'next/navigation';
import { PropertyStatus, PropertyType, type Property } from '@/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Mock featured properties
const mockFeaturedProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Retail Space - Westlands',
    description: 'Prime commercial space in the heart of Westlands with high foot traffic',
    propertyType: PropertyType.RETAIL,
    status: PropertyStatus.AVAILABLE,
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
      title: 'Precision Search',
      description: 'Map-based filtering with exact measurements',
      stat: '2,400+',
      label: 'Properties',
    },
    {
      icon: Building2,
      title: 'Direct Connect',
      description: 'Verified owners, instant messaging',
      stat: '95%',
      label: 'Response Rate',
    },
    {
      icon: CreditCard,
      title: 'M-Pesa Secure',
      description: 'Safe deposits, transparent pricing',
      stat: 'KES 50M+',
      label: 'Processed',
    },
  ];

  const stats = [
    { value: '2.4K+', label: 'Active Listings' },
    { value: '8.5K+', label: 'Happy Tenants' },
    { value: '500+', label: 'Property Owners' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Dramatic typography */}
      <section className="relative bg-gradient-to-br from-brand-primary via-status-info to-brand-primary text-white overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative py-24 lg:py-32">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Super badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-body-sm font-medium"
              variants={itemVariants}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Nairobi's #1 Commercial Property Platform</span>
            </motion.div>

            {/* Hero heading - Extreme typography */}
            <motion.h1
              className="heading-display mb-6 text-white"
              variants={heroVariants}
              style={{
                fontSize: 'clamp(48px, 8vw, 72px)',
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Find Your Perfect
              <br />
              <span className="text-brand-secondary">Commercial Space</span>
            </motion.h1>

            <motion.p
              className="text-body-lg lg:text-[22px] mb-12 opacity-95 max-w-3xl mx-auto font-light"
              variants={itemVariants}
            >
              Connect with verified property owners across Nairobi.
              <br className="hidden md:block" />
              Secure locations. Fast deposits. Real results.
            </motion.p>

            {/* Search Bar - Enhanced */}
            <motion.form
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto mb-8"
              variants={itemVariants}
            >
              <div className="bg-white rounded-xl shadow-2xl p-3 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by location, type, or neighborhood..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-body text-neutral-text-primary focus:outline-none rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/listings')}
                    className="px-6 py-4 bg-neutral-bg text-neutral-text-primary font-medium rounded-lg hover:bg-neutral-border transition-all flex items-center gap-2"
                  >
                    <Filter className="w-5 h-5" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-brand-accent text-white font-medium rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/30"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Quick Stats - Monospace numbers */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              variants={itemVariants}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-price-lg font-bold mb-1 font-mono">{stat.value}</div>
                  <div className="text-body-sm opacity-90 font-light">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-bg to-transparent"></div>
      </section>

      {/* How It Works Section - Technical precision */}
      <section className="py-24 bg-neutral-surface relative">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="section-heading">How Space Hub Works</h2>
              <p className="text-body-lg text-neutral-text-secondary max-w-2xl mx-auto">
                Three simple steps to your ideal commercial location
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className="relative group"
                    variants={itemVariants}
                  >
                    {/* Step number - Extreme contrast */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center">
                      <span className="text-h1 font-black text-brand-primary/20 font-mono">
                        {index + 1}
                      </span>
                    </div>

                    <div className="p-8 bg-white border-2 border-neutral-border rounded-xl hover:border-brand-primary hover:shadow-card-hover transition-all duration-300">
                      {/* Icon */}
                      <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-brand-primary/10 mb-6 group-hover:bg-brand-primary group-hover:scale-110 transition-all duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-8 h-8 text-brand-primary group-hover:text-white transition-colors" />
                      </motion.div>

                      <h3 className="text-h3 mb-3">{feature.title}</h3>
                      <p className="text-body text-neutral-text-secondary mb-6">
                        {feature.description}
                      </p>

                      {/* Stat with monospace */}
                      <div className="pt-6 border-t border-neutral-border">
                        <div className="text-price font-mono text-brand-primary">
                          {feature.stat}
                        </div>
                        <div className="text-body-sm text-neutral-text-secondary mt-1">
                          {feature.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-24 bg-neutral-bg">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <div className="flex items-end justify-between mb-12">
              <motion.div variants={itemVariants}>
                <h2 className="section-heading mb-2">Featured Properties</h2>
                <p className="text-body-lg text-neutral-text-secondary">
                  Handpicked premium locations across Nairobi
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button
                  variant="text"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={() => router.push('/listings')}
                  className="font-medium"
                >
                  View All Properties
                </Button>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockFeaturedProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  variants={itemVariants}
                  custom={index}
                >
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-primary to-status-info text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-h1 lg:text-display font-black mb-6">
              Ready to Find
              <br />
              Your Space?
            </h2>
            <p className="text-body-lg lg:text-[22px] mb-12 opacity-95 font-light">
              Join thousands of entrepreneurs finding their perfect business location
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/listings')}
                className="bg-white text-brand-primary hover:bg-white hover:scale-105 border-0 shadow-xl font-medium text-lg px-10"
              >
                Browse Properties
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard/properties/new')}
                className="bg-brand-accent hover:scale-105 shadow-xl font-medium text-lg px-10"
              >
                List Your Property
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}