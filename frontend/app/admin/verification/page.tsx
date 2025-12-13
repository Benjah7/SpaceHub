'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, FileText, Phone, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import type { VerificationUser, VerificationStats } from '@/types';

export default function VerificationPage(): JSX.Element {
    const [users, setUsers] = useState<VerificationUser[]>([]);
    const [stats, setStats] = useState<VerificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<VerificationUser | null>(null);
    const [viewingDocument, setViewingDocument] = useState<{
        id: string;
        filename: string;
        url: string;
        type: string;
        createdAt: string;
    } | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchVerifications();
        fetchStats();
    }, [filter]);

    const fetchVerifications = async (): Promise<void> => {
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

    const fetchStats = async (): Promise<void> => {
        try {
            const data = await apiClient.getVerificationStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async (userId: string): Promise<void> => {
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

    const handleReject = async (): Promise<void> => {
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

    const getStatusBadge = (status: string): JSX.Element => {
        const variants: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
            PENDING: 'warning',
            VERIFIED: 'success',
            REJECTED: 'error',
            UNVERIFIED: 'default'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Account Verification</h1>
                    <p className="text-neutral-secondary">
                        Review and approve property owner verification requests
                    </p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card className="p-4">
                            <p className="text-sm text-neutral-secondary mb-1">Unverified</p>
                            <p className="text-2xl font-bold">{stats.unverified}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-neutral-secondary mb-1">Pending</p>
                            <p className="text-2xl font-bold text-status-warning">{stats.pending}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-neutral-secondary mb-1">Verified</p>
                            <p className="text-2xl font-bold text-status-success">{stats.verified}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-neutral-secondary mb-1">Rejected</p>
                            <p className="text-2xl font-bold text-status-error">{stats.rejected}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-neutral-secondary mb-1">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2">
                    {[
                        { value: 'pending', label: 'Pending', count: stats?.pending || 0 },
                        { value: 'all', label: 'All' },
                        { value: 'verified', label: 'Verified', count: stats?.verified || 0 },
                        { value: 'rejected', label: 'Rejected', count: stats?.rejected || 0 }
                    ].map(({ value, label, count }) => (
                        <Button
                            key={value}
                            variant={filter === value ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter(value)}
                        >
                            {label}
                            {count !== undefined && ` (${count})`}
                        </Button>
                    ))}
                </div>

                {/* Search */}
                <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Users List */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-neutral-secondary">Loading...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-neutral-secondary">No users found</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredUsers.map((user) => (
                            <Card key={user.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg">{user.name}</h3>
                                            {getStatusBadge(user.verificationStatus)}
                                        </div>

                                        <div className="space-y-1 text-sm text-neutral-secondary">
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

                                        <div className="text-sm text-neutral-secondary mt-2">
                                            {user.properties.length} properties listed
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
                                                    onClick={() => setViewingDocument(doc)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
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
                                        {selectedUser.properties.map((property) => (
                                            <div key={property.id} className="p-3 bg-neutral-bg rounded">
                                                <p className="font-medium text-sm">{property.propertyName}</p>
                                                <p className="text-xs text-neutral-secondary">
                                                    Status: {property.status}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedUser.verificationStatus === 'PENDING' && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setSelectedUser(null);
                                            handleApprove(selectedUser.id);
                                        }}
                                        disabled={actionLoading}
                                        isLoading={actionLoading}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Verification
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={actionLoading}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Verification
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}

                {/* Document Viewer Modal */}
                {viewingDocument && (
                    <DocumentViewer
                        document={viewingDocument}
                        isOpen={!!viewingDocument}
                        onClose={() => setViewingDocument(null)}
                    />
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
                        size="md"
                    >
                        <div className="space-y-4">
                            <p className="text-sm text-neutral-secondary">
                                Please provide a reason for rejecting this verification request.
                                This will be sent to the user.
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
        </div>
    );
}