'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Heart, MessageSquare, Search, CreditCard,
    Bell, Settings, LogOut, LayoutDashboard, ChevronDown,TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';

interface ProfileDropdownProps {
    user: UserType;
}

interface MenuItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    badge?: number;
    onClick?: () => void;
    divider?: boolean;
    danger?: boolean;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { logout } = useAuthStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        router.push('/login');
    };

    const getMenuItems = (): MenuItem[] => {

        if (user.role === 'ADMIN') {
            return [
                {
                    label: 'Verification',
                    href: '/admin/verification',
                    icon: <LayoutDashboard className="w-4 h-4" />,
                },
                {
                    label: 'Platform Analytics',
                    href: '/admin/analytics',
                    icon: <TrendingUp className="w-4 h-4" />,
                },
                {
                    label: 'Settings',
                    href: '/admin/settings',
                    icon: <Settings className="w-4 h-4" />,
                    divider: true,
                },
                {
                    label: 'Payment Overview',
                    href: '/admin/payments',
                    icon: <CreditCard className="w-4 h-4" />,
                },
                {
                    label: 'Logout',
                    icon: <LogOut className="w-4 h-4" />,
                    onClick: handleLogout,
                    danger: true,
                }
            ];
        }

        if (user.role === 'OWNER') {
            return [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    icon: <LayoutDashboard className="w-4 h-4" />,
                },
                {
                    label: 'Settings',
                    href: '/dashboard/settings',
                    icon: <Settings className="w-4 h-4" />,
                },
                {
                    label: 'Payment Overview',
                    href: '/owner/payments',
                    icon: <CreditCard className="w-4 h-4" />,
                    divider: true,
                },
                {
                    label: 'Logout',
                    icon: <LogOut className="w-4 h-4" />,
                    onClick: handleLogout,
                    divider: true,
                    danger: true,
                },
            ];
        }

        return [
            {
                label: 'My Profile',
                href: '/profile',
                icon: <User className="w-4 h-4" />,
            },
            {
                label: 'My Favorites',
                href: '/profile/favorites',
                icon: <Heart className="w-4 h-4" />,
            },
            {
                label: 'My Inquiries',
                href: '/profile/inquiries',
                icon: <MessageSquare className="w-4 h-4" />,
            },
            {
                label: 'Saved Searches',
                href: '/profile/saved-searches',
                icon: <Search className="w-4 h-4" />,
            },
            {
                label: 'Payment History',
                href: '/profile/payments',
                icon: <CreditCard className="w-4 h-4" />,
            },
            {
                label: 'Notifications',
                href: '/profile/notifications',
                icon: <Bell className="w-4 h-4" />,
            },
            {
                label: 'Settings',
                href: '/profile/settings',
                icon: <Settings className="w-4 h-4" />,
                divider: true,
            },
            {
                label: 'Logout',
                icon: <LogOut className="w-4 h-4" />,
                onClick: handleLogout,
                danger: true,
            },
        ];
    };

    const menuItems = getMenuItems();

    const handleMenuItemClick = (item: MenuItem) => {
        if (item.onClick) {
            item.onClick();
        } else if (item.href) {
            router.push(item.href);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                    'hover:bg-neutral-bg',
                    isOpen && 'bg-neutral-bg'
                )}
            >
                <div className="relative">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                            <span className="text-white text-small font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    {user.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-success rounded-full border-2 border-neutral-surface" />
                    )}
                </div>

                <div className="hidden md:block text-left">
                    <p className="text-small font-medium text-neutral-text-primary leading-tight">
                        {user.name}
                    </p>
                    <p className="text-tiny text-neutral-text-secondary leading-tight">
                        {user.role}
                    </p>
                </div>

                <ChevronDown
                    className={cn(
                        'w-4 h-4 text-neutral-text-secondary transition-transform',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-neutral-surface border border-neutral-border rounded-lg shadow-xl overflow-hidden z-50"
                    >
                        <div className="px-4 py-3 bg-neutral-bg border-b border-neutral-border">
                            <p className="text-body font-semibold text-neutral-text-primary">
                                {user.name}
                            </p>
                            <p className="text-small text-neutral-text-secondary">{user.email}</p>
                            {user.verified && (
                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-status-success/10 text-status-success text-tiny font-medium rounded">
                                    ✓ Verified
                                </span>
                            )}
                        </div>

                        <div className="py-2">
                            {menuItems.map((item, index) => (
                                <React.Fragment key={`${item.label}-${index}`}>
                                    {item.divider && <div className="h-px bg-neutral-border my-2" />}
                                    <button
                                        onClick={() => handleMenuItemClick(item)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                            item.danger
                                                ? 'text-status-error hover:bg-status-error/10'
                                                : 'text-neutral-text-primary hover:bg-neutral-bg'
                                        )}
                                    >
                                        <span className={cn(item.danger ? 'text-status-error' : 'text-neutral-text-secondary')}>
                                            {item.icon}
                                        </span>
                                        <span className="text-small font-medium flex-1">{item.label}</span>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <span className="px-2 py-0.5 bg-brand-primary text-white text-tiny font-semibold rounded-full">
                                                {item.badge > 99 ? '99+' : item.badge}
                                            </span>
                                        )}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

ProfileDropdown.displayName = 'ProfileDropdown';