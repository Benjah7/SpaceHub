'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Eye,
    MessageSquare,
    Heart,
    DollarSign,
    Building2,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProperties } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import type { Property, PropertyAnalytics, DashboardStats } from '@/types';

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

const TIME_PERIODS = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
];

interface EnhancedProperty extends Property {
    analytics?: PropertyAnalytics;
}

export default function DashboardAnalyticsPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [timePeriod, setTimePeriod] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<EnhancedProperty[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

    // Fetch properties
    const {
        data: propertiesData,
        loading: propertiesLoading,
        refetch,
    } = useProperties({
        ownerId: user?.id,
        limit: 100,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!propertiesData) return;

            setLoading(true);
            try {
                // Fetch dashboard stats
                const stats = await apiClient.getOwnerDashboard();
                setDashboardStats(stats);

                // Fetch analytics for each property
                const propertiesWithAnalytics = await Promise.all(
                    propertiesData.map(async (property) => {
                        try {
                            const analytics = await apiClient.getPropertyAnalytics(property.id);
                            return { ...property, analytics };
                        } catch (error) {
                            console.error(`Failed to fetch analytics for property ${property.id}`);
                            return property;
                        }
                    })
                );

                setProperties(propertiesWithAnalytics);
            } catch (error) {
                ErrorHandler.handle(error, 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        if (propertiesData) {
            fetchAnalytics();
        }
    }, [propertiesData]);

    // Calculate aggregated metrics
    const aggregatedMetrics = React.useMemo(() => {
        if (!properties.length) {
            return {
                totalViews: 0,
                totalInquiries: 0,
                totalFavorites: 0,
                averageViews: 0,
                conversionRate: 0,
                topPerformer: null,
            };
        }

        const totalViews = properties.reduce((sum, p) => sum + (p.analytics?.views || p.views), 0);
        const totalInquiries = properties.reduce(
            (sum, p) => sum + (p.analytics?.inquiries || p.inquiries),
            0
        );
        const totalFavorites = properties.reduce(
            (sum, p) => sum + (p.analytics?.favorites || 0),
            0
        );

        const averageViews = totalViews / properties.length;
        const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

        // Find top performer by views
        const topPerformer = properties.reduce((top, current) => {
            const currentViews = current.analytics?.views || current.views;
            const topViews = top ? top.analytics?.views || top.views : 0;
            return currentViews > topViews ? current : top;
        }, properties[0]);

        return {
            totalViews,
            totalInquiries,
            totalFavorites,
            averageViews,
            conversionRate,
            topPerformer,
        };
    }, [properties]);

    // Sort properties by performance
    const topPerformingProperties = React.useMemo(() => {
        return [...properties]
            .sort((a, b) => {
                const aViews = a.analytics?.views || a.views;
                const bViews = b.analytics?.views || b.views;
                return bViews - aViews;
            })
            .slice(0, 5);
    }, [properties]);

    if (loading || propertiesLoading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={4} />
                </div>
            </div>
        );
    }

    if (!properties.length) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <EmptyState
                        icon={BarChart3}
                        title="No Analytics Available"
                        description="Add properties to start tracking analytics and performance metrics"
                        actionLabel="Add Property"
                        actionHref="/dashboard/properties/new"
                    />
                </div>
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
                        <h1 className="text-h1 mb-2">Analytics</h1>
                        <p className="text-body text-neutral-text-secondary">
                            Track your property performance and insights
                        </p>
                    </div>
                    <div className="w-48">
                        <Select
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            options={TIME_PERIODS}
                        />
                    </div>
                </motion.div>

                {/* Overview Stats */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Total Views */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <div className="p-lg">
                                <div className="flex items-start justify-between mb-md">
                                    <div className="p-3 bg-status-info/10 rounded-lg">
                                        <Eye className="w-6 h-6 text-status-info" />
                                    </div>
                                    <Badge variant="success" className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>12%</span>
                                    </Badge>
                                </div>
                                <p className="text-small text-neutral-text-secondary mb-1">Total Views</p>
                                <p className="text-h1 font-bold">{formatNumber(aggregatedMetrics.totalViews)}</p>
                                <p className="text-tiny text-neutral-text-tertiary mt-2">
                                    Avg: {formatNumber(Math.round(aggregatedMetrics.averageViews))} per property
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Total Inquiries */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <div className="p-lg">
                                <div className="flex items-start justify-between mb-md">
                                    <div className="p-3 bg-brand-secondary/10 rounded-lg">
                                        <MessageSquare className="w-6 h-6 text-brand-secondary" />
                                    </div>
                                    <Badge variant="success" className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>8%</span>
                                    </Badge>
                                </div>
                                <p className="text-small text-neutral-text-secondary mb-1">Total Inquiries</p>
                                <p className="text-h1 font-bold">
                                    {formatNumber(aggregatedMetrics.totalInquiries)}
                                </p>
                                <p className="text-tiny text-neutral-text-tertiary mt-2">
                                    {formatPercentage(aggregatedMetrics.conversionRate)} conversion rate
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Total Favorites */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <div className="p-lg">
                                <div className="flex items-start justify-between mb-md">
                                    <div className="p-3 bg-status-error/10 rounded-lg">
                                        <Heart className="w-6 h-6 text-status-error" />
                                    </div>
                                    <Badge variant="success" className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>15%</span>
                                    </Badge>
                                </div>
                                <p className="text-small text-neutral-text-secondary mb-1">Total Favorites</p>
                                <p className="text-h1 font-bold">
                                    {formatNumber(aggregatedMetrics.totalFavorites)}
                                </p>
                                <p className="text-tiny text-neutral-text-tertiary mt-2">
                                    Saved by users
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Revenue */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <div className="p-lg">
                                <div className="flex items-start justify-between mb-md">
                                    <div className="p-3 bg-status-success/10 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-status-success" />
                                    </div>
                                    <Badge variant="default" className="flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        <span>--</span>
                                    </Badge>
                                </div>
                                <p className="text-small text-neutral-text-secondary mb-1">Monthly Revenue</p>
                                <p className="text-h1 font-bold">
                                    {formatCurrency(dashboardStats?.monthlyRevenue || 0)}
                                </p>
                                <p className="text-tiny text-neutral-text-tertiary mt-2">
                                    From {properties.filter((p) => p.status === 'RENTED').length} rented properties
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                    {/* Top Performing Properties */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h2 className="text-h2">Top Performing Properties</h2>
                            </div>
                            <div className="p-lg">
                                <div className="space-y-md">
                                    {topPerformingProperties.map((property, index) => {
                                        const views = property.analytics?.views || property.views;
                                        const inquiries = property.analytics?.inquiries || property.inquiries;
                                        const conversionRate = views > 0 ? (inquiries / views) * 100 : 0;

                                        return (
                                            <div
                                                key={property.id}
                                                className="p-md bg-neutral-bg rounded-lg hover:bg-neutral-border/30 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/properties/${property.id}`)}
                                            >
                                                <div className="flex items-start gap-md">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary font-bold flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-h3 mb-2 line-clamp-1">{property.title}</h3>
                                                        <div className="grid grid-cols-3 gap-4 text-small">
                                                            <div>
                                                                <p className="text-neutral-text-tertiary mb-1">Views</p>
                                                                <p className="font-semibold">{formatNumber(views)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-neutral-text-tertiary mb-1">Inquiries</p>
                                                                <p className="font-semibold">{formatNumber(inquiries)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-neutral-text-tertiary mb-1">Conversion</p>
                                                                <p className="font-semibold">{formatPercentage(conversionRate)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={property.status === 'AVAILABLE' ? 'success' : 'default'}
                                                    >
                                                        {property.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Quick Insights */}
                    <motion.div
                        className="space-y-lg"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* Top Performer */}
                        {aggregatedMetrics.topPerformer && (
                            <Card>
                                <div className="p-lg border-b border-neutral-border">
                                    <h3 className="text-h3">Top Performer</h3>
                                </div>
                                <div className="p-lg">
                                    <div className="flex items-center gap-2 mb-md">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        <Badge variant="success">Best</Badge>
                                    </div>
                                    <h4 className="text-body font-semibold mb-2 line-clamp-2">
                                        {aggregatedMetrics.topPerformer.title}
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-small">
                                            <span className="text-neutral-text-secondary">Views</span>
                                            <span className="font-semibold">
                                                {formatNumber(
                                                    aggregatedMetrics.topPerformer.analytics?.views ||
                                                    aggregatedMetrics.topPerformer.views
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-small">
                                            <span className="text-neutral-text-secondary">Inquiries</span>
                                            <span className="font-semibold">
                                                {formatNumber(
                                                    aggregatedMetrics.topPerformer.analytics?.inquiries ||
                                                    aggregatedMetrics.topPerformer.inquiries
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Property Status Distribution */}
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h3 className="text-h3">Property Status</h3>
                            </div>
                            <div className="p-lg space-y-md">
                                {[
                                    {
                                        status: 'AVAILABLE',
                                        label: 'Available',
                                        color: 'bg-status-success',
                                        count: properties.filter((p) => p.status === 'AVAILABLE').length,
                                    },
                                    {
                                        status: 'RENTED',
                                        label: 'Rented',
                                        color: 'bg-status-error',
                                        count: properties.filter((p) => p.status === 'RENTED').length,
                                    },
                                    {
                                        status: 'PENDING',
                                        label: 'Pending',
                                        color: 'bg-status-warning',
                                        count: properties.filter((p) => p.status === 'PENDING').length,
                                    },
                                    {
                                        status: 'INACTIVE',
                                        label: 'Inactive',
                                        color: 'bg-neutral-text-tertiary',
                                        count: properties.filter((p) => p.status === 'INACTIVE').length,
                                    },
                                ].map(({ status, label, color, count }) => {
                                    const percentage = (count / properties.length) * 100;
                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-small text-neutral-text-secondary">{label}</span>
                                                <span className="text-small font-semibold">
                                                    {count} ({formatPercentage(percentage)})
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-neutral-border rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${color} transition-all duration-300`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Performance Tips */}
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h3 className="text-h3">Performance Tips</h3>
                            </div>
                            <div className="p-lg space-y-md text-small">
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                                    <p className="text-neutral-text-secondary">
                                        Properties with more photos get 3x more views
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                                    <p className="text-neutral-text-secondary">
                                        Respond to inquiries within 24 hours to improve conversion
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0" />
                                    <p className="text-neutral-text-secondary">
                                        Featured listings get 5x more visibility
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}