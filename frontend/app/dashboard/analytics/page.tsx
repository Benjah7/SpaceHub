'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Eye,
    MessageSquare,
    Heart,
    Building2,
    Download,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProperties } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import type { Property, PropertyAnalytics, TimeSeriesData } from '@/types';

const TIME_PERIODS = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
];

const CHART_COLORS = {
    primary: '#E67E22',
    secondary: '#3498DB',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#9B59B6',
};

interface EnhancedProperty extends Property {
    analytics?: PropertyAnalytics;
}

export default function AnalyticsDashboard() {
    const { user } = useAuthStore();
    const [timePeriod, setTimePeriod] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<EnhancedProperty[]>([]);
    const [aggregatedData, setAggregatedData] = useState<{
        viewsOverTime: TimeSeriesData[];
        inquiriesOverTime: TimeSeriesData[];
        propertyPerformance: any[];
        statusDistribution: any[];
    } | null>(null);

    const { data: propertiesData, loading: propertiesLoading } = useProperties({
        ownerId: user?.id,
        limit: 100,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!propertiesData) return;

            setLoading(true);
            try {
                // Fetch analytics for each property
                const propertiesWithAnalytics = await Promise.all(
                    propertiesData.map(async (property) => {
                        try {
                            const analytics = await apiClient.getPropertyAnalytics(property.id);
                            return { ...property, analytics };
                        } catch (error) {
                            return property;
                        }
                    })
                );

                setProperties(propertiesWithAnalytics);

                // Aggregate data for charts
                const aggregated = aggregateChartData(propertiesWithAnalytics);
                setAggregatedData(aggregated);
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

    const aggregateChartData = (props: EnhancedProperty[]) => {
        // Aggregate views over time
        const viewsMap = new Map<string, number>();
        const inquiriesMap = new Map<string, number>();

        props.forEach((prop) => {
            if (prop.analytics?.viewsOverTime) {
                prop.analytics.viewsOverTime.forEach((point) => {
                    viewsMap.set(point.date, (viewsMap.get(point.date) || 0) + point.value);
                });
            }

            if (prop.analytics?.inquiriesOverTime) {
                prop.analytics.inquiriesOverTime.forEach((point) => {
                    inquiriesMap.set(point.date, (inquiriesMap.get(point.date) || 0) + point.value);
                });
            }
        });

        const viewsOverTime = Array.from(viewsMap.entries())
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const inquiriesOverTime = Array.from(inquiriesMap.entries())
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Property performance
        const propertyPerformance = props
            .map((prop) => ({
                name: prop.title.slice(0, 20),
                views: prop.analytics?.views || prop.views,
                inquiries: prop.analytics?.inquiries || prop.inquiries,
                favorites: prop.analytics?.favorites || 0,
                conversionRate:
                    prop?.views > 0
                        ? ((prop.inquiries / prop.views) * 100).toFixed(1)
                        : '0',
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // Status distribution
        const statusCounts = props.reduce(
            (acc, prop) => {
                acc[prop.status] = (acc[prop.status] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
            name: status,
            value: count,
        }));

        return {
            viewsOverTime,
            inquiriesOverTime,
            propertyPerformance,
            statusDistribution,
        };
    };

    const calculateMetrics = () => {
        if (!properties.length) {
            return {
                totalViews: 0,
                totalInquiries: 0,
                totalFavorites: 0,
                avgConversionRate: 0,
                viewsChange: 0,
                inquiriesChange: 0,
            };
        }

        const totalViews = properties.reduce((sum, p) => sum + (p.analytics?.views || p.views), 0);
        const totalInquiries = properties.reduce(
            (sum, p) => sum + (p.analytics?.inquiries || p.inquiries),
            0
        );
        const totalFavorites = properties.reduce((sum, p) => sum + (p.analytics?.favorites || 0), 0);

        const avgConversionRate =
            totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

        // Calculate changes (mock for now - would need historical data)
        const viewsChange = 12.5;
        const inquiriesChange = 8.3;

        return {
            totalViews,
            totalInquiries,
            totalFavorites,
            avgConversionRate,
            viewsChange,
            inquiriesChange,
        };
    };

    const metrics = calculateMetrics();

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
                        icon={Building2}
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
                        <h1 className="text-h1 mb-2">Analytics Dashboard</h1>
                        <p className="text-body text-neutral-text-secondary">
                            Comprehensive insights into your property performance
                        </p>
                    </div>
                    <div className="flex items-center gap-md">
                        <Select
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            options={TIME_PERIODS}
                            className="w-48"
                        />
                        <Button variant="outline" leftIcon={<Download className="w-5 h-5" />}>
                            Export
                        </Button>
                    </div>
                </motion.div>

                {/* Key Metrics Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <div className="p-lg">
                            <div className="flex items-start justify-between mb-md">
                                <div className="p-3 bg-status-info/10 rounded-lg">
                                    <Eye className="w-6 h-6 text-status-info" />
                                </div>
                                <Badge variant={metrics.viewsChange >= 0 ? 'success' : 'error'}>
                                    {metrics.viewsChange >= 0 ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                    )}
                                    {Math.abs(metrics.viewsChange)}%
                                </Badge>
                            </div>
                            <p className="text-small text-neutral-text-secondary mb-1">Total Views</p>
                            <p className="text-h1 font-bold">{formatNumber(metrics.totalViews)}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-lg">
                            <div className="flex items-start justify-between mb-md">
                                <div className="p-3 bg-brand-primary/10 rounded-lg">
                                    <MessageSquare className="w-6 h-6 text-brand-primary" />
                                </div>
                                <Badge variant={metrics.inquiriesChange >= 0 ? 'success' : 'error'}>
                                    {metrics.inquiriesChange >= 0 ? (
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3 mr-1" />
                                    )}
                                    {Math.abs(metrics.inquiriesChange)}%
                                </Badge>
                            </div>
                            <p className="text-small text-neutral-text-secondary mb-1">Total Inquiries</p>
                            <p className="text-h1 font-bold">{formatNumber(metrics.totalInquiries)}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-lg">
                            <div className="flex items-start justify-between mb-md">
                                <div className="p-3 bg-status-error/10 rounded-lg">
                                    <Heart className="w-6 h-6 text-status-error" />
                                </div>
                            </div>
                            <p className="text-small text-neutral-text-secondary mb-1">Total Favorites</p>
                            <p className="text-h1 font-bold">{formatNumber(metrics.totalFavorites)}</p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-lg">
                            <div className="flex items-start justify-between mb-md">
                                <div className="p-3 bg-status-success/10 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-status-success" />
                                </div>
                            </div>
                            <p className="text-small text-neutral-text-secondary mb-1">
                                Conversion Rate
                            </p>
                            <p className="text-h1 font-bold">
                                {formatPercentage(metrics.avgConversionRate)}
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl mb-xl">
                    {/* Views Over Time */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h2 className="text-h2">Views Over Time</h2>
                                <p className="text-small text-neutral-text-secondary mt-1">
                                    Property views trend for the selected period
                                </p>
                            </div>
                            <div className="p-lg">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={aggregatedData?.viewsOverTime || []}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) =>
                                                new Date(value).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                            }
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                            }}
                                            labelFormatter={(value) =>
                                                new Date(value).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={CHART_COLORS.info}
                                            strokeWidth={2}
                                            fill="url(#colorViews)"
                                            name="Views"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Inquiries Over Time */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h2 className="text-h2">Inquiries Over Time</h2>
                                <p className="text-small text-neutral-text-secondary mt-1">
                                    Inquiry trend for the selected period
                                </p>
                            </div>
                            <div className="p-lg">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={aggregatedData?.inquiriesOverTime || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) =>
                                                new Date(value).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                            }
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                            }}
                                            labelFormatter={(value) =>
                                                new Date(value).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke={CHART_COLORS.primary}
                                            strokeWidth={3}
                                            dot={{ fill: CHART_COLORS.primary, r: 4 }}
                                            name="Inquiries"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Property Performance & Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl mb-xl">
                    {/* Property Performance Bar Chart */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h2 className="text-h2">Top Performing Properties</h2>
                                <p className="text-small text-neutral-text-secondary mt-1">
                                    Views and inquiries by property
                                </p>
                            </div>
                            <div className="p-lg">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={aggregatedData?.propertyPerformance || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="views" fill={CHART_COLORS.info} name="Views" radius={[8, 8, 0, 0]} />
                                        <Bar
                                            dataKey="inquiries"
                                            fill={CHART_COLORS.primary}
                                            name="Inquiries"
                                            radius={[8, 8, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="favorites"
                                            fill={CHART_COLORS.error}
                                            name="Favorites"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Status Distribution Pie Chart */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <div className="p-lg border-b border-neutral-border">
                                <h2 className="text-h2">Property Status</h2>
                                <p className="text-small text-neutral-text-secondary mt-1">
                                    Distribution by status
                                </p>
                            </div>
                            <div className="p-lg">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={aggregatedData?.statusDistribution || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) =>
                                                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {aggregatedData?.statusDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.name === 'AVAILABLE'
                                                            ? CHART_COLORS.success
                                                            : entry.name === 'RENTED'
                                                                ? CHART_COLORS.primary
                                                                : entry.name === 'PENDING'
                                                                    ? CHART_COLORS.warning
                                                                    : CHART_COLORS.error
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Legend */}
                                <div className="mt-md space-y-2">
                                    {aggregatedData?.statusDistribution.map((entry) => (
                                        <div key={entry.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            entry.name === 'AVAILABLE'
                                                                ? CHART_COLORS.success
                                                                : entry.name === 'RENTED'
                                                                    ? CHART_COLORS.primary
                                                                    : entry.name === 'PENDING'
                                                                        ? CHART_COLORS.warning
                                                                        : CHART_COLORS.error,
                                                    }}
                                                />
                                                <span className="text-small">{entry.name}</span>
                                            </div>
                                            <span className="text-small font-semibold">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Property Performance Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <div className="p-lg border-b border-neutral-border">
                            <h2 className="text-h2">Property Performance Details</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-surface">
                                    <tr>
                                        <th className="px-lg py-md text-left text-small font-semibold">Property</th>
                                        <th className="px-lg py-md text-right text-small font-semibold">Views</th>
                                        <th className="px-lg py-md text-right text-small font-semibold">
                                            Inquiries
                                        </th>
                                        <th className="px-lg py-md text-right text-small font-semibold">
                                            Favorites
                                        </th>
                                        <th className="px-lg py-md text-right text-small font-semibold">
                                            Conversion
                                        </th>
                                        <th className="px-lg py-md text-center text-small font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {properties.map((property) => {
                                        const views = property.analytics?.views || property.views;
                                        const inquiries = property.analytics?.inquiries || property.inquiries;
                                        const favorites = property.analytics?.favorites || 0;
                                        const conversion = views > 0 ? ((inquiries / views) * 100).toFixed(1) : '0';

                                        return (
                                            <tr key={property.id} className="border-t border-neutral-border hover:bg-neutral-surface/50">
                                                <td className="px-lg py-md">
                                                    <p className="font-semibold">{property.title}</p>
                                                    <p className="text-small text-neutral-text-secondary">
                                                        {property.location.neighborhood}
                                                    </p>
                                                </td>
                                                <td className="px-lg py-md text-right font-mono">{formatNumber(views)}</td>
                                                <td className="px-lg py-md text-right font-mono">
                                                    {formatNumber(inquiries)}
                                                </td>
                                                <td className="px-lg py-md text-right font-mono">
                                                    {formatNumber(favorites)}
                                                </td>
                                                <td className="px-lg py-md text-right">
                                                    <Badge
                                                        variant={
                                                            parseFloat(conversion) >= 5
                                                                ? 'success'
                                                                : parseFloat(conversion) >= 2
                                                                    ? 'warning'
                                                                    : 'error'
                                                        }
                                                    >
                                                        {conversion}%
                                                    </Badge>
                                                </td>
                                                <td className="px-lg py-md text-center">
                                                    <Badge
                                                        variant={
                                                            property.status === 'AVAILABLE'
                                                                ? 'success'
                                                                : property.status === 'RENTED'
                                                                    ? 'info'
                                                                    : 'warning'
                                                        }
                                                    >
                                                        {property.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

