'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit, Camera, Save, X, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileUpdate, useProfileImageUpload } from '@/lib/hooks/useForm';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        bio: '',
    });

    const { updateProfile, loading: updating } = useProfileUpdate();
    const { uploadImage, uploading } = useProfileImageUpload();

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            const updatedUser = await uploadImage(file);
            setUser(updatedUser);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedUser = await updateProfile(formData);
            setUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            bio: '',
        });
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-neutral-bg py-xl">
            <div className="container-custom max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-h1 mb-2">My Profile</h1>
                            <p className="text-body text-neutral-text-secondary">
                                Manage your account information
                            </p>
                        </div>
                        {!isEditing && (
                            <Button
                                variant="primary"
                                leftIcon={<Edit className="w-4 h-4" />}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {/* Profile Picture Card */}
                    <Card>
                        <div className="p-xl">
                            <div className="flex flex-col md:flex-row items-center gap-lg">
                                <div className="relative">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-32 h-32 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-brand-primary flex items-center justify-center">
                                            <span className="text-white text-5xl font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 p-2 bg-brand-primary text-white rounded-full cursor-pointer hover:bg-brand-primary-dark transition-colors"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        disabled={uploading}
                                    />
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                                        <h2 className="text-h2">{user.name}</h2>
                                        {user.verified && (
                                            <Badge variant="success">✓ Verified</Badge>
                                        )}
                                    </div>
                                    <p className="text-body text-neutral-text-secondary mb-1">
                                        {user.email}
                                    </p>
                                    <Badge variant="default">{user.role}</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Profile Information */}
                    <Card>
                        <div className="p-lg border-b border-neutral-border">
                            <h3 className="text-h3">Profile Information</h3>
                        </div>
                        <div className="p-xl">
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-lg">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        leftIcon={<User className="w-5 h-5" />}
                                        required
                                    />

                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        leftIcon={<Phone className="w-5 h-5" />}
                                        placeholder="+254712345678"
                                        required
                                    />

                                    <Textarea
                                        label="Bio (Optional)"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell us about yourself..."
                                        rows={4}
                                    />

                                    <div className="flex items-center gap-md">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            leftIcon={<Save className="w-4 h-4" />}
                                            isLoading={updating}
                                            disabled={updating}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            leftIcon={<X className="w-4 h-4" />}
                                            onClick={handleCancel}
                                            disabled={updating}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-lg">
                                    <div className="flex items-start gap-4">
                                        <User className="w-5 h-5 text-neutral-text-secondary mt-1" />
                                        <div>
                                            <p className="text-small text-neutral-text-secondary mb-1">Full Name</p>
                                            <p className="text-body font-medium">{user.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Mail className="w-5 h-5 text-neutral-text-secondary mt-1" />
                                        <div>
                                            <p className="text-small text-neutral-text-secondary mb-1">Email</p>
                                            <p className="text-body font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Phone className="w-5 h-5 text-neutral-text-secondary mt-1" />
                                        <div>
                                            <p className="text-small text-neutral-text-secondary mb-1">Phone</p>
                                            <p className="text-body font-medium">{user.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Calendar className="w-5 h-5 text-neutral-text-secondary mt-1" />
                                        <div>
                                            <p className="text-small text-neutral-text-secondary mb-1">Member Since</p>
                                            <p className="text-body font-medium">{formatDate(user.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Account Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                        <Card>
                            <div className="p-lg text-center">
                                <p className="text-small text-neutral-text-secondary mb-2">Account Type</p>
                                <p className="text-h2 font-bold text-brand-primary">{user.role}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-lg text-center">
                                <p className="text-small text-neutral-text-secondary mb-2">Status</p>
                                <Badge variant={user.verified ? 'success' : 'warning'} className="text-base">
                                    {user.verified ? 'Verified' : 'Unverified'}
                                </Badge>
                            </div>
                        </Card>
                        <Card>
                            <div className="p-lg text-center">
                                <p className="text-small text-neutral-text-secondary mb-2">Joined</p>
                                <p className="text-h3 font-bold">{formatDate(user.createdAt)}</p>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
