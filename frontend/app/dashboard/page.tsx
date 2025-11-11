'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  MessageSquare,
  Eye,
  Calendar,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store/auth-store';
import type { Property, DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const statsResponse = await apiClient.get<DashboardStats>('/dashboard/stats');
      // const propertiesResponse = await apiClient.get<Property[]>('/properties/my-listings');
      
      // Mock data
      setStats({
        activeListings: 8,
        totalInquiries: 24,
        totalViews: 156,
        bookedProperties: 5,
        monthlyRevenue: 640000,
        recentActivity: [
          {
            id: '1',
            type: 'INQUIRY',
            description: 'New inquiry on "Westlands Shop"',
            timestamp: new Date().toISOString(),
            propertyId: '1',
          },
          {
            id: '2',
            type: 'VIEW',
            description: 'Property viewed 12 times today',
            timestamp: new Date().toISOString(),
            propertyId: '2',
          },
        ],
      });

      setProperties([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-h1 mb-2">Dashboard</h1>
            <p className="text-body text-neutral-text-secondary">
              Welcome back, {user?.firstName}! Here's your property overview.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-5 h-5" />}
            href="/dashboard/properties/new"
          >
            Add Property
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
            <Card hoverable>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      Active Listings
                    </p>
                    <p className="text-h1 font-bold">{stats?.activeListings || 0}</p>
                  </div>
                  <div className="p-3 bg-brand-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-brand-primary" />
                  </div>
                </div>
                <p className="text-tiny text-status-success mt-2">
                  ↑ 12% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hoverable>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      Total Inquiries
                    </p>
                    <p className="text-h1 font-bold">{stats?.totalInquiries || 0}</p>
                  </div>
                  <div className="p-3 bg-brand-secondary/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-brand-secondary" />
                  </div>
                </div>
                <p className="text-tiny text-status-success mt-2">
                  ↑ 8% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hoverable>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      Total Views
                    </p>
                    <p className="text-h1 font-bold">{stats?.totalViews || 0}</p>
                  </div>
                  <div className="p-3 bg-status-info/10 rounded-lg">
                    <Eye className="w-6 h-6 text-status-info" />
                  </div>
                </div>
                <p className="text-tiny text-status-success mt-2">
                  ↑ 15% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card hoverable>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-small text-neutral-text-secondary mb-1">
                      Monthly Revenue
                    </p>
                    <p className="text-h1 font-bold">
                      {formatCurrency(stats?.monthlyRevenue || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-status-success/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-status-success" />
                  </div>
                </div>
                <p className="text-tiny text-status-success mt-2">
                  ↑ 20% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader title="Recent Activity" />
              <CardContent>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-md">
                    {stats.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-md p-md rounded-lg hover:bg-neutral-bg transition-colors"
                      >
                        <div className="p-2 bg-brand-primary/10 rounded-full">
                          {activity.type === 'INQUIRY' ? (
                            <MessageSquare className="w-5 h-5 text-brand-primary" />
                          ) : (
                            <Eye className="w-5 h-5 text-brand-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-body">{activity.description}</p>
                          <p className="text-tiny text-neutral-text-secondary mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-neutral-text-secondary py-xl">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* My Properties */}
            <Card className="mt-xl">
              <CardHeader
                title="My Properties"
                action={
                  <Button
                    variant="text"
                    size="sm"
                    href="/dashboard/properties"
                  >
                    View All
                  </Button>
                }
              />
              <CardContent>
                {properties.length > 0 ? (
                  <div className="space-y-md">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center gap-md p-md rounded-lg hover:bg-neutral-bg transition-colors"
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
                            {formatCurrency(property.price)}/month • {property.size} sqm
                          </p>
                          <div className="flex items-center gap-md mt-1">
                            <span className="text-tiny text-neutral-text-secondary">
                              👁 {property.views}
                            </span>
                            <span className="text-tiny text-neutral-text-secondary">
                              💬 {property.inquiries}
                            </span>
                            <Badge variant="success" className="text-tiny">
                              {property.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="text"
                            size="sm"
                            href={`/dashboard/properties/${property.id}/edit`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="text" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-xl">
                    <Building2 className="w-16 h-16 mx-auto mb-md text-neutral-border" />
                    <p className="text-h3 mb-md">No properties yet</p>
                    <p className="text-body text-neutral-text-secondary mb-lg">
                      Start by adding your first property listing
                    </p>
                    <Button
                      variant="primary"
                      leftIcon={<Plus className="w-5 h-5" />}
                      href="/dashboard/properties/new"
                    >
                      Add Property
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent>
                <div className="space-y-md">
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<Plus className="w-5 h-5" />}
                    href="/dashboard/properties/new"
                  >
                    Add New Property
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<MessageSquare className="w-5 h-5" />}
                    href="/dashboard/inquiries"
                  >
                    View Inquiries
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<Calendar className="w-5 h-5" />}
                    href="/dashboard/bookings"
                  >
                    Manage Bookings
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<TrendingUp className="w-5 h-5" />}
                    href="/dashboard/analytics"
                  >
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-xl">
              <CardHeader title="💡 Tips for Success" />
              <CardContent>
                <ul className="space-y-md text-small">
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Upload high-quality photos to get 40% more views</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Respond to inquiries within 24 hours</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Keep your availability calendar updated</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✓</span>
                    <span>Verify your properties for more trust</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
