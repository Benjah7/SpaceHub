'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { useNotifications } from '@/lib/hooks/useApi';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
    const { data: notifications, loading, refetch } = useNotifications();
    const [markingAll, setMarkingAll] = useState(false);

    const unreadCount = notifications?.filter((n) => !n.read).length || 0;

    const handleMarkAsRead = async (id: string) => {
        try {
            await apiClient.markNotificationAsRead(id);
            await refetch();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await apiClient.markAllNotificationsAsRead();
            await refetch();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        } finally {
            setMarkingAll(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.deleteNotification(id);
            await refetch();
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-bg py-xl">
                <div className="container-custom">
                    <ListSkeleton count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-bg py-xl">
            <div className="container-custom max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-xl"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-h1 mb-2">Notifications</h1>
                            <p className="text-body text-neutral-text-secondary">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<CheckCheck className="w-4 h-4" />}
                                onClick={handleMarkAllAsRead}
                                isLoading={markingAll}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </motion.div>

                {!notifications || notifications.length === 0 ? (
                    <EmptyState
                        icon={Bell}
                        title="No notifications"
                        description="You're all caught up! New notifications will appear here."
                    />
                ) : (
                    <div className="space-y-md">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Card className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-brand-primary' : ''}`}>
                                    <div className="p-lg">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-body font-semibold">{notification.title}</h3>
                                                    {!notification.read && (
                                                        <Badge variant="default">New</Badge>
                                                    )}
                                                </div>
                                                <p className="text-body text-neutral-text-secondary mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-small text-neutral-text-secondary">
                                                    {formatRelativeTime(notification.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <Button
                                                        variant="text"
                                                        size="sm"
                                                        leftIcon={<Check className="w-4 h-4" />}
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                    >
                                                        Mark read
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="text"
                                                    size="sm"
                                                    leftIcon={<Trash2 className="w-4 h-4" />}
                                                    onClick={() => handleDelete(notification.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
