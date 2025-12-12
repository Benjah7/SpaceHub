'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Building2,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardStatsSkeleton, ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { PROPERTY_STATUS_LABELS } from '@/types';
import type { Property, Inquiry } from '@/types';
import { OwnerVerification } from '@/components/verification/OwnerVerification';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useLanguageStore();

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalInquiries: 0,
    totalViews: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'OWNER') {
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user's properties
      const propertiesResponse = await apiClient.getProperties({
        ownerId: user?.id,
        limit: 10,
      });
      setProperties(propertiesResponse.data);

      // Calculate stats from properties
      const activeCount = propertiesResponse.data.filter(
        (p) => p.status === 'AVAILABLE'
      ).length;
      const totalViews = propertiesResponse.data.reduce((sum, p) => sum + p.views, 0);
      const totalInquiriesCount = propertiesResponse.data.reduce(
        (sum, p) => sum + p.inquiries,
        0
      );

      setStats({
        activeListings: activeCount,
        totalInquiries: totalInquiriesCount,
        totalViews,
        monthlyRevenue: 0, // Would need to fetch from payments endpoint
      });

      // Fetch recent inquiries for all properties
      if (propertiesResponse.data.length > 0) {
        const allInquiries: Inquiry[] = [];
        for (const property of propertiesResponse.data.slice(0, 3)) {
          try {
            const propertyInquiries = await apiClient.getPropertyInquiries(property.id);
            allInquiries.push(...propertyInquiries);
          } catch (error) {
            // Continue even if one fails
          }
        }
        setInquiries(allInquiries.slice(0, 5));
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-neutral-bg py-xl">
        <div className="container-custom">
          <DashboardStatsSkeleton />
          <div className="mt-xl">
            <ListSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">

        {user?.role === 'OWNER' && (
          <div className="mb-6">
            <OwnerVerification />
          </div>
        )}
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-h1 mb-2">{t('dashboard.welcome')}</h1>
            <p className="text-body text-neutral-text-secondary">
              Welcome back, {user.firstName}! Here's your property overview.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            href="/dashboard/properties/new"
          >
            {t('dashboard.addProperty')}
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <div className="p-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      {t('dashboard.activeListings')}
                    </p>
                    <p className="text-h1 font-bold">{stats.activeListings}</p>
                  </div>
                  <div className="p-3 bg-brand-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-brand-primary" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <div className="p-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      {t('dashboard.totalInquiries')}
                    </p>
                    <p className="text-h1 font-bold">{stats.totalInquiries}</p>
                  </div>
                  <div className="p-3 bg-brand-secondary/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-brand-secondary" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <div className="p-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      {t('dashboard.totalViews')}
                    </p>
                    <p className="text-h1 font-bold">{stats.totalViews}</p>
                  </div>
                  <div className="p-3 bg-status-info/10 rounded-lg">
                    <Eye className="w-6 h-6 text-status-info" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <div className="p-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      {t('dashboard.monthlyRevenue')}
                    </p>
                    <p className="text-h1 font-bold">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-status-success/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-status-success" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* My Properties */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-h2">{t('dashboard.myProperties')}</h2>
                  <Button
                    variant="text"
                    size="sm"
                    href="/dashboard/properties"
                  >
                    {t('dashboard.viewAllProperties')}
                  </Button>
                </div>
              </div>
              <div className="p-lg">
                {properties.length > 0 ? (
                  <div className="space-y-md">
                    {properties.slice(0, 5).map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center gap-md p-md rounded-lg hover:bg-neutral-bg transition-colors cursor-pointer"
                        onClick={() => router.push(`/properties/${property.id}`)}
                      >
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={property.images[0]?.url || '/placeholder.jpg'}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-body font-semibold truncate">
                            {property.title}
                          </h3>
                          <p className="text-small text-neutral-text-secondary">
                            {formatCurrency(property.price)}/month • {property.size} m²
                          </p>
                          <div className="flex items-center gap-md mt-1">
                            <span className="text-tiny text-neutral-text-secondary flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {property.views}
                            </span>
                            <span className="text-tiny text-neutral-text-secondary flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {property.inquiries}
                            </span>
                            <Badge variant="success" className="text-tiny">
                              {PROPERTY_STATUS_LABELS[property.status]}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/properties/${property.id}/edit`);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Building2}
                    title={t('dashboard.noPropertiesYet')}
                    description={t('dashboard.noPropertiesDescription')}
                    actionLabel={t('dashboard.addProperty')}
                    actionHref="/dashboard/properties/new"
                  />
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Inquiries & Quick Actions */}
          <motion.div
            className="space-y-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Quick Actions */}
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h3 className="text-h3">{t('dashboard.quickActions')}</h3>
              </div>
              <div className="p-lg space-y-md">
                <Button
                  variant="secondary"
                  fullWidth
                  leftIcon={<Plus className="w-5 h-5" />}
                  href="/dashboard/properties/new"
                >
                  {t('dashboard.addProperty')}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  leftIcon={<MessageSquare className="w-5 h-5" />}
                  href="/dashboard/inquiries"
                >
                  {t('dashboard.viewInquiries')}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  leftIcon={<Eye className="w-5 h-5" />}
                  href="/dashboard/analytics"
                >
                  View Analytics
                </Button>
              </div>
            </Card>

            {/* Recent Inquiries */}
            <Card>
              <div className="p-lg border-b border-neutral-border">
                <h3 className="text-h3">Recent Inquiries</h3>
              </div>
              <div className="p-lg">
                {inquiries.length > 0 ? (
                  <div className="space-y-md">
                    {inquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="p-md bg-neutral-bg rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-small font-semibold">
                            {inquiry.tenant.name}
                          </p>
                          <Badge
                            variant={
                              inquiry.status === 'PENDING'
                                ? 'warning'
                                : inquiry.status === 'RESPONDED'
                                  ? 'success'
                                  : 'secondary'
                            }
                            className="text-tiny"
                          >
                            {inquiry.status}
                          </Badge>
                        </div>
                        <p className="text-tiny text-neutral-text-secondary mb-2">
                          {inquiry.property?.title || 'Property'}
                        </p>
                        <p className="text-small text-neutral-text-primary line-clamp-2 mb-2">
                          {inquiry.message}
                        </p>
                        <p className="text-tiny text-neutral-text-secondary">
                          {formatRelativeTime(inquiry.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-small text-neutral-text-secondary text-center py-lg">
                    No inquiries yet
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}