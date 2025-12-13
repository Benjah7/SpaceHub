'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  Building2,
  CreditCard,
  MapPin,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Users,
  Target,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Input } from '@/components/ui/Input';
import { useProperties } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import toast from 'react-hot-toast';
import type { Property } from '@/types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function HomePage(): JSX.Element {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { t, language } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Fetch recent properties (most recent 6)
  const { data: recentPropertiesData, loading: loadingProperties } = useProperties({
    page: 1,
    limit: 6,
    status: 'AVAILABLE',
  });

  const recentProperties = recentPropertiesData || [];

  // Platform statistics
  const [stats, setStats] = useState({
    activeListings: 2400,
    happyTenants: 8500,
    propertyOwners: 500,
    satisfaction: 98,
  });

  // Features for "Why Choose Us" section
  const features = [
    {
      icon: Search,
      title: language === 'en' ? 'Precision Search' : 'Utafutaji wa Usahihi',
      description:
        language === 'en'
          ? 'Map-based filtering with exact measurements and neighborhood insights'
          : 'Kuchuja kulingana na ramani na vipimo sahihi',
      stat: '2,400+',
      label: language === 'en' ? 'Properties' : 'Mali',
    },
    {
      icon: Building2,
      title: language === 'en' ? 'Direct Connect' : 'Unganisha Moja kwa Moja',
      description:
        language === 'en'
          ? 'Verified owners, instant messaging, transparent communication'
          : 'Wamiliki walioidhinishwa, ujumbe wa papo hapo',
      stat: '95%',
      label: language === 'en' ? 'Response Rate' : 'Kiwango cha Majibu',
    },
    {
      icon: CreditCard,
      title: language === 'en' ? 'M-Pesa Secure' : 'M-Pesa Salama',
      description:
        language === 'en'
          ? 'Safe deposits, transparent pricing, instant confirmations'
          : 'Amana salama, bei wazi, uthibitisho wa papo hapo',
      stat: 'KES 50M+',
      label: language === 'en' ? 'Processed' : 'Imechakatwa',
    },
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      icon: Search,
      title: language === 'en' ? 'Search & Discover' : 'Tafuta & Gundua',
      description:
        language === 'en'
          ? 'Use our advanced filters to find properties that match your business needs perfectly'
          : 'Tumia vichujio vyetu vya juu kupata mali zinazolingana na mahitaji yako',
    },
    {
      icon: MessageSquare,
      title: language === 'en' ? 'Connect Instantly' : 'Unganisha Papo Hapo',
      description:
        language === 'en'
          ? 'Message verified property owners directly and schedule viewings at your convenience'
          : 'Tuma ujumbe kwa wamiliki walioidhinishwa moja kwa moja',
    },
    {
      icon: CheckCircle,
      title: language === 'en' ? 'Secure & Move In' : 'Hamia Salama',
      description:
        language === 'en'
          ? 'Pay deposits via M-Pesa, sign agreements digitally, and start your business journey'
          : 'Lipa amana kupitia M-Pesa na anza safari yako ya biashara',
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Jane Wanjiku',
      role: language === 'en' ? 'Fashion Boutique Owner' : 'Mmiliki wa Boutique',
      location: 'Westlands',
      image: '/placeholder-avatar.jpg',
      content:
        language === 'en'
          ? 'Found my perfect shop location in just 3 days! The M-Pesa integration made the deposit payment so easy.'
          : 'Nilipata eneo langu bora la duka katika siku 3 tu! Malipo kupitia M-Pesa yalikuwa rahisi sana.',
      rating: 5,
    },
    {
      name: 'David Omondi',
      role: language === 'en' ? 'Tech Startup Founder' : 'Mwanzilishi wa Kampuni',
      location: 'Kilimani',
      image: '/placeholder-avatar.jpg',
      content:
        language === 'en'
          ? 'Space Hub saved me weeks of searching. The verified listings and direct messaging were game-changers.'
          : 'Space Hub iliniokoa wiki nyingi za kutafuta. Orodha zilizoidhinishwa zilikuwa muhimu sana.',
      rating: 5,
    },
    {
      name: 'Sarah Muthoni',
      role: language === 'en' ? 'Coffee Shop Owner' : 'Mmiliki wa Duka la Kahawa',
      location: 'Karen',
      image: '/placeholder-avatar.jpg',
      content:
        language === 'en'
          ? 'The neighborhood insights helped me choose the perfect location with high foot traffic. Business is booming!'
          : 'Maarifa ya mtaa yalinisaidia kuchagua eneo bora. Biashara inaendelea vizuri!',
      rating: 5,
    },
  ];

  // Benefits section
  const benefits = [
    {
      icon: Shield,
      title: language === 'en' ? 'Verified Listings' : 'Orodha Zilizoidhinishwa',
      description:
        language === 'en'
          ? 'Every property is verified for authenticity and legal compliance'
          : 'Kila mali imethibitishwa kwa uhalali na kufuata sheria',
    },
    {
      icon: Clock,
      title: language === 'en' ? 'Save Time' : 'Okoa Muda',
      description:
        language === 'en'
          ? 'Find your ideal location 10x faster than traditional methods'
          : 'Pata eneo lako bora haraka mara 10 kuliko njia za kawaida',
    },
    {
      icon: Target,
      title: language === 'en' ? 'Perfect Match' : 'Mechi Bora',
      description:
        language === 'en'
          ? 'Advanced AI-powered search finds properties that fit your exact needs'
          : 'Utafutaji unaotumia AI kupata mali zinazolingana na mahitaji yako',
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Market Insights' : 'Maarifa ya Soko',
      description:
        language === 'en'
          ? 'Access real-time data on pricing trends and neighborhood analytics'
          : 'Pata data ya wakati halisi kuhusu mwenendo wa bei',
    },
  ];

  const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/listings');
    }
  };

  const handleContactOwner = async (property: Property): Promise<void> => {
    if (!isAuthenticated) {
      toast.error(
        language === 'en'
          ? 'Please login to contact property owners'
          : 'Tafadhali ingia ili kuwasiliana na wamiliki'
      );
      router.push(`/login?redirect=/properties/${property.id}`);
      return;
    }

    if (user?.id === property.ownerId) {
      toast.error(
        language === 'en' ? 'You cannot message yourself' : 'Huwezi kutuma ujumbe kwako mwenyewe'
      );
      return;
    }

    try {
      const conversation = await apiClient.createConversation({
        participantId: property.ownerId,
        propertyId: property.id,
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to start conversation');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Hero Section - Bold & Dramatic */}
      <section className="relative min-h-[85vh] bg-gradient-to-br from-brand-primary via-status-info to-brand-primary text-white overflow-hidden">
        {/* Animated geometric background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-accent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-4 border-white/20 rounded-full" />
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-16 h-16 border-2 border-white/30 rounded-lg"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          style={{ rotate: 45 }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-20 h-20 border-2 border-white/30 rounded-full"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        />

        <div className="container-custom relative z-10 pt-32 pb-24">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4 text-brand-accent" />
                {language === 'en'
                  ? 'Nairobi\'s #1 Commercial Property Platform'
                  : 'Jukwaa la Kwanza la Mali za Biashara Nairobi'}
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-display font-black tracking-tight mb-6 leading-[1.1]"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {language === 'en' ? (
                <>
                  Find Your Perfect
                  <br />
                  <span className="text-brand-accent">Commercial Space</span>
                </>
              ) : (
                <>
                  Pata Nafasi Yako
                  <br />
                  <span className="text-brand-accent">Bora ya Biashara</span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-[22px] leading-relaxed mb-12 opacity-95 font-light max-w-2xl mx-auto"
            >
              {language === 'en'
                ? 'Connect with verified property owners and secure your business location in Nairobi with ease, speed, and confidence.'
                : 'Unganisha na wamiliki walioidhinishwa na uhakikishe eneo lako la biashara Nairobi kwa urahisi na haraka.'}
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto mb-12"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-text-secondary" />
                  <input
                    type="text"
                    placeholder={
                      language === 'en'
                        ? 'Search by location, neighborhood, or property type...'
                        : 'Tafuta kwa eneo, mtaa, au aina ya mali...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 text-lg text-neutral-text-primary placeholder-neutral-text-secondary bg-transparent focus:outline-none rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSearching}
                  className="bg-brand-accent hover:bg-brand-accent/90 shadow-xl px-12 py-5 text-lg font-semibold whitespace-nowrap"
                >
                  {language === 'en' ? 'Search Properties' : 'Tafuta Mali'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.form>

            {/* Quick Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/listings')}
                className="bg-white text-brand-primary hover:bg-white/90 border-0 shadow-xl font-medium px-10 min-w-[200px]"
              >
                {language === 'en' ? 'Browse All Listings' : 'Angalia Mali Zote'}
              </Button>
              {user?.role === 'OWNER' ? (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push('/dashboard/properties/new')}
                  className="text-white border-2 border-white/30 hover:bg-white/10 font-medium px-10 min-w-[200px]"
                >
                  {language === 'en' ? 'List Your Property' : 'Orodhesha Mali Yako'}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="text-white border-2 border-white/30 hover:bg-white/10 font-medium px-10 min-w-[200px]"
                >
                  {language === 'en' ? 'Join as Owner' : 'Jiunge kama Mmiliki'}
                </Button>
              )}
            </motion.div>

            {/* Statistics */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {[
                { value: `${stats.activeListings.toLocaleString()}+`, label: language === 'en' ? 'Active Listings' : 'Mali Zinapatikana' },
                { value: `${stats.happyTenants.toLocaleString()}+`, label: language === 'en' ? 'Happy Tenants' : 'Wapangaji Furaha' },
                { value: `${stats.propertyOwners}+`, label: language === 'en' ? 'Property Owners' : 'Wamiliki wa Mali' },
                { value: `${stats.satisfaction}%`, label: language === 'en' ? 'Satisfaction' : 'Kuridhika' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/15 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div
                    className="text-[42px] font-bold mb-2 leading-none font-mono"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm opacity-90 font-light">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="#FAFAFA"
            />
          </svg>
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
            {/* Section Header */}
            <div className="flex items-end justify-between mb-16">
              <motion.div variants={itemVariants}>
                <h2 className="text-h1 font-black mb-3" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {language === 'en' ? 'Recent Properties' : 'Mali za Hivi Karibuni'}
                </h2>
                <p className="text-body-lg text-neutral-text-secondary max-w-xl">
                  {language === 'en'
                    ? 'Latest commercial spaces available for immediate occupancy'
                    : 'Nafasi za biashara za hivi karibuni zinazopatikana sasa'}
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/listings')}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="hidden md:flex"
                >
                  {language === 'en' ? 'View All Properties' : 'Angalia Mali Zote'}
                </Button>
              </motion.div>
            </div>

            {/* Property Grid */}
            {loadingProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-[420px] bg-neutral-surface rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentProperties && recentProperties.length > 0 ? (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                >
                  {recentProperties.map((property) => (
                    <motion.div key={property.id} variants={itemVariants}>
                      <PropertyCard
                        property={property}
                        onClick={(p) => router.push(`/properties/${p.id}`)}
                        onContact={handleContactOwner}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mobile "View All" button */}
                <motion.div variants={itemVariants} className="mt-12 text-center md:hidden">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push('/listings')}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto"
                  >
                    {language === 'en' ? 'View All Properties' : 'Angalia Mali Zote'}
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-20 bg-neutral-surface rounded-2xl border-2 border-dashed border-neutral-border"
              >
                <Building2 className="w-20 h-20 mx-auto mb-6 text-neutral-text-secondary opacity-40" />
                <h3 className="text-h3 mb-3">
                  {language === 'en' ? 'No Properties Yet' : 'Hakuna Mali Bado'}
                </h3>
                <p className="text-body text-neutral-text-secondary mb-8">
                  {language === 'en'
                    ? 'Be the first to list your commercial space on Space Hub'
                    : 'Kuwa wa kwanza kuorodhesha nafasi yako ya biashara kwenye Space Hub'}
                </p>
                <Button variant="primary" onClick={() => router.push('/listings')}>
                  {language === 'en' ? 'Browse All Listings' : 'Angalia Orodha Zote'}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-neutral-surface relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {/* Section Header */}
            <motion.div className="text-center mb-20" variants={itemVariants}>
              <h2 className="text-h1 font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {language === 'en' ? 'How Space Hub Works' : 'Jinsi Space Hub Inavyofanya Kazi'}
              </h2>
              <p className="text-body-lg text-neutral-text-secondary max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Three simple steps to secure your ideal commercial location'
                  : 'Hatua tatu rahisi kupata eneo lako bora la biashara'}
              </p>
            </motion.div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines (desktop) */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />

              {howItWorksSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    className="relative group"
                    variants={itemVariants}
                  >
                    {/* Step number circle */}
                    <div className="relative z-10 mb-8">
                      <div className="w-48 h-48 mx-auto bg-gradient-to-br from-brand-primary to-status-info rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                        <div className="w-40 h-40 bg-neutral-surface rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <Icon className="w-16 h-16 text-brand-primary mx-auto mb-2" />
                            <span
                              className="text-[32px] font-black text-brand-primary/30 font-mono"
                              style={{ fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              0{index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-h3 mb-4 font-bold">{step.title}</h3>
                      <p className="text-body text-neutral-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-neutral-bg">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {/* Section Header */}
            <motion.div className="text-center mb-20" variants={itemVariants}>
              <h2 className="text-h1 font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {language === 'en' ? 'Why Choose Space Hub?' : 'Kwa Nini Uchague Space Hub?'}
              </h2>
              <p className="text-body-lg text-neutral-text-secondary max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Built specifically for Nairobi\'s commercial property market'
                  : 'Imejengwa maalum kwa soko la mali za biashara Nairobi'}
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className="h-full p-8 bg-neutral-surface border-2 border-neutral-border rounded-2xl hover:border-brand-primary hover:shadow-2xl transition-all duration-300">
                      {/* Icon */}
                      <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-primary/10 mb-6 group-hover:bg-brand-primary transition-all duration-300"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-10 h-10 text-brand-primary group-hover:text-white transition-colors duration-300" />
                      </motion.div>

                      <h3 className="text-h3 mb-3 font-bold">{feature.title}</h3>
                      <p className="text-body text-neutral-text-secondary mb-8 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Stat */}
                      <div className="pt-6 border-t border-neutral-border">
                        <div
                          className="text-[36px] font-bold text-brand-primary font-mono leading-none mb-2"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {feature.stat}
                        </div>
                        <div className="text-small text-neutral-text-secondary font-medium">
                          {feature.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Benefits Grid */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="p-6 bg-gradient-to-br from-neutral-surface to-neutral-bg rounded-xl border border-neutral-border hover:border-brand-primary/50 transition-all duration-300"
                    >
                      <Icon className="w-8 h-8 text-brand-accent mb-4" />
                      <h4 className="text-body font-bold mb-2">{benefit.title}</h4>
                      <p className="text-small text-neutral-text-secondary leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-brand-primary to-status-info text-white overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-accent rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {/* Section Header */}
            <motion.div className="text-center mb-20" variants={itemVariants}>
              <h2 className="text-h1 font-black mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {language === 'en' ? 'Success Stories' : 'Hadithi za Mafanikio'}
              </h2>
              <p className="text-[20px] opacity-90 max-w-2xl mx-auto font-light">
                {language === 'en'
                  ? 'Join thousands of entrepreneurs who found their perfect space'
                  : 'Jiunge na wafanyabiashara elfu waliopata nafasi zao bora'}
              </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="h-full p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-brand-accent text-brand-accent"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-body-lg mb-8 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/20">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{testimonial.name}</div>
                        <div className="text-sm opacity-80">{testimonial.role}</div>
                        <div className="text-xs opacity-70 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-neutral-surface relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-display font-black mb-6 leading-[1.1]" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {language === 'en' ? (
                  <>
                    Ready to Find Your
                    <br />
                    <span className="text-brand-primary">Perfect Space?</span>
                  </>
                ) : (
                  <>
                    Tayari Kupata
                    <br />
                    <span className="text-brand-primary">Nafasi Yako Bora?</span>
                  </>
                )}
              </h2>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-[22px] text-neutral-text-secondary mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              {language === 'en'
                ? 'Join Space Hub today and discover why thousands of businesses trust us with their most important decision - location.'
                : 'Jiunge na Space Hub leo na gundua kwa nini biashara elfu zinatuamini kwa uamuzi wao muhimu zaidi - eneo.'}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/listings')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="bg-brand-primary hover:bg-brand-primary/90 shadow-2xl px-12 py-6 text-lg font-semibold min-w-[240px]"
              >
                {language === 'en' ? 'Start Searching' : 'Anza Kutafuta'}
              </Button>

              {user?.role === 'OWNER' ? (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/dashboard/properties/new')}
                  rightIcon={<Building2 className="w-5 h-5" />}
                  className="shadow-xl px-12 py-6 text-lg font-semibold min-w-[240px]"
                >
                  {language === 'en' ? 'List Property' : 'Orodhesha Mali'}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/signup')}
                  rightIcon={<Users className="w-5 h-5" />}
                  className="shadow-xl px-12 py-6 text-lg font-semibold min-w-[240px]"
                >
                  {language === 'en' ? 'Join as Owner' : 'Jiunge kama Mmiliki'}
                </Button>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-16 pt-12 border-t border-neutral-border"
            >
              <div className="flex flex-wrap justify-center items-center gap-8 text-neutral-text-secondary">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-primary" />
                  <span className="text-small font-medium">
                    {language === 'en' ? '100% Verified Listings' : '100% Orodha Zilizoidhinishwa'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-primary" />
                  <span className="text-small font-medium">
                    {language === 'en' ? 'Secure M-Pesa Payments' : 'Malipo Salama ya M-Pesa'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-primary" />
                  <span className="text-small font-medium">
                    {language === 'en' ? '8,500+ Happy Tenants' : 'Wapangaji 8,500+ Furaha'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}