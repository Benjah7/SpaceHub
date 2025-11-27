'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, FileText, User,
    Mail, Phone, Calendar, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { VerificationUser, VerificationStats } from '@/types';



export default function VerificationDashboard() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
    const [users, setUsers] = useState<VerificationUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<VerificationUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [stats, setStats] = useState<VerificationStats | null>(null);

    useEffect(() => {
        fetchVerifications();
        fetchStats();
    }, [filter]);

    const fetchVerifications = async () => {
        setLoading(true);
        try {
            const data = filter === 'pending'
                ? await apiClient.getPendingVerifications()
                : await apiClient.getAllVerifications(filter === 'all' ? undefined : filter.toUpperCase());

            setUsers(data);
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await apiClient.getVerificationStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async (userId: string) => {
        if (!confirm('Approve this verification?')) return;

        setActionLoading(true);
        try {
            await apiClient.post(`/verification/${userId}/approve`, { notes: '' });
            toast.success('Verification approved');
            fetchVerifications();
            fetchStats();
            setSelectedUser(null);
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedUser || !rejectReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }

        setActionLoading(true);
        try {
            await apiClient.post(`/verification/${selectedUser.id}/reject`, {
                reason: rejectReason
            });
            toast.success('Verification rejected');
            fetchVerifications();
            fetchStats();
            setShowRejectModal(false);
            setSelectedUser(null);
            setRejectReason('');
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            PENDING: 'warning',
            VERIFIED: 'success',
            REJECTED: 'error',
            UNVERIFIED: 'default'
        };
        return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Verification Management</h1>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-secondary">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-status-warning" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-secondary">Verified</p>
                                <p className="text-2xl font-bold">{stats.verified}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-status-success" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-secondary">Rejected</p>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-status-error" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-secondary">Unverified</p>
                                <p className="text-2xl font-bold">{stats.unverified}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-neutral-tertiary" />
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'verified', 'rejected'].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? 'primary' : 'secondary'}
                        onClick={() => setFilter(f as any)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Users List */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : users.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="text-neutral-secondary">No verification requests</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <Card key={user.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4 flex-1">
                                    <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-brand-primary" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{user.name}</h3>
                                            {getStatusBadge(user.verificationStatus)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm text-neutral-secondary mb-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {user.phone}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Joined {formatDate(user.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                {user.documents.length} documents
                                            </div>
                                        </div>

                                        <div className="text-sm text-neutral-secondary">
                                            {user.properties.length} properties listed
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        Review
                                    </Button>
                                    {user.verificationStatus === 'PENDING' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => handleApprove(user.id)}
                                                disabled={actionLoading}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowRejectModal(true);
                                                }}
                                                disabled={actionLoading}
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedUser && !showRejectModal && (
                <Modal
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    title={`Verification Details - ${selectedUser.name}`}
                    size="lg"
                >
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Contact Information</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedUser.verificationStatus)}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Verification Documents</h3>
                            {selectedUser.documents.length === 0 ? (
                                <p className="text-neutral-secondary text-sm">No documents uploaded</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedUser.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-bg rounded">
                                            <div>
                                                <p className="font-medium text-sm">{doc.type.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-neutral-secondary">{doc.filename}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => window.open(doc.url, '_blank')}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Properties ({selectedUser.properties.length})</h3>
                            {selectedUser.properties.length === 0 ? (
                                <p className="text-neutral-secondary text-sm">No properties listed</p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedUser.properties.map((prop) => (
                                        <div key={prop.id} className="p-2 bg-neutral-bg rounded text-sm">
                                            <p className="font-medium">{prop.propertyName}</p>
                                            <p className="text-neutral-secondary text-xs">Status: {prop.status}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUser.verificationStatus === 'PENDING' && (
                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    variant="primary"
                                    onClick={() => handleApprove(selectedUser.id)}
                                    disabled={actionLoading}
                                >
                                    Approve Verification
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedUser && (
                <Modal
                    isOpen={showRejectModal}
                    onClose={() => {
                        setShowRejectModal(false);
                        setRejectReason('');
                    }}
                    title="Reject Verification"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-secondary">
                            Please provide a reason for rejection. This will be sent to the user.
                        </p>
                        <Textarea
                            label="Rejection Reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., ID document is unclear, missing business permit..."
                            rows={4}
                            required
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                isLoading={actionLoading}
                            >
                                Reject Verification
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}