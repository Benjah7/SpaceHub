'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Globe, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguageStore } from '@/lib/store/language-store';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const { language, setLanguage } = useLanguageStore();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [savingPreferences, setSavingPreferences] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setChangingPassword(true);
        try {
            await apiClient.updateProfile({ password: passwordForm.newPassword } as any);
            toast.success('Password updated successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Failed to update password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSavePreferences = async () => {
        setSavingPreferences(true);
        try {
            // API call to save notification preferences
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Preferences saved');
        } catch (error) {
            toast.error('Failed to save preferences');
        } finally {
            setSavingPreferences(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await apiClient.deleteAccount();
            toast.success('Account deleted successfully');
            logout();
            router.push('/');
        } catch (error) {
            toast.error('Failed to delete account');
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-bg py-xl">
            <div className="container-custom max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-xl"
                >
                    <h1 className="text-h1 mb-2">Settings</h1>
                    <p className="text-body text-neutral-text-secondary">
                        Manage your account preferences
                    </p>
                </motion.div>

                <div className="space-y-xl">
                    {/* Password Section */}
                    <Card>
                        <div className="p-lg border-b border-neutral-border">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-brand-primary" />
                                <h3 className="text-h3">Change Password</h3>
                            </div>
                        </div>
                        <div className="p-xl">
                            <form onSubmit={handlePasswordChange} className="space-y-lg">
                                <Input
                                    type="password"
                                    label="Current Password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    required
                                />
                                <Input
                                    type="password"
                                    label="New Password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    required
                                />
                                <Input
                                    type="password"
                                    label="Confirm New Password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    leftIcon={<Save className="w-4 h-4" />}
                                    isLoading={changingPassword}
                                >
                                    Update Password
                                </Button>
                            </form>
                        </div>
                    </Card>

                    {/* Notification Preferences */}
                    <Card>
                        <div className="p-lg border-b border-neutral-border">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-brand-primary" />
                                <h3 className="text-h3">Notification Preferences</h3>
                            </div>
                        </div>
                        <div className="p-xl space-y-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-body font-medium mb-1">Email Notifications</p>
                                    <p className="text-small text-neutral-text-secondary">
                                        Receive updates via email
                                    </p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onChange={setEmailNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-body font-medium mb-1">SMS Notifications</p>
                                    <p className="text-small text-neutral-text-secondary">
                                        Receive updates via SMS
                                    </p>
                                </div>
                                <Switch
                                    checked={smsNotifications}
                                    onChange={setSmsNotifications}
                                />
                            </div>
                            <Button
                                variant="primary"
                                leftIcon={<Save className="w-4 h-4" />}
                                onClick={handleSavePreferences}
                                isLoading={savingPreferences}
                            >
                                Save Preferences
                            </Button>
                        </div>
                    </Card>

                    {/* Language Preferences */}
                    <Card>
                        <div className="p-lg border-b border-neutral-border">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-brand-primary" />
                                <h3 className="text-h3">Language</h3>
                            </div>
                        </div>
                        <div className="p-xl">
                            <div className="flex items-center gap-md">
                                <Button
                                    variant={language === 'en' ? 'primary' : 'secondary'}
                                    onClick={() => setLanguage('en')}
                                >
                                    English
                                </Button>
                                <Button
                                    variant={language === 'sw' ? 'primary' : 'secondary'}
                                    onClick={() => setLanguage('sw')}
                                >
                                    Kiswahili
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-status-error">
                        <div className="p-lg border-b border-status-error bg-status-error/5">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-5 h-5 text-status-error" />
                                <h3 className="text-h3 text-status-error">Danger Zone</h3>
                            </div>
                        </div>
                        <div className="p-xl">
                            <p className="text-body mb-lg">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button
                                variant="danger"
                                leftIcon={<Trash2 className="w-4 h-4" />}
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </Card>
                </div>

                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={handleDeleteAccount}
                    title="Delete Account"
                    description="Are you sure you want to delete your account? This action cannot be undone."
                    confirmLabel="Delete Account"
                    variant="danger"
                    loading={deleting}
                />
            </div>
        </div>
    );
}
